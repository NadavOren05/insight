import { AppError } from '../middleware/appError.js'
import { aiService, type AIService } from './aiService.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type {
  RelevantAbsence,
  StudentOverviewResponse,
  SubjectDetailResponse,
  SubjectOverview,
} from '../types/api.js'
import type { AttendanceWithTopic, GradeWithTopic, RiskLevel } from '../types/database.js'

const riskFromGrades = (grades: GradeWithTopic[]): RiskLevel => {
  const gaps = grades.map((grade) => grade.score - (grade.classAverage ?? grade.score))

  if (gaps.some((gap) => gap <= -10)) {
    return 'red'
  }

  if (gaps.some((gap) => gap < -3)) {
    return 'yellow'
  }

  return 'green'
}

const weakTopicIdsFromGrades = (grades: GradeWithTopic[]): Set<string> =>
  new Set(
    grades
      .filter((grade) => grade.topicId !== null)
      .filter((grade) => grade.score - (grade.classAverage ?? grade.score) <= -3)
      .map((grade) => grade.topicId ?? ''),
  )

const relevantAbsencesFromAttendance = (
  attendance: AttendanceWithTopic[],
  weakTopicIds?: Set<string>,
): RelevantAbsence[] =>
  attendance
    .filter((item) => !item.isPresent && item.topicId !== null && item.topicName !== null)
    .filter((item) => (weakTopicIds ? weakTopicIds.has(item.topicId ?? '') : true))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      date: item.lessonDate,
      topicId: item.topicId ?? '',
      topicName: item.topicName ?? '',
    }))

export class StudentService {
  private readonly repository: StudentRepository

  private readonly ai: AIService

  public constructor(
    repository: StudentRepository = studentRepository,
    ai: AIService = aiService,
  ) {
    this.repository = repository
    this.ai = ai
  }

  public async getOverview(studentId: string): Promise<StudentOverviewResponse> {
    const student = await this.repository.findStudentById(studentId)

    if (!student) {
      throw new AppError('Student was not found', 404)
    }

    const subjects = await this.repository.listSubjectsForStudent(studentId)
    const subjectSummaries = await Promise.all(
      subjects.map(async (subject): Promise<SubjectOverview> => {
        const grades = await this.repository.listGradesForSubject(studentId, subject.id)
        const attendance = await this.repository.listAttendanceForSubject(studentId, subject.id)
        const weakTopicIds = weakTopicIdsFromGrades(grades)
        const relevantAbsences = relevantAbsencesFromAttendance(attendance, weakTopicIds)

        return {
          id: subject.id,
          name: subject.name,
          riskLevel: riskFromGrades(grades),
          summary:
            relevantAbsences.length > 0
              ? `ייתכן שיש קשר בין החמצות בנושא ${relevantAbsences[0]?.topicName} לבין הקושי הנוכחי.`
              : 'הנתונים האחרונים יציבים, מומלץ להמשיך במעקב קצר.',
          missingLessons: Array.from(new Set(relevantAbsences.map((absence) => absence.topicName))),
        }
      }),
    )

    return {
      student: {
        id: student.id,
        name: student.fullName,
        grade: student.gradeLevel,
      },
      aiSummary: subjectSummaries[0]?.summary ?? 'טרם נאספו מספיק נתונים לניתוח מלא.',
      subjects: subjectSummaries,
    }
  }

  public async getSubjectDetail(
    studentId: string,
    subjectId: string,
  ): Promise<SubjectDetailResponse> {
    const subject = await this.repository.findSubjectById(subjectId)

    if (!subject) {
      throw new AppError('Subject was not found', 404)
    }

    const [grades, attendance, topics, analysis] = await Promise.all([
      this.repository.listGradesForSubject(studentId, subjectId),
      this.repository.listAttendanceForSubject(studentId, subjectId),
      this.repository.listTopicsForSubject(subjectId),
      this.ai.getOrCreateAnalysis(studentId, subjectId),
    ])
    const weakTopicIds = weakTopicIdsFromGrades(grades)
    const relevantAbsences = relevantAbsencesFromAttendance(attendance, weakTopicIds)
    const relevantTopicIds = new Set([
      ...grades.flatMap((grade) => (grade.topicId ? [grade.topicId] : [])),
      ...attendance.flatMap((item) => (item.topicId ? [item.topicId] : [])),
    ])
    const presentCount = attendance.filter((item) => item.isPresent).length
    const attendancePercentage =
      attendance.length === 0 ? 100 : Math.round((presentCount / attendance.length) * 100)

    return {
      studentId,
      subjectId,
      name: subject.name,
      riskLevel: analysis.riskLevel,
      aiSummary: analysis.summary,
      topics: topics
        .filter((topic) => relevantTopicIds.has(topic.id))
        .map((topic) => ({
          id: topic.id,
          name: topic.name,
          status: weakTopicIds.has(topic.id) ? 'needs-support' : 'strong',
        })),
      attendance: {
        percentage: attendancePercentage,
        attendanceFlag: relevantAbsences.length > 0,
        relevantAbsences,
      },
      grades: grades.map((grade) => ({
        id: grade.id,
        date: grade.assessedAt,
        topic: grade.topicName ?? 'כללי',
        type: grade.assessmentType,
        score: grade.score,
        classAvg: grade.classAverage ?? grade.score,
      })),
    }
  }
}

export const studentService = new StudentService()

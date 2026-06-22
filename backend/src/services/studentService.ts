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

const CLASS_AVERAGE_PERCENT = 80

const sourceFromItems = (items: Array<{ _source?: 'database' | 'mock' }>, fallback: 'database' | 'mock'): 'database' | 'mock' =>
  items.some((item) => item._source === 'database') ? 'database' : fallback

const gradePercent = (grade: GradeWithTopic): number =>
  grade.maxScore === 0 ? 0 : Math.round((grade.score / grade.maxScore) * 100)

const riskFromAnalysisScore = (riskLevel: number | null): RiskLevel | null => {
  if (riskLevel === null) {
    return null
  }

  if (riskLevel >= 7) {
    return 'red'
  }

  if (riskLevel >= 4) {
    return 'yellow'
  }

  return 'green'
}

const riskFromGrades = (grades: GradeWithTopic[]): RiskLevel => {
  const percentages = grades.map(gradePercent)

  if (percentages.some((score) => score < 70)) {
    return 'red'
  }

  if (percentages.some((score) => score < 80)) {
    return 'yellow'
  }

  return 'green'
}

const weakTopicIdsFromGrades = (grades: GradeWithTopic[]): Set<string> =>
  new Set(
    grades
      .filter((grade) => gradePercent(grade) < 80)
      .map((grade) => grade.topicId),
  )

const relevantAbsencesFromAttendance = (
  attendance: AttendanceWithTopic[],
  weakTopicIds?: Set<string>,
): RelevantAbsence[] =>
  attendance
    .filter((item) => item.status !== 'present' && item.topicName !== null)
    .filter((item) => (weakTopicIds ? weakTopicIds.has(item.topicId) : true))
    .slice(0, 4)
    .map((item) => ({
      _source: item._source ?? 'mock',
      id: item.id,
      date: item.date,
      topicId: item.topicId,
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

    const classRow = await this.repository.findClassById(student.classId)
    const subjects = await this.repository.listSubjectsForStudent(studentId)
    const subjectSummaries = await Promise.all(
      subjects.map(async (subject): Promise<SubjectOverview> => {
        const grades = await this.repository.listGradesForSubject(studentId, subject.id)
        const attendance = await this.repository.listAttendanceForSubject(studentId, subject.id)
        const weakTopicIds = weakTopicIdsFromGrades(grades)
        const relevantAbsences = relevantAbsencesFromAttendance(attendance, weakTopicIds)
        const subjectRisk = riskFromGrades(grades)

        return {
          _source: subject._source ?? sourceFromItems([...grades, ...attendance], 'mock'),
          id: subject.id,
          name: subject.name,
          riskLevel: subjectRisk,
          summary:
            relevantAbsences.length > 0
              ? `ייתכן שיש קשר בין החמצות בנושא ${relevantAbsences[0]?.topicName} לבין הקושי הנוכחי.`
              : subjectRisk === 'green'
                ? 'הנתונים האחרונים חזקים, כדאי לשמר מומנטום עם אתגר קצר.'
                : 'הנתונים האחרונים מצביעים על צורך בתרגול קצר וממוקד.',
          missingLessons: Array.from(new Set(relevantAbsences.map((absence) => absence.topicName))),
        }
      }),
    )
    const analysis = await this.repository.findAnalysisForToday(studentId)

    return {
      student: {
        _source: student._source ?? 'mock',
        id: student.id,
        name: student.fullName,
        grade: classRow ? `כיתה ${classRow.grade}` : '',
      },
      aiSummary: {
        _source: analysis?._source ?? 'mock',
        text:
          analysis?.parentSummary ??
          subjectSummaries.find((summary) => summary.riskLevel === 'red')?.summary ??
          'טרם נאספו מספיק נתונים לניתוח מלא.',
      },
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
      ...grades.map((grade) => grade.topicId),
      ...attendance.map((item) => item.topicId),
    ])
    const presentCount = attendance.filter((item) => item.status === 'present').length
    const attendancePercentage =
      attendance.length === 0 ? 100 : Math.round((presentCount / attendance.length) * 100)
    const derivedRisk = riskFromGrades(grades)

    return {
      _source: subject._source ?? 'mock',
      studentId,
      subjectId,
      name: subject.name,
      riskLevel: riskFromAnalysisScore(analysis.riskLevel) ?? derivedRisk,
      aiSummary: {
        _source: analysis._source ?? 'mock',
        text:
          analysis.parentSummary ??
          (relevantAbsences.length > 0
            ? `יש קושי בנושא ${relevantAbsences[0]?.topicName}, והחמצות באותו נושא מחזקות את ההשערה שכדאי להשלים אותו קודם.`
            : 'הנתונים מצביעים על תמונה יציבה יחסית. כדאי לבחור פעולה קצרה אחת להערב.'),
      },
      topics: topics
        .filter((topic) => relevantTopicIds.has(topic.id))
        .map((topic) => ({
          _source: topic._source ?? 'mock',
          id: topic.id,
          name: topic.name,
          status: weakTopicIds.has(topic.id) ? 'needs-support' : 'strong',
        })),
      attendance: {
        _source: sourceFromItems(attendance, 'mock'),
        percentage: attendancePercentage,
        attendanceFlag: relevantAbsences.length > 0,
        relevantAbsences,
      },
      grades: grades.map((grade) => ({
        _source: grade._source ?? 'mock',
        id: grade.id,
        date: grade.date,
        topic: grade.topicName ?? 'כללי',
        type: grade.type,
        score: gradePercent(grade),
        classAvg: CLASS_AVERAGE_PERCENT,
      })),
    }
  }
}

export const studentService = new StudentService()

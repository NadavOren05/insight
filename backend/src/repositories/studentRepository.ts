import type { SupabaseClient } from '@supabase/supabase-js'
import {
  mockAnalyses,
  mockAnalysisTopics,
  mockAttendance,
  mockGrades,
  mockParents,
  mockStudentParents,
  mockStudents,
  mockSubjects,
  mockTopics,
} from '../data/mockData.js'
import { env } from '../lib/env.js'
import { supabase } from '../lib/supabase.js'
import { AppError } from '../middleware/appError.js'
import type {
  AIAnalysisTopic,
  AttendanceWithTopic,
  GradeWithTopic,
  Parent,
  Student,
  StudentAIAnalysis,
  Subject,
  Topic,
} from '../types/database.js'

interface ParentWithChildren {
  parent: Parent
  children: Student[]
}

interface AnalysisInput {
  studentId: string
  subjectId: string
  summary: string
  riskLevel: StudentAIAnalysis['riskLevel']
  rawResponse: unknown
}

interface AnalysisTopicInput {
  analysisId: string
  topicId: string
  status: AIAnalysisTopic['status']
  explanation: string | null
}

const mapParent = (row: Record<string, unknown>): Parent => ({
  id: String(row.id),
  fullName: String(row.full_name ?? row.fullName ?? ''),
  phone: String(row.phone ?? ''),
  email: row.email === null || row.email === undefined ? null : String(row.email),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapStudent = (row: Record<string, unknown>): Student => ({
  id: String(row.id),
  schoolId: String(row.school_id ?? row.schoolId ?? ''),
  classId: String(row.class_id ?? row.classId ?? ''),
  fullName: String(row.full_name ?? row.fullName ?? ''),
  gradeLevel: String(row.grade_level ?? row.gradeLevel ?? ''),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapSubject = (row: Record<string, unknown>): Subject => ({
  id: String(row.id),
  schoolId: String(row.school_id ?? row.schoolId ?? ''),
  name: String(row.name ?? ''),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const ensureRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

export class StudentRepository {
  private readonly client: SupabaseClient

  private readonly useRealDb: boolean

  public constructor(client: SupabaseClient = supabase) {
    this.client = client
    this.useRealDb = env.USE_REAL_DB
  }

  public async findParentWithChildren(identifier: string): Promise<ParentWithChildren | null> {
    if (!this.useRealDb) {
      const trimmedIdentifier = identifier.trim()
      const baseParent = mockParents.find((item) =>
        trimmedIdentifier === 'נדב' ? item.id === 'parent-nadav' : item.id === 'parent-single',
      )

      if (!baseParent) {
        return null
      }

      const parent: Parent =
        trimmedIdentifier === 'נדב'
          ? baseParent
          : {
              id: baseParent.id,
              fullName: trimmedIdentifier || 'דנה',
              phone: baseParent.phone,
              email: baseParent.email,
              createdAt: baseParent.createdAt,
            }

      const relations = mockStudentParents.filter((relation) => relation.parentId === parent.id)
      const children = relations
        .map((relation) => mockStudents.find((student) => student.id === relation.studentId))
        .filter((student): student is Student => Boolean(student))

      return {
        parent,
        children,
      }
    }

    const { data, error } = await this.client
      .from('parents')
      .select(
        `
        id,
        full_name,
        phone,
        email,
        created_at,
        student_parents (
          students (
            id,
            school_id,
            class_id,
            full_name,
            grade_level,
            created_at
          )
        )
      `,
      )
      .or(`phone.eq.${identifier},full_name.ilike.%${identifier}%`)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch parent', 500, error.message)
    }

    if (!data) {
      return null
    }

    const row = ensureRecord(data)
    const relations = Array.isArray(row.student_parents) ? row.student_parents : []
    const children = relations
      .map((relation) => ensureRecord(relation).students)
      .map((student) => mapStudent(ensureRecord(student)))
      .filter((student) => student.id.length > 0)

    return {
      parent: mapParent(row),
      children,
    }
  }

  public async findStudentById(studentId: string): Promise<Student | null> {
    if (!this.useRealDb) {
      return mockStudents.find((student) => student.id === studentId) ?? null
    }

    const { data, error } = await this.client.from('students').select('*').eq('id', studentId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch student', 500, error.message)
    }

    return data ? mapStudent(ensureRecord(data)) : null
  }

  public async listSubjectsForStudent(studentId: string): Promise<Subject[]> {
    if (!this.useRealDb) {
      const subjectIds = new Set([
        ...mockGrades.filter((grade) => grade.studentId === studentId).map((grade) => grade.subjectId),
        ...mockAttendance
          .filter((attendance) => attendance.studentId === studentId)
          .map((attendance) => attendance.subjectId),
        ...mockAnalyses
          .filter((analysis) => analysis.studentId === studentId)
          .map((analysis) => analysis.subjectId),
      ])

      return mockSubjects.filter((subject) => subjectIds.has(subject.id))
    }

    const { data, error } = await this.client
      .from('grades')
      .select('subjects ( id, school_id, name, created_at )')
      .eq('student_id', studentId)

    if (error) {
      throw new AppError('Failed to fetch student subjects', 500, error.message)
    }

    const rows = Array.isArray(data) ? data : []
    const subjects = rows
      .map((row) => ensureRecord(row).subjects)
      .map((subject) => mapSubject(ensureRecord(subject)))
      .filter((subject) => subject.id.length > 0)

    return Array.from(new Map(subjects.map((subject) => [subject.id, subject])).values())
  }

  public async findSubjectById(subjectId: string): Promise<Subject | null> {
    if (!this.useRealDb) {
      return mockSubjects.find((subject) => subject.id === subjectId) ?? null
    }

    const { data, error } = await this.client.from('subjects').select('*').eq('id', subjectId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch subject', 500, error.message)
    }

    return data ? mapSubject(ensureRecord(data)) : null
  }

  public async listGradesForSubject(studentId: string, subjectId: string): Promise<GradeWithTopic[]> {
    if (!this.useRealDb) {
      return mockGrades
        .filter((grade) => grade.studentId === studentId && grade.subjectId === subjectId)
        .sort((firstGrade, secondGrade) => secondGrade.assessedAt.localeCompare(firstGrade.assessedAt))
        .map((grade) => ({
          ...grade,
          topicName: mockTopics.find((topic) => topic.id === grade.topicId)?.name ?? null,
        }))
    }

    const { data, error } = await this.client
      .from('grades')
      .select('*, topics ( name )')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .order('assessed_at', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch grades', 500, error.message)
    }

    return (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const topic = ensureRecord(record.topics)

      return {
        id: String(record.id),
        studentId: String(record.student_id ?? ''),
        subjectId: String(record.subject_id ?? ''),
        topicId: record.topic_id === null || record.topic_id === undefined ? null : String(record.topic_id),
        score: Number(record.score ?? 0),
        classAverage:
          record.class_average === null || record.class_average === undefined
            ? null
            : Number(record.class_average),
        assessmentType: String(record.assessment_type ?? ''),
        assessedAt: String(record.assessed_at ?? ''),
        topicName: topic.name === undefined || topic.name === null ? null : String(topic.name),
      }
    })
  }

  public async listAttendanceForSubject(
    studentId: string,
    subjectId: string,
  ): Promise<AttendanceWithTopic[]> {
    if (!this.useRealDb) {
      return mockAttendance
        .filter((attendance) => attendance.studentId === studentId && attendance.subjectId === subjectId)
        .sort((firstAttendance, secondAttendance) =>
          secondAttendance.lessonDate.localeCompare(firstAttendance.lessonDate),
        )
        .map((attendance) => ({
          ...attendance,
          topicName: mockTopics.find((topic) => topic.id === attendance.topicId)?.name ?? null,
        }))
    }

    const { data, error } = await this.client
      .from('attendance')
      .select('*, topics ( name )')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .order('lesson_date', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch attendance', 500, error.message)
    }

    return (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const topic = ensureRecord(record.topics)

      return {
        id: String(record.id),
        studentId: String(record.student_id ?? ''),
        subjectId: String(record.subject_id ?? ''),
        topicId: record.topic_id === null || record.topic_id === undefined ? null : String(record.topic_id),
        lessonDate: String(record.lesson_date ?? ''),
        isPresent: Boolean(record.is_present),
        createdAt: String(record.created_at ?? ''),
        topicName: topic.name === undefined || topic.name === null ? null : String(topic.name),
      }
    })
  }

  public async findAnalysisForToday(
    studentId: string,
    subjectId: string,
  ): Promise<StudentAIAnalysis | null> {
    if (!this.useRealDb) {
      const today = new Date().toISOString().slice(0, 10)
      return (
        mockAnalyses.find(
          (analysis) =>
            analysis.studentId === studentId &&
            analysis.subjectId === subjectId &&
            analysis.generatedAt.slice(0, 10) === today,
        ) ??
        mockAnalyses.find(
          (analysis) => analysis.studentId === studentId && analysis.subjectId === subjectId,
        ) ??
        null
      )
    }

    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await this.client
      .from('student_ai_analysis')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .gte('generated_at', `${today}T00:00:00.000Z`)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch AI analysis cache', 500, error.message)
    }

    if (!data) {
      return null
    }

    const record = ensureRecord(data)

    return {
      id: String(record.id),
      studentId: String(record.student_id ?? ''),
      subjectId: String(record.subject_id ?? ''),
      summary: String(record.summary ?? ''),
      riskLevel: record.risk_level === 'red' || record.risk_level === 'green' ? record.risk_level : 'yellow',
      rawResponse: record.raw_response,
      generatedAt: String(record.generated_at ?? ''),
      createdAt: String(record.created_at ?? ''),
    }
  }

  public async listTopicsForSubject(subjectId: string): Promise<Topic[]> {
    if (!this.useRealDb) {
      return mockTopics.filter((topic) => topic.subjectId === subjectId)
    }

    const { data, error } = await this.client.from('topics').select('*').eq('subject_id', subjectId)

    if (error) {
      throw new AppError('Failed to fetch topics', 500, error.message)
    }

    return (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)

      return {
        id: String(record.id),
        subjectId: String(record.subject_id ?? ''),
        name: String(record.name ?? ''),
        createdAt: String(record.created_at ?? ''),
      }
    })
  }

  public async saveAnalysis(input: AnalysisInput): Promise<StudentAIAnalysis> {
    if (!this.useRealDb) {
      const analysis: StudentAIAnalysis = {
        id: `analysis-${input.studentId}-${input.subjectId}-${Date.now()}`,
        studentId: input.studentId,
        subjectId: input.subjectId,
        summary: input.summary,
        riskLevel: input.riskLevel,
        rawResponse: input.rawResponse,
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      mockAnalyses.push(analysis)
      return analysis
    }

    const { data, error } = await this.client
      .from('student_ai_analysis')
      .insert({
        student_id: input.studentId,
        subject_id: input.subjectId,
        summary: input.summary,
        risk_level: input.riskLevel,
        raw_response: input.rawResponse,
        generated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      throw new AppError('Failed to save AI analysis', 500, error.message)
    }

    const record = ensureRecord(data)

    return {
      id: String(record.id),
      studentId: String(record.student_id ?? ''),
      subjectId: String(record.subject_id ?? ''),
      summary: String(record.summary ?? ''),
      riskLevel: record.risk_level === 'red' || record.risk_level === 'green' ? record.risk_level : 'yellow',
      rawResponse: record.raw_response,
      generatedAt: String(record.generated_at ?? ''),
      createdAt: String(record.created_at ?? ''),
    }
  }

  public async saveAnalysisTopics(inputs: AnalysisTopicInput[]): Promise<void> {
    if (inputs.length === 0) {
      return
    }

    if (!this.useRealDb) {
      mockAnalysisTopics.push(
        ...inputs.map((input) => ({
          id: `analysis-topic-${input.analysisId}-${input.topicId}`,
          analysisId: input.analysisId,
          topicId: input.topicId,
          status: input.status,
          explanation: input.explanation,
        })),
      )
      return
    }

    const { error } = await this.client.from('ai_analysis_topics').insert(
      inputs.map((input) => ({
        analysis_id: input.analysisId,
        topic_id: input.topicId,
        status: input.status,
        explanation: input.explanation,
      })),
    )

    if (error) {
      throw new AppError('Failed to save AI analysis topics', 500, error.message)
    }
  }
}

export const studentRepository = new StudentRepository()

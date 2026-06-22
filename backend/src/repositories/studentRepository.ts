import type { SupabaseClient } from '@supabase/supabase-js'
import {
  mockAnalyses,
  mockAnalysisTopics,
  mockAttendance,
  mockClasses,
  mockDifficultyLevels,
  mockExamQuestions,
  mockGeneratedExams,
  mockGrades,
  mockParentActions,
  mockParents,
  mockQuestionTypes,
  mockQuestionOptions,
  mockQuestions,
  mockRecommendations,
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
  Class,
  DataSource,
  ExamQuestion,
  GeneratedExam,
  GradeWithTopic,
  Parent,
  Question,
  QuestionDifficultyLevel,
  QuestionOption,
  QuestionType,
  QuestionWithOptions,
  Recommendation,
  RecommendationStatus,
  Student,
  StudentAIAnalysis,
  Subject,
  Topic,
} from '../types/database.js'

interface ParentWithChildren {
  parent: Parent
  children: Student[]
}

const withSource = <Item extends object>(item: Item, source: DataSource): Item & { _source: DataSource } => ({
  ...item,
  _source: source,
})

const markAll = <Item extends object>(items: Item[], source: DataSource): Array<Item & { _source: DataSource }> =>
  items.map((item) => withSource(item, source))

const withSourceNullable = <Item extends object>(
  item: Item | null | undefined,
  source: DataSource,
): (Item & { _source: DataSource }) | null => (item ? withSource(item, source) : null)

interface AnalysisInput {
  studentId: string
  parentSummary: string
  riskLevel: number | null
  trend: string | null
  attendanceFlag: boolean
}

interface AnalysisTopicInput {
  analysisId: string
  topicId: string
  type: AIAnalysisTopic['type']
  confidenceScore: number | null
}

interface GeneratedQuestionInput {
  topicId: string
  difficultyLevelId: string
  questionTypeId: string
  questionText: string
  correctAnswer: string | null
  options: Array<{
    optionText: string
    isCorrect: boolean
    sortOrder: number
  }>
}

export interface GeneratedExamWithTopic extends GeneratedExam {
  subjectId: string | null
  topicName: string | null
  questionCount: number
}

const ensureRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

const nullableString = (value: unknown): string | null =>
  value === null || value === undefined ? null : String(value)

const mapParent = (row: Record<string, unknown>): Parent => ({
  _source: 'database',
  id: String(row.id),
  fullName: String(row.full_name ?? row.fullName ?? ''),
  phone: nullableString(row.phone),
  email: nullableString(row.email),
  preferredLanguage: String(row.preferred_language ?? row.preferredLanguage ?? 'he'),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapStudent = (row: Record<string, unknown>): Student => ({
  _source: 'database',
  id: String(row.id),
  fullName: String(row.full_name ?? row.fullName ?? ''),
  classId: String(row.class_id ?? row.classId ?? ''),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapClass = (row: Record<string, unknown>): Class => ({
  _source: 'database',
  id: String(row.id),
  schoolId: String(row.school_id ?? row.schoolId ?? ''),
  name: String(row.name ?? ''),
  grade: Number(row.grade ?? 0),
  homeroomTeacherId: nullableString(row.homeroom_teacher_id ?? row.homeroomTeacherId),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapSubject = (row: Record<string, unknown>): Subject => ({
  _source: 'database',
  id: String(row.id),
  name: String(row.name ?? ''),
  classId: String(row.class_id ?? row.classId ?? ''),
  teacherId: nullableString(row.teacher_id ?? row.teacherId),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapTopic = (row: Record<string, unknown>): Topic => ({
  _source: 'database',
  id: String(row.id),
  subjectId: String(row.subject_id ?? row.subjectId ?? ''),
  name: String(row.name ?? ''),
  taughtDate: nullableString(row.taught_date ?? row.taughtDate),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapAnalysis = (row: Record<string, unknown>): StudentAIAnalysis => ({
  _source: 'database',
  id: String(row.id),
  studentId: String(row.student_id ?? row.studentId ?? ''),
  generatedAt: String(row.generated_at ?? row.generatedAt ?? ''),
  riskLevel: row.risk_level === null || row.risk_level === undefined ? null : Number(row.risk_level),
  trend: nullableString(row.trend),
  attendanceFlag: Boolean(row.attendance_flag ?? row.attendanceFlag ?? false),
  parentSummary: nullableString(row.parent_summary ?? row.parentSummary),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapDifficulty = (row: Record<string, unknown>): QuestionDifficultyLevel => ({
  _source: 'database',
  id: String(row.id),
  code: String(row.code ?? ''),
  name: String(row.name ?? ''),
  description: nullableString(row.description),
  sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapQuestionType = (row: Record<string, unknown>): QuestionType => ({
  _source: 'database',
  id: String(row.id),
  code: String(row.code ?? ''),
  name: String(row.name ?? ''),
  description: nullableString(row.description),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapQuestion = (row: Record<string, unknown>): Question => ({
  _source: 'database',
  id: String(row.id),
  topicId: String(row.topic_id ?? row.topicId ?? ''),
  difficultyLevelId: String(row.difficulty_level_id ?? row.difficultyLevelId ?? ''),
  questionTypeId: String(row.question_type_id ?? row.questionTypeId ?? ''),
  questionText: String(row.question_text ?? row.questionText ?? ''),
  correctAnswer: nullableString(row.correct_answer ?? row.correctAnswer),
  metadataJson:
    typeof (row.metadata_json ?? row.metadataJson) === 'object' && (row.metadata_json ?? row.metadataJson) !== null
      ? (row.metadata_json ?? row.metadataJson) as Record<string, unknown>
      : null,
  source: String(row.source ?? 'human_created'),
  isActive: Boolean(row.is_active ?? row.isActive ?? true),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapQuestionOption = (row: Record<string, unknown>): QuestionOption => ({
  _source: 'database',
  id: String(row.id),
  questionId: String(row.question_id ?? row.questionId ?? ''),
  optionText: String(row.option_text ?? row.optionText ?? ''),
  isCorrect: Boolean(row.is_correct ?? row.isCorrect ?? false),
  sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapGeneratedExam = (row: Record<string, unknown>): GeneratedExam => ({
  _source: 'database',
  id: String(row.id),
  studentId: String(row.student_id ?? row.studentId ?? ''),
  recommendationId: nullableString(row.recommendation_id ?? row.recommendationId),
  targetTopicId: nullableString(row.target_topic_id ?? row.targetTopicId),
  title: String(row.title ?? ''),
  generationReason: nullableString(row.generation_reason ?? row.generationReason),
  status: String(row.status ?? 'generated'),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
  completedAt: nullableString(row.completed_at ?? row.completedAt),
})

const mapExamQuestion = (row: Record<string, unknown>): ExamQuestion => ({
  _source: 'database',
  id: String(row.id),
  examId: String(row.exam_id ?? row.examId ?? ''),
  questionId: String(row.question_id ?? row.questionId ?? ''),
  sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  points: Number(row.points ?? 1),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapAnalysisTopic = (row: Record<string, unknown>): AIAnalysisTopic => ({
  _source: 'database',
  id: String(row.id),
  analysisId: String(row.analysis_id ?? row.analysisId ?? ''),
  topicId: String(row.topic_id ?? row.topicId ?? ''),
  type: String(row.type ?? ''),
  confidenceScore:
    row.confidence_score === null || row.confidence_score === undefined
      ? null
      : Number(row.confidence_score),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

const mapRecommendation = (row: Record<string, unknown>): Recommendation => ({
  _source: 'database',
  id: String(row.id),
  analysisId: String(row.analysis_id ?? row.analysisId ?? ''),
  studentId: String(row.student_id ?? row.studentId ?? ''),
  title: String(row.title ?? ''),
  description: String(row.description ?? ''),
  recommendationType: nullableString(row.recommendation_type ?? row.recommendationType),
  priority: Number(row.priority ?? 0),
  status: String(row.status ?? 'pending'),
  createdAt: String(row.created_at ?? row.createdAt ?? ''),
})

export class StudentRepository {
  private readonly client: SupabaseClient

  private readonly useRealDb: boolean

  public constructor(client: SupabaseClient = supabase) {
    this.client = client
    this.useRealDb = env.USE_REAL_DB
  }

  public isUsingRealDb(): boolean {
    return this.useRealDb
  }

  private canUseMockFallback(): boolean {
    return !this.useRealDb || env.ALLOW_MOCK_FALLBACK
  }

  private findMockParentWithChildren(fullName: string, phone: string): ParentWithChildren | null {
    const trimmedFullName = fullName.trim()
    const trimmedPhone = phone.trim()
    const isNadavDemo = trimmedFullName === 'נדב'
    const baseParent = mockParents.find((item) =>
      isNadavDemo ? item.id === 'parent-nadav' : item.id === 'parent-single',
    )

    if (!baseParent) {
      return null
    }

    const parent: Parent = withSource(
      isNadavDemo
        ? baseParent
        : {
            ...baseParent,
            fullName: trimmedFullName || baseParent.fullName,
            phone: trimmedPhone || baseParent.phone,
          },
      'mock',
    )
    const relations = mockStudentParents.filter((relation) => relation.parentId === parent.id)
    const children = relations
      .map((relation) => mockStudents.find((student) => student.id === relation.studentId))
      .filter((student): student is Student => Boolean(student))
      .map((student) => withSource(student, 'mock'))

    return { parent, children }
  }

  public async findParentWithChildren(fullName: string, phone: string): Promise<ParentWithChildren | null> {
    const trimmedFullName = fullName.trim()
    const trimmedPhone = phone.trim()

    if (!this.useRealDb) {
      return this.findMockParentWithChildren(trimmedFullName, trimmedPhone)
    }

    const { data, error } = await this.client
      .from('parents')
      .select(
        `
        id,
        full_name,
        phone,
        email,
        preferred_language,
        created_at,
        student_parents (
          students (
            id,
            full_name,
            class_id,
            created_at
          )
        )
      `,
      )
      .eq('full_name', trimmedFullName)
      .eq('phone', trimmedPhone)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch parent', 500, error.message)
    }

    if (!data && this.canUseMockFallback()) {
      return this.findMockParentWithChildren(trimmedFullName, trimmedPhone)
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

    return { parent: mapParent(row), children }
  }

  public async findStudentById(studentId: string): Promise<Student | null> {
    if (!this.useRealDb) {
      const student = mockStudents.find((item) => item.id === studentId)
      return student ? withSource(student, 'mock') : null
    }

    const { data, error } = await this.client.from('students').select('*').eq('id', studentId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch student', 500, error.message)
    }

    if (data) {
      return mapStudent(ensureRecord(data))
    }

    if (this.canUseMockFallback()) {
      const mockStudent = mockStudents.find((student) => student.id === studentId)
      return mockStudent ? withSource(mockStudent, 'mock') : null
    }

    return null
  }

  public async findClassById(classId: string): Promise<Class | null> {
    if (!this.useRealDb) {
      const classRow = mockClasses.find((item) => item.id === classId)
      return classRow ? withSource(classRow, 'mock') : null
    }

    const { data, error } = await this.client.from('classes').select('*').eq('id', classId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch class', 500, error.message)
    }

    if (data) {
      return mapClass(ensureRecord(data))
    }

    if (this.canUseMockFallback()) {
      const mockClass = mockClasses.find((item) => item.id === classId)
      return mockClass ? withSource(mockClass, 'mock') : null
    }

    return null
  }

  public async listSubjectsForStudent(studentId: string): Promise<Subject[]> {
    const student = await this.findStudentById(studentId)

    if (!student) {
      return []
    }

    if (!this.useRealDb) {
      const topicSubjectIds = new Set(
        [...mockGrades, ...mockAttendance]
          .filter((item) => item.studentId === studentId)
          .map((item) => mockTopics.find((topic) => topic.id === item.topicId)?.subjectId)
          .filter((subjectId): subjectId is string => Boolean(subjectId)),
      )

      return markAll(
        mockSubjects.filter(
          (subject) => subject.classId === student.classId || topicSubjectIds.has(subject.id),
        ),
        'mock',
      )
    }

    const { data, error } = await this.client
      .from('subjects')
      .select('*')
      .eq('class_id', student.classId)
      .order('name', { ascending: true })

    if (error) {
      throw new AppError('Failed to fetch student subjects', 500, error.message)
    }

    const subjects = (Array.isArray(data) ? data : []).map((row) => mapSubject(ensureRecord(row)))

    if (subjects.length > 0) {
      return subjects
    }

    if (!this.canUseMockFallback()) {
      return []
    }

    const topicSubjectIds = new Set(
      [...mockGrades, ...mockAttendance]
        .filter((item) => item.studentId === studentId)
        .map((item) => mockTopics.find((topic) => topic.id === item.topicId)?.subjectId)
        .filter((subjectId): subjectId is string => Boolean(subjectId)),
    )

    return markAll(
      mockSubjects.filter(
        (subject) => subject.classId === student.classId || topicSubjectIds.has(subject.id),
      ),
      'mock',
    )
  }

  public async findSubjectById(subjectId: string): Promise<Subject | null> {
    if (!this.useRealDb) {
      const subject = mockSubjects.find((item) => item.id === subjectId)
      return subject ? withSource(subject, 'mock') : null
    }

    const { data, error } = await this.client.from('subjects').select('*').eq('id', subjectId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch subject', 500, error.message)
    }

    if (data) {
      return mapSubject(ensureRecord(data))
    }

    if (this.canUseMockFallback()) {
      const mockSubject = mockSubjects.find((subject) => subject.id === subjectId)
      return mockSubject ? withSource(mockSubject, 'mock') : null
    }

    return null
  }

  public async listTopicsForSubject(subjectId: string): Promise<Topic[]> {
    if (!this.useRealDb) {
      return markAll(mockTopics.filter((topic) => topic.subjectId === subjectId), 'mock')
    }

    const { data, error } = await this.client.from('topics').select('*').eq('subject_id', subjectId)

    if (error) {
      throw new AppError('Failed to fetch topics', 500, error.message)
    }

    const topics = (Array.isArray(data) ? data : []).map((row) => mapTopic(ensureRecord(row)))

    if (topics.length > 0 || !this.canUseMockFallback()) {
      return topics
    }

    return markAll(mockTopics.filter((topic) => topic.subjectId === subjectId), 'mock')
  }

  public async findTopicById(topicId: string): Promise<Topic | null> {
    if (!this.useRealDb) {
      const topic = mockTopics.find((item) => item.id === topicId)
      return topic ? withSource(topic, 'mock') : null
    }

    const { data, error } = await this.client.from('topics').select('*').eq('id', topicId).maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch topic', 500, error.message)
    }

    if (data) {
      return mapTopic(ensureRecord(data))
    }

    if (this.canUseMockFallback()) {
      const mockTopic = mockTopics.find((topic) => topic.id === topicId)
      return mockTopic ? withSource(mockTopic, 'mock') : null
    }

    return null
  }

  public async listGradesForSubject(studentId: string, subjectId: string): Promise<GradeWithTopic[]> {
    if (!this.useRealDb) {
      return mockGrades
        .filter((grade) => {
          const topic = mockTopics.find((item) => item.id === grade.topicId)
          return grade.studentId === studentId && topic?.subjectId === subjectId
        })
        .sort((firstGrade, secondGrade) => secondGrade.date.localeCompare(firstGrade.date))
        .map((grade) => {
          const topic = mockTopics.find((item) => item.id === grade.topicId)
          return {
            ...grade,
            _source: 'mock',
            topicName: topic?.name ?? null,
            subjectId: topic?.subjectId ?? null,
          }
        })
    }

    const { data, error } = await this.client
      .from('grades')
      .select('*, topics!inner ( id, subject_id, name )')
      .eq('student_id', studentId)
      .eq('topics.subject_id', subjectId)
      .order('date', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch grades', 500, error.message)
    }

    const grades = (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const topic = ensureRecord(record.topics)

      return {
        _source: 'database' as const,
        id: String(record.id),
        studentId: String(record.student_id ?? ''),
        topicId: String(record.topic_id ?? ''),
        type: String(record.type ?? ''),
        score: Number(record.score ?? 0),
        maxScore: Number(record.max_score ?? 100),
        date: String(record.date ?? ''),
        notes: nullableString(record.notes),
        createdAt: String(record.created_at ?? ''),
        topicName: nullableString(topic.name),
        subjectId: nullableString(topic.subject_id),
      }
    })

    if (grades.length > 0) {
      return grades
    }

    if (!this.canUseMockFallback()) {
      return []
    }

    return mockGrades
      .filter((grade) => {
        const topic = mockTopics.find((item) => item.id === grade.topicId)
        return grade.studentId === studentId && topic?.subjectId === subjectId
      })
      .sort((firstGrade, secondGrade) => secondGrade.date.localeCompare(firstGrade.date))
      .map((grade) => {
        const topic = mockTopics.find((item) => item.id === grade.topicId)
        return {
          ...grade,
          _source: 'mock',
          topicName: topic?.name ?? null,
          subjectId: topic?.subjectId ?? null,
        }
      })
  }

  public async listAttendanceForSubject(
    studentId: string,
    subjectId: string,
  ): Promise<AttendanceWithTopic[]> {
    if (!this.useRealDb) {
      return mockAttendance
        .filter((attendance) => {
          const topic = mockTopics.find((item) => item.id === attendance.topicId)
          return attendance.studentId === studentId && topic?.subjectId === subjectId
        })
        .sort((firstAttendance, secondAttendance) => secondAttendance.date.localeCompare(firstAttendance.date))
        .map((attendance) => {
          const topic = mockTopics.find((item) => item.id === attendance.topicId)
          return {
            ...attendance,
            _source: 'mock',
            topicName: topic?.name ?? null,
            subjectId: topic?.subjectId ?? null,
          }
        })
    }

    const { data, error } = await this.client
      .from('attendance')
      .select('*, topics!inner ( id, subject_id, name )')
      .eq('student_id', studentId)
      .eq('topics.subject_id', subjectId)
      .order('date', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch attendance', 500, error.message)
    }

    const attendanceRows = (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const topic = ensureRecord(record.topics)

      return {
        _source: 'database' as const,
        id: String(record.id),
        studentId: String(record.student_id ?? ''),
        topicId: String(record.topic_id ?? ''),
        date: String(record.date ?? ''),
        status: String(record.status ?? ''),
        createdAt: String(record.created_at ?? ''),
        topicName: nullableString(topic.name),
        subjectId: nullableString(topic.subject_id),
      }
    })

    if (attendanceRows.length > 0) {
      return attendanceRows
    }

    if (!this.canUseMockFallback()) {
      return []
    }

    return mockAttendance
      .filter((attendance) => {
        const topic = mockTopics.find((item) => item.id === attendance.topicId)
        return attendance.studentId === studentId && topic?.subjectId === subjectId
      })
      .sort((firstAttendance, secondAttendance) => secondAttendance.date.localeCompare(firstAttendance.date))
      .map((attendance) => {
        const topic = mockTopics.find((item) => item.id === attendance.topicId)
        return {
          ...attendance,
          _source: 'mock',
          topicName: topic?.name ?? null,
          subjectId: topic?.subjectId ?? null,
        }
      })
  }

  public async findAnalysisForToday(studentId: string): Promise<StudentAIAnalysis | null> {
    if (!this.useRealDb) {
      const today = new Date().toISOString().slice(0, 10)
      return (
        withSourceNullable(mockAnalyses.find(
          (analysis) => analysis.studentId === studentId && analysis.generatedAt.slice(0, 10) === today,
        ) ?? mockAnalyses.find((analysis) => analysis.studentId === studentId), 'mock')
      )
    }

    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await this.client
      .from('student_ai_analysis')
      .select('*')
      .eq('student_id', studentId)
      .gte('generated_at', `${today}T00:00:00.000Z`)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch AI analysis cache', 500, error.message)
    }

    if (data) {
      return mapAnalysis(ensureRecord(data))
    }

    if (this.canUseMockFallback()) {
      const mockAnalysis = mockAnalyses.find((analysis) => analysis.studentId === studentId)
      return mockAnalysis ? withSource(mockAnalysis, 'mock') : null
    }

    return null
  }

  public async saveAnalysis(input: AnalysisInput): Promise<StudentAIAnalysis> {
    if (!this.useRealDb) {
      const analysis: StudentAIAnalysis = {
        _source: 'mock',
        id: `analysis-${input.studentId}-${Date.now()}`,
        studentId: input.studentId,
        generatedAt: new Date().toISOString(),
        riskLevel: input.riskLevel,
        trend: input.trend,
        attendanceFlag: input.attendanceFlag,
        parentSummary: input.parentSummary,
        createdAt: new Date().toISOString(),
      }
      mockAnalyses.push(analysis)
      return analysis
    }

    const { data, error } = await this.client
      .from('student_ai_analysis')
      .insert({
        student_id: input.studentId,
        generated_at: new Date().toISOString(),
        risk_level: input.riskLevel,
        trend: input.trend,
        attendance_flag: input.attendanceFlag,
        parent_summary: input.parentSummary,
      })
      .select('*')
      .single()

    if (error) {
      throw new AppError('Failed to save AI analysis', 500, error.message)
    }

    return mapAnalysis(ensureRecord(data))
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
          type: input.type,
          confidenceScore: input.confidenceScore,
          createdAt: new Date().toISOString(),
        })),
      )
      return
    }

    const { error } = await this.client.from('ai_analysis_topics').insert(
      inputs.map((input) => ({
        analysis_id: input.analysisId,
        topic_id: input.topicId,
        type: input.type,
        confidence_score: input.confidenceScore,
      })),
    )

    if (error) {
      throw new AppError('Failed to save AI analysis topics', 500, error.message)
    }
  }

  public async listPendingPracticeRecommendations(studentId: string): Promise<Recommendation[]> {
    if (!this.useRealDb) {
      return markAll(
        mockRecommendations
          .filter(
            (recommendation) =>
              recommendation.studentId === studentId &&
              recommendation.status === 'pending' &&
              recommendation.recommendationType === 'practice',
          )
          .sort((first, second) => first.priority - second.priority || second.createdAt.localeCompare(first.createdAt)),
        'mock',
      )
    }

    const { data, error } = await this.client
      .from('recommendations')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .eq('recommendation_type', 'practice')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch recommendations', 500, error.message)
    }

    const recommendations = (Array.isArray(data) ? data : []).map((row) =>
      mapRecommendation(ensureRecord(row)),
    )

    if (recommendations.length > 0 || !this.canUseMockFallback()) {
      return recommendations
    }

    return markAll(
      mockRecommendations
        .filter(
          (recommendation) =>
            recommendation.studentId === studentId &&
            recommendation.status === 'pending' &&
            recommendation.recommendationType === 'practice',
        )
        .sort((first, second) => first.priority - second.priority || second.createdAt.localeCompare(first.createdAt)),
      'mock',
    )
  }

  public async listAnalysisTopics(analysisId: string): Promise<AIAnalysisTopic[]> {
    if (!this.useRealDb) {
      return markAll(
        mockAnalysisTopics.filter((analysisTopic) => analysisTopic.analysisId === analysisId),
        'mock',
      )
    }

    const { data, error } = await this.client
      .from('ai_analysis_topics')
      .select('*')
      .eq('analysis_id', analysisId)

    if (error) {
      throw new AppError('Failed to fetch analysis topics', 500, error.message)
    }

    const analysisTopics = (Array.isArray(data) ? data : []).map((row) =>
      mapAnalysisTopic(ensureRecord(row)),
    )

    if (analysisTopics.length > 0 || !this.canUseMockFallback()) {
      return analysisTopics
    }

    return markAll(
      mockAnalysisTopics.filter((analysisTopic) => analysisTopic.analysisId === analysisId),
      'mock',
    )
  }

  public async findDifficultyByCode(code: string): Promise<QuestionDifficultyLevel | null> {
    if (!this.useRealDb) {
      const difficulty = mockDifficultyLevels.find((item) => item.code === code)
      return difficulty ? withSource(difficulty, 'mock') : null
    }

    const { data, error } = await this.client
      .from('question_difficulty_levels')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch difficulty level', 500, error.message)
    }

    return data ? mapDifficulty(ensureRecord(data)) : null
  }

  public async findQuestionTypeByCode(code: string): Promise<QuestionType | null> {
    if (!this.useRealDb) {
      const questionType = mockQuestionTypes.find((item) => item.code === code)
      return questionType ? withSource(questionType, 'mock') : null
    }

    const { data, error } = await this.client
      .from('question_types')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (error) {
      throw new AppError('Failed to fetch question type', 500, error.message)
    }

    return data ? mapQuestionType(ensureRecord(data)) : null
  }

  public async listQuestionsByTopicAndDifficulty(
    topicId: string,
    difficultyLevelId: string,
  ): Promise<QuestionWithOptions[]> {
    if (!this.useRealDb) {
      return mockQuestions
        .filter(
          (question) =>
            question.topicId === topicId &&
            question.difficultyLevelId === difficultyLevelId &&
            question.isActive,
        )
        .map((question) => ({
          ...question,
          _source: 'mock',
          options: mockQuestionOptions
            .filter((option) => option.questionId === question.id)
            .map((option) => withSource(option, 'mock'))
            .sort((first, second) => first.sortOrder - second.sortOrder),
        }))
    }

    const { data, error } = await this.client
      .from('questions')
      .select('*, question_options ( id, question_id, option_text, is_correct, sort_order, created_at )')
      .eq('topic_id', topicId)
      .eq('difficulty_level_id', difficultyLevelId)
      .eq('is_active', true)

    if (error) {
      throw new AppError('Failed to fetch questions', 500, error.message)
    }

    const questions = (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const options = Array.isArray(record.question_options) ? record.question_options : []

      return {
        ...mapQuestion(record),
        options: options.map((option) => mapQuestionOption(ensureRecord(option))),
      }
    })

    if (questions.length > 0) {
      return questions
    }

    if (!this.canUseMockFallback()) {
      return []
    }

    return mockQuestions
      .filter(
        (question) =>
          question.topicId === topicId &&
          question.difficultyLevelId === difficultyLevelId &&
          question.isActive,
      )
      .map((question) => ({
        ...question,
        _source: 'mock',
        options: mockQuestionOptions
          .filter((option) => option.questionId === question.id)
          .map((option) => withSource(option, 'mock'))
          .sort((first, second) => first.sortOrder - second.sortOrder),
      }))
  }

  public async listQuestionsByTopic(topicId: string): Promise<QuestionWithOptions[]> {
    if (!this.useRealDb) {
      return mockQuestions
        .filter((question) => question.topicId === topicId && question.isActive)
        .map((question) => ({
          ...question,
          _source: 'mock',
          options: mockQuestionOptions
            .filter((option) => option.questionId === question.id)
            .map((option) => withSource(option, 'mock'))
            .sort((first, second) => first.sortOrder - second.sortOrder),
        }))
    }

    const { data, error } = await this.client
      .from('questions')
      .select('*, question_options ( id, question_id, option_text, is_correct, sort_order, created_at )')
      .eq('topic_id', topicId)
      .eq('is_active', true)

    if (error) {
      throw new AppError('Failed to fetch topic question bank', 500, error.message)
    }

    const questions = (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const options = Array.isArray(record.question_options) ? record.question_options : []

      return {
        ...mapQuestion(record),
        options: options.map((option) => mapQuestionOption(ensureRecord(option))),
      }
    })

    if (questions.length > 0 || !this.canUseMockFallback()) {
      return questions
    }

    return mockQuestions
      .filter((question) => question.topicId === topicId && question.isActive)
      .map((question) => ({
        ...question,
        _source: 'mock',
        options: mockQuestionOptions
          .filter((option) => option.questionId === question.id)
          .map((option) => withSource(option, 'mock'))
          .sort((first, second) => first.sortOrder - second.sortOrder),
      }))
  }

  public async saveQuestionsWithOptions(inputs: GeneratedQuestionInput[]): Promise<QuestionWithOptions[]> {
    if (inputs.length === 0) {
      return []
    }

    if (!this.useRealDb) {
      const now = new Date().toISOString()
      const savedQuestions = inputs.map((input, index): QuestionWithOptions => {
        const question: Question = {
          _source: 'mock',
          id: `question-ai-${input.topicId}-${Date.now()}-${index}`,
          topicId: input.topicId,
          difficultyLevelId: input.difficultyLevelId,
          questionTypeId: input.questionTypeId,
          questionText: input.questionText,
          correctAnswer: input.correctAnswer,
          metadataJson: { source: 'fallback' },
          source: 'ai_generated',
          isActive: true,
          createdAt: now,
        }
        const options = input.options.map((option, optionIndex): QuestionOption => ({
          _source: 'mock',
          id: `option-${question.id}-${optionIndex + 1}`,
          questionId: question.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          sortOrder: option.sortOrder,
          createdAt: now,
        }))

        mockQuestions.push(question)
        mockQuestionOptions.push(...options)

        return { ...question, options }
      })

      return savedQuestions
    }

    const savedQuestions: QuestionWithOptions[] = []

    for (const input of inputs) {
      const { data, error } = await this.client
        .from('questions')
        .insert({
          topic_id: input.topicId,
          difficulty_level_id: input.difficultyLevelId,
          question_type_id: input.questionTypeId,
          question_text: input.questionText,
          correct_answer: input.correctAnswer,
          metadata_json: { source: 'claude_fallback' },
          source: 'ai_generated',
          is_active: true,
        })
        .select('*')
        .single()

      if (error) {
        throw new AppError('Failed to save generated question', 500, error.message)
      }

      const question = mapQuestion(ensureRecord(data))
      const { data: optionData, error: optionError } = await this.client
        .from('question_options')
        .insert(
          input.options.map((option) => ({
            question_id: question.id,
            option_text: option.optionText,
            is_correct: option.isCorrect,
            sort_order: option.sortOrder,
          })),
        )
        .select('*')

      if (optionError) {
        throw new AppError('Failed to save generated question options', 500, optionError.message)
      }

      savedQuestions.push({
        ...question,
        options: (Array.isArray(optionData) ? optionData : []).map((option) =>
          mapQuestionOption(ensureRecord(option)),
        ),
      })
    }

    return savedQuestions
  }

  public async createGeneratedExam(input: {
    studentId: string
    topicId: string
    recommendationId: string | null
    title: string
    generationReason: string
  }): Promise<GeneratedExam> {
    if (!this.useRealDb) {
      const exam: GeneratedExam = {
        _source: 'mock',
        id: `exam-${Date.now()}`,
        studentId: input.studentId,
        recommendationId: input.recommendationId,
        targetTopicId: input.topicId,
        title: input.title,
        generationReason: input.generationReason,
        status: 'generated',
        createdAt: new Date().toISOString(),
        completedAt: null,
      }
      mockGeneratedExams.push(exam)
      return exam
    }

    const { data, error } = await this.client
      .from('generated_exams')
      .insert({
        student_id: input.studentId,
        recommendation_id: input.recommendationId,
        target_topic_id: input.topicId,
        title: input.title,
        generation_reason: input.generationReason,
        status: 'generated',
      })
      .select('*')
      .single()

    if (error) {
      throw new AppError('Failed to create generated exam', 500, error.message)
    }

    return mapGeneratedExam(ensureRecord(data))
  }

  public async addQuestionsToExam(examId: string, questionIds: string[]): Promise<ExamQuestion[]> {
    if (questionIds.length === 0) {
      return []
    }

    if (!this.useRealDb) {
      const now = new Date().toISOString()
      const rows = questionIds.map((questionId, index): ExamQuestion => ({
        _source: 'mock',
        id: `exam-question-${examId}-${index + 1}`,
        examId,
        questionId,
        sortOrder: index + 1,
        points: 1,
        createdAt: now,
      }))
      mockExamQuestions.push(...rows)
      return rows
    }

    const { data, error } = await this.client
      .from('exam_questions')
      .insert(
        questionIds.map((questionId, index) => ({
          exam_id: examId,
          question_id: questionId,
          sort_order: index + 1,
          points: 1,
        })),
      )
      .select('*')

    if (error) {
      throw new AppError('Failed to attach questions to exam', 500, error.message)
    }

    return (Array.isArray(data) ? data : []).map((row) => mapExamQuestion(ensureRecord(row)))
  }

  public async listGeneratedExamsForSubject(
    studentId: string,
    subjectId: string,
  ): Promise<GeneratedExamWithTopic[]> {
    if (!this.useRealDb) {
      return mockGeneratedExams
        .filter((exam) => {
          const topic = mockTopics.find((item) => item.id === exam.targetTopicId)

          return exam.studentId === studentId && topic?.subjectId === subjectId
        })
        .sort((firstExam, secondExam) => secondExam.createdAt.localeCompare(firstExam.createdAt))
        .map((exam) => {
          const topic = mockTopics.find((item) => item.id === exam.targetTopicId)

          return {
            ...withSource(exam, 'mock'),
            subjectId: topic?.subjectId ?? null,
            topicName: topic?.name ?? null,
            questionCount: mockExamQuestions.filter((question) => question.examId === exam.id).length,
          }
        })
    }

    const { data, error } = await this.client
      .from('generated_exams')
      .select('*, topics!inner ( id, subject_id, name )')
      .eq('student_id', studentId)
      .eq('topics.subject_id', subjectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError('Failed to fetch generated exams', 500, error.message)
    }

    const exams = (Array.isArray(data) ? data : []).map((row) => {
      const record = ensureRecord(row)
      const topic = ensureRecord(record.topics)

      return {
        ...mapGeneratedExam(record),
        subjectId: nullableString(topic.subject_id),
        topicName: nullableString(topic.name),
        questionCount: 0,
      }
    })

    if (exams.length === 0) {
      return []
    }

    const examIds = exams.map((exam) => exam.id)
    const { data: examQuestionData, error: examQuestionError } = await this.client
      .from('exam_questions')
      .select('exam_id')
      .in('exam_id', examIds)

    if (examQuestionError) {
      throw new AppError('Failed to fetch exam question counts', 500, examQuestionError.message)
    }

    const questionCounts = new Map<string, number>()

    for (const row of Array.isArray(examQuestionData) ? examQuestionData : []) {
      const record = ensureRecord(row)
      const examId = String(record.exam_id ?? '')

      questionCounts.set(examId, (questionCounts.get(examId) ?? 0) + 1)
    }

    return exams.map((exam) => ({
      ...exam,
      questionCount: questionCounts.get(exam.id) ?? 0,
    }))
  }

  public async updateParentActionStatus(input: {
    studentId: string
    recommendationId: string | null
    status: RecommendationStatus
  }): Promise<void> {
    if (!input.recommendationId) {
      return
    }

    if (!this.useRealDb) {
      mockParentActions
        .filter(
          (action) =>
            action.studentId === input.studentId &&
            action.recommendationId === input.recommendationId,
        )
        .forEach((action) => {
          action.status = input.status
        })
      return
    }

    const { error } = await this.client
      .from('parent_actions')
      .update({ status: input.status })
      .eq('student_id', input.studentId)
      .eq('recommendation_id', input.recommendationId)

    if (error) {
      throw new AppError('Failed to update parent action', 500, error.message)
    }
  }
}

export const studentRepository = new StudentRepository()

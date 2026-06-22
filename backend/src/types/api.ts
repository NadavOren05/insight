import type {
  AttendanceWithTopic,
  DataSource,
  GradeWithTopic,
  RiskLevel,
  Student,
  StudentAIAnalysis,
  Subject,
  TopicStatus,
} from './database.js'

export interface ApiSourceMeta {
  _source: DataSource
}

export interface LoginChild extends ApiSourceMeta {
  id: string
  name: string
  grade: string
}

export interface LoginResponse extends ApiSourceMeta {
  parentId: string
  parentName: string
  children: LoginChild[]
}

export interface SubjectOverview extends ApiSourceMeta {
  id: string
  name: string
  riskLevel: RiskLevel
  summary: string
  missingLessons: string[]
}

export interface StudentOverviewResponse {
  student: ApiSourceMeta & {
    id: string
    name: string
    grade: string
  }
  aiSummary: ApiSourceMeta & {
    text: string
  }
  subjects: SubjectOverview[]
}

export interface SubjectTopicStatus extends ApiSourceMeta {
  id: string
  name: string
  status: TopicStatus
}

export interface SubjectDetailGrade extends ApiSourceMeta {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface RelevantAbsence extends ApiSourceMeta {
  id: string
  date: string
  topicId: string
  topicName: string
}

export interface SubjectDetailResponse extends ApiSourceMeta {
  studentId: string
  subjectId: string
  name: string
  riskLevel: RiskLevel
  aiSummary: ApiSourceMeta & {
    text: string
  }
  topics: SubjectTopicStatus[]
  attendance: ApiSourceMeta & {
    percentage: number
    attendanceFlag: boolean
    relevantAbsences: RelevantAbsence[]
  }
  grades: SubjectDetailGrade[]
}

export interface LessonExplanation {
  title: string
  steps: string[]
  example: string
}

export interface PracticeQuestion extends ApiSourceMeta {
  id: string
  prompt: string
  answer: string
  hint: string
}

export interface ParentPedagogicalGuide {
  goal: string
  coachingTips: string[]
  stopWhen: string
}

export interface GeneratedLessonResponse {
  studentId: string
  topicId: string
  lessonExplanation: LessonExplanation
  practiceQuestions: PracticeQuestion[]
  parentPedagogicalGuide: ParentPedagogicalGuide
}

export interface CreatedPracticeExamResponse {
  studentId: string
  subjectId: string
  topicId: string
  topicName: string
  examId: string
  status: string
  questionCount: number
  questionIds: string[]
  selectionSource: 'recommendation' | 'lowest_grade'
  recommendationId: string | null
  message: string
}

export interface SubjectExamSummary extends ApiSourceMeta {
  id: string
  studentId: string
  subjectId: string
  topicId: string | null
  topicName: string
  title: string
  status: string
  questionCount: number
  createdAt: string
  completedAt: string | null
}

export interface RawSubjectBundle {
  student: Student
  subject: Subject
  grades: GradeWithTopic[]
  attendance: AttendanceWithTopic[]
  cachedAnalysis: StudentAIAnalysis | null
}

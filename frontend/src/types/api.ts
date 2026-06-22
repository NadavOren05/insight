import type { DataSource, RiskLevel, TopicStatus } from './insight'

export interface ApiSourceMeta {
  _source: DataSource
}

export interface ApiChild extends ApiSourceMeta {
  id: string
  name: string
  grade: string
}

export interface LoginResponse extends ApiSourceMeta {
  authToken: string
  parentId: string
  parentName: string
  children: ApiChild[]
}

export interface OverviewAiSummary extends ApiSourceMeta {
  tag: string
  text: string
}

export interface OverviewSubjectSummary extends ApiSourceMeta {
  id: string
  name: string
  riskLevel: RiskLevel
  summary: string
  missingLessons: string[]
}

export interface OverviewResponse {
  studentId: string
  studentName: string
  grade: string
  _source: DataSource
  aiSummary: OverviewAiSummary
  subjects: OverviewSubjectSummary[]
}

export interface ApiTopic extends ApiSourceMeta {
  id: string
  name: string
  status: TopicStatus
}

export interface ApiRelevantAbsence extends ApiSourceMeta {
  id: string
  date: string
  topicId: string
  topicName: string
}

export interface ApiAttendance extends ApiSourceMeta {
  percentage: number
  attendanceFlag: boolean
  relevantAbsences: ApiRelevantAbsence[]
}

export interface ApiGrade extends ApiSourceMeta {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface SubjectDetailResponse extends ApiSourceMeta {
  studentId: string
  subjectId: string
  name: string
  riskLevel: RiskLevel
  aiSummary: string
  aiSummarySource: DataSource
  topics: ApiTopic[]
  attendance: ApiAttendance
  grades: ApiGrade[]
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

export interface ExamPracticeOption extends ApiSourceMeta {
  id: string
  optionText: string
  sortOrder: number
}

export interface ExamPracticeQuestion extends ApiSourceMeta {
  examQuestionId: string
  questionId: string
  questionText: string
  questionTypeCode: string
  points: number
  sortOrder: number
  options: ExamPracticeOption[]
}

export interface ExamPracticeResponse extends ApiSourceMeta {
  id: string
  studentId: string
  title: string
  status: string
  targetTopicId: string | null
  questions: ExamPracticeQuestion[]
}

export interface ExamSubmissionResult {
  examId: string
  studentId: string
  correctCount: number
  totalQuestions: number
  percentageScore: number
}

export interface ExamFinishResult {
  examId: string
  deletedStudentAnswerCount: number
  deletedExamQuestionCount: number
  deletedGeneratedExamCount: number
}

export interface ExamRetryResult {
  examId: string
  deletedStudentAnswerCount: number
}

export type RiskLevel = 'red' | 'yellow' | 'green'

export type TopicStatus = 'needs-support' | 'medium' | 'strong'

export type DataSource = 'database' | 'mock'

export interface SourceMeta {
  _source?: DataSource
}

export type GradeType = 'quiz' | 'exam' | 'assignment' | 'practice' | string

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | string

export type AnalysisTopicType = 'gap' | 'strength' | 'attendance_correlation' | string

export type RecommendationStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed' | string

export type QuestionSource = 'human_created' | 'ai_generated' | string

export type ExamStatus = 'generated' | 'in_progress' | 'completed' | string

export interface School extends SourceMeta {
  id: string
  name: string
  city: string | null
  district: string | null
  peripheralIndex: number | null
  createdAt: string
}

export interface Teacher extends SourceMeta {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  schoolId: string | null
  createdAt: string
}

export interface Class extends SourceMeta {
  id: string
  schoolId: string
  name: string
  grade: number
  homeroomTeacherId: string | null
  createdAt: string
}

export interface Student extends SourceMeta {
  id: string
  fullName: string
  classId: string
  createdAt: string
}

export interface Parent extends SourceMeta {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  preferredLanguage: string
  createdAt: string
}

export interface StudentParent extends SourceMeta {
  id: string
  studentId: string
  parentId: string
  relationType: string | null
  isPrimaryContact: boolean
  createdAt: string
}

export interface Subject extends SourceMeta {
  id: string
  name: string
  classId: string
  teacherId: string | null
  createdAt: string
}

export interface Topic extends SourceMeta {
  id: string
  subjectId: string
  name: string
  taughtDate: string | null
  createdAt: string
}

export interface Grade extends SourceMeta {
  id: string
  studentId: string
  topicId: string
  type: GradeType
  score: number
  maxScore: number
  date: string
  notes: string | null
  createdAt: string
}

export interface Attendance extends SourceMeta {
  id: string
  studentId: string
  topicId: string
  date: string
  status: AttendanceStatus
  createdAt: string
}

export interface StudentAIAnalysis extends SourceMeta {
  id: string
  studentId: string
  generatedAt: string
  riskLevel: number | null
  trend: string | null
  attendanceFlag: boolean
  parentSummary: string | null
  createdAt: string
}

export interface AIAnalysisTopic extends SourceMeta {
  id: string
  analysisId: string
  topicId: string
  type: AnalysisTopicType
  confidenceScore: number | null
  createdAt: string
}

export interface Recommendation extends SourceMeta {
  id: string
  analysisId: string
  studentId: string
  title: string
  description: string
  recommendationType: string | null
  priority: number
  status: RecommendationStatus
  createdAt: string
}

export interface ParentAction extends SourceMeta {
  id: string
  studentId: string
  parentId: string | null
  recommendationId: string
  actionType: string | null
  status: RecommendationStatus
  completedAt: string | null
  parentFeedback: string | null
  createdAt: string
}

export interface QuestionDifficultyLevel extends SourceMeta {
  id: string
  code: string
  name: string
  description: string | null
  sortOrder: number
  createdAt: string
}

export interface QuestionType extends SourceMeta {
  id: string
  code: string
  name: string
  description: string | null
  createdAt: string
}

export interface Question extends SourceMeta {
  id: string
  topicId: string
  difficultyLevelId: string
  questionTypeId: string
  questionText: string
  correctAnswer: string | null
  metadataJson: Record<string, unknown> | null
  source: QuestionSource
  isActive: boolean
  createdAt: string
}

export interface QuestionOption extends SourceMeta {
  id: string
  questionId: string
  optionText: string
  isCorrect: boolean
  sortOrder: number
  createdAt: string
}

export interface GeneratedExam extends SourceMeta {
  id: string
  studentId: string
  recommendationId: string | null
  targetTopicId: string | null
  title: string
  generationReason: string | null
  status: ExamStatus
  createdAt: string
  completedAt: string | null
}

export interface ExamQuestion extends SourceMeta {
  id: string
  examId: string
  questionId: string
  sortOrder: number
  points: number
  createdAt: string
}

export interface StudentAnswer extends SourceMeta {
  id: string
  examQuestionId: string
  studentId: string
  answerText: string | null
  selectedOptionId: string | null
  isCorrect: boolean | null
  score: number | null
  answeredAt: string
  createdAt: string
}

export interface AttendanceWithTopic extends Attendance {
  topicName: string | null
  subjectId: string | null
}

export interface GradeWithTopic extends Grade {
  topicName: string | null
  subjectId: string | null
}

export interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

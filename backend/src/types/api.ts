import type {
  AttendanceWithTopic,
  GradeWithTopic,
  RiskLevel,
  Student,
  StudentAIAnalysis,
  Subject,
  TopicStatus,
} from './database.js'

export interface LoginChild {
  id: string
  name: string
  grade: string
}

export interface LoginResponse {
  parentId: string
  parentName: string
  children: LoginChild[]
}

export interface SubjectOverview {
  id: string
  name: string
  riskLevel: RiskLevel
  summary: string
  missingLessons: string[]
}

export interface StudentOverviewResponse {
  student: {
    id: string
    name: string
    grade: string
  }
  aiSummary: string
  subjects: SubjectOverview[]
}

export interface SubjectTopicStatus {
  id: string
  name: string
  status: TopicStatus
}

export interface SubjectDetailGrade {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface RelevantAbsence {
  id: string
  date: string
  topicId: string
  topicName: string
}

export interface SubjectDetailResponse {
  studentId: string
  subjectId: string
  name: string
  riskLevel: RiskLevel
  aiSummary: string
  topics: SubjectTopicStatus[]
  attendance: {
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

export interface PracticeQuestion {
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

export interface RawSubjectBundle {
  student: Student
  subject: Subject
  grades: GradeWithTopic[]
  attendance: AttendanceWithTopic[]
  cachedAnalysis: StudentAIAnalysis | null
}

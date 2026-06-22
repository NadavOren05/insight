import type { RiskLevel, TopicStatus } from './insight'

export interface ApiChild {
  id: string
  name: string
  grade: string
}

export interface LoginResponse {
  authToken: string
  parentId: string
  parentName: string
  children: ApiChild[]
}

export interface OverviewAiSummary {
  tag: string
  text: string
}

export interface OverviewSubjectSummary {
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
  aiSummary: OverviewAiSummary
  subjects: OverviewSubjectSummary[]
}

export interface ApiTopic {
  id: string
  name: string
  status: TopicStatus
}

export interface ApiRelevantAbsence {
  id: string
  date: string
  topicId: string
  topicName: string
}

export interface ApiAttendance {
  percentage: number
  attendanceFlag: boolean
  relevantAbsences: ApiRelevantAbsence[]
}

export interface ApiGrade {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface SubjectDetailResponse {
  studentId: string
  subjectId: string
  name: string
  riskLevel: RiskLevel
  aiSummary: string
  topics: ApiTopic[]
  attendance: ApiAttendance
  grades: ApiGrade[]
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

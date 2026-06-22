export type RiskLevel = 'red' | 'yellow' | 'green'

export type Screen = 'login' | 'child-select' | 'home' | 'subject-detail' | 'profile'

export type TopicStatus = 'needs-support' | 'medium' | 'strong'

export type ScoreTone = 'red' | 'orange' | 'green'

export interface ParentUser {
  id: string
  name: string
  phone: string
}

export interface Student {
  id: string
  name: string
  grade: string
}

export type SubjectProgressByStudentId = Record<string, SubjectProgress[]>

export type SubjectDataByStudentId = Record<string, Record<string, SubjectData>>

export interface SubjectProgress {
  id: string
  name: string
  riskLevel: RiskLevel
  summary: string
  missingLessons: string[]
}

export interface RiskMeta {
  label: string
  className: string
}

export interface Topic {
  id: string
  name: string
  status: TopicStatus
}

export interface RelevantAbsence {
  id: string
  date: string
  topicName: string
}

export interface Attendance {
  percentage: number
  attendanceFlag: boolean
  relevantAbsences: RelevantAbsence[]
}

export interface Grade {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface SubjectData {
  id: string
  name: string
  riskLevel: RiskLevel
  aiSummary: string
  topics: Topic[]
  attendance: Attendance
  grades: Grade[]
}

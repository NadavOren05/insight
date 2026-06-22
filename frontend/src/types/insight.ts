export type RiskLevel = 'red' | 'yellow' | 'green'

export type DataSource = 'database' | 'mock'

export interface SourceMeta {
  _source?: DataSource
}

export type Screen = 'login' | 'child-select' | 'home' | 'subject-detail' | 'profile'

export type TopicStatus = 'needs-support' | 'medium' | 'strong'

export type ScoreTone = 'red' | 'orange' | 'green'

export interface ParentUser extends SourceMeta {
  id: string
  name: string
  phone: string
}

export interface Student extends SourceMeta {
  id: string
  name: string
  grade: string
}

export type SubjectProgressByStudentId = Record<string, SubjectProgress[]>

export type SubjectDataByStudentId = Record<string, Record<string, SubjectData>>

export interface SubjectProgress extends SourceMeta {
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

export interface Topic extends SourceMeta {
  id: string
  name: string
  status: TopicStatus
}

export interface RelevantAbsence extends SourceMeta {
  id: string
  date: string
  topicName: string
}

export interface Attendance extends SourceMeta {
  percentage: number
  attendanceFlag: boolean
  relevantAbsences: RelevantAbsence[]
}

export interface Grade extends SourceMeta {
  id: string
  date: string
  topic: string
  type: string
  score: number
  classAvg: number
}

export interface SubjectData extends SourceMeta {
  id: string
  name: string
  riskLevel: RiskLevel
  aiSummary: string
  aiSummarySource?: DataSource
  topics: Topic[]
  attendance: Attendance
  grades: Grade[]
}

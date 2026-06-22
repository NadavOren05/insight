export type RiskLevel = 'red' | 'yellow' | 'green'

export type TopicStatus = 'needs-support' | 'medium' | 'strong'

export interface School {
  id: string
  name: string
  city: string | null
  createdAt: string
}

export interface Teacher {
  id: string
  schoolId: string
  fullName: string
  email: string | null
  createdAt: string
}

export interface Class {
  id: string
  schoolId: string
  teacherId: string | null
  name: string
  gradeLevel: string
  createdAt: string
}

export interface Student {
  id: string
  schoolId: string
  classId: string
  fullName: string
  gradeLevel: string
  createdAt: string
}

export interface Parent {
  id: string
  fullName: string
  phone: string
  email: string | null
  createdAt: string
}

export interface StudentParent {
  id: string
  studentId: string
  parentId: string
  relationship: string | null
}

export interface Subject {
  id: string
  schoolId: string
  name: string
  createdAt: string
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  createdAt: string
}

export interface Grade {
  id: string
  studentId: string
  subjectId: string
  topicId: string | null
  score: number
  classAverage: number | null
  assessmentType: string
  assessedAt: string
}

export interface Attendance {
  id: string
  studentId: string
  subjectId: string
  topicId: string | null
  lessonDate: string
  isPresent: boolean
  createdAt: string
}

export interface StudentAIAnalysis {
  id: string
  studentId: string
  subjectId: string
  summary: string
  riskLevel: RiskLevel
  rawResponse: unknown
  generatedAt: string
  createdAt: string
}

export interface AIAnalysisTopic {
  id: string
  analysisId: string
  topicId: string
  status: TopicStatus
  explanation: string | null
}

export interface AttendanceWithTopic extends Attendance {
  topicName: string | null
}

export interface GradeWithTopic extends Grade {
  topicName: string | null
}

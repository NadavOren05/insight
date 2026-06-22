import type {
  GeneratedLessonResponse,
  LoginResponse,
  OverviewResponse,
  SubjectDetailResponse,
} from '../types/api'

const API_BASE_URL = 'http://localhost:3001/api'

const request = async <ResponseBody>(
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as ResponseBody
}

const login = async (identifier: string): Promise<LoginResponse> => {
  const response = await request<Omit<LoginResponse, 'authToken'>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  })

  return {
    ...response,
    authToken: `mock-token-${response.parentId}`,
  }
}

const getOverview = async (studentId: string): Promise<OverviewResponse> => {
  const response = await request<{
    student: {
      id: string
      name: string
      grade: string
    }
    aiSummary: string
    subjects: OverviewResponse['subjects']
  }>(`/students/${studentId}/overview`)

  return {
    studentId: response.student.id,
    studentName: response.student.name,
    grade: response.student.grade,
    aiSummary: {
      tag: '✦ AI Insight',
      text: response.aiSummary,
    },
    subjects: response.subjects,
  }
}

const getSubjectDetail = async (
  studentId: string,
  subjectId: string,
): Promise<SubjectDetailResponse> =>
  request<SubjectDetailResponse>(`/students/${studentId}/subject/${subjectId}`)

const generateLesson = async (
  studentId: string,
  topicId: string,
): Promise<GeneratedLessonResponse> =>
  request<GeneratedLessonResponse>('/generate-lesson', {
    method: 'POST',
    body: JSON.stringify({ studentId, topicId }),
  })

export const api = {
  auth: {
    login,
  },
  students: {
    getOverview,
    getSubjectDetail,
  },
  practice: {
    generateLesson,
  },
}

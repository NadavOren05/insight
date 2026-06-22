import type {
  CreatedPracticeExamResponse,
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
    const errorBody = await response.text()
    let message = errorBody

    try {
      const parsedError = JSON.parse(errorBody) as { message?: unknown }

      if (typeof parsedError.message === 'string') {
        message = parsedError.message
      }
    } catch {
      message = errorBody
    }

    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as ResponseBody
}

const login = async (fullName: string, phone: string): Promise<LoginResponse> => {
  const response = await request<Omit<LoginResponse, 'authToken'>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ fullName, phone }),
  })

  return {
    ...response,
    authToken: `mock-token-${response.parentId}`,
  }
}

const getOverview = async (studentId: string): Promise<OverviewResponse> => {
  const response = await request<{
    student: {
      _source: OverviewResponse['_source']
      id: string
      name: string
      grade: string
    }
    aiSummary: {
      _source: OverviewResponse['aiSummary']['_source']
      text: string
    }
    subjects: OverviewResponse['subjects']
  }>(`/students/${studentId}/overview`)

  return {
    _source: response.student._source,
    studentId: response.student.id,
    studentName: response.student.name,
    grade: response.student.grade,
    aiSummary: {
      _source: response.aiSummary._source,
      tag: '✦ AI Insight',
      text: response.aiSummary.text,
    },
    subjects: response.subjects,
  }
}

const getSubjectDetail = async (
  studentId: string,
  subjectId: string,
): Promise<SubjectDetailResponse> => {
  const response = await request<Omit<SubjectDetailResponse, 'aiSummary' | 'aiSummarySource'> & {
    aiSummary: {
      _source: SubjectDetailResponse['aiSummarySource']
      text: string
    }
  }>(`/students/${studentId}/subject/${subjectId}`)

  return {
    ...response,
    aiSummary: response.aiSummary.text,
    aiSummarySource: response.aiSummary._source,
  }
}

const generateLesson = async (
  studentId: string,
  topicId: string,
): Promise<GeneratedLessonResponse> =>
  request<GeneratedLessonResponse>('/generate-lesson', {
    method: 'POST',
    body: JSON.stringify({ studentId, topicId }),
  })

const generateSubjectPractice = async (
  studentId: string,
  subjectId: string,
): Promise<CreatedPracticeExamResponse> =>
  request<CreatedPracticeExamResponse>(`/students/${studentId}/subject/${subjectId}/generate-practice`, {
    method: 'POST',
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
    generateSubjectPractice,
  },
}

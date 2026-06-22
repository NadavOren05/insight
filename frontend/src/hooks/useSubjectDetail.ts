import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  activeStudentIdAtom,
  activeSubjectIdAtom,
  childrenAtom,
  currentScreenAtom,
  subjectDataByStudentIdAtom,
  subjectProgressByStudentIdAtom,
} from '../state/atoms'
import { api } from '../services/api'
import { yonatanStudent } from '../data/mockData'
import type {
  Grade,
  RiskLevel,
  RiskMeta,
  Screen,
  ScoreTone,
  Student,
  SubjectData,
  TopicStatus,
} from '../types/insight'

interface TopicMeta {
  label: string
  dotClassName: string
  textClassName: string
}

interface ScoreMeta {
  tone: ScoreTone
  className: string
}

interface UseSubjectDetailReturn {
  attendanceDatesText: string
  detail: SubjectData
  getRiskMeta: (riskLevel: RiskLevel) => RiskMeta
  getScoreMeta: (grade: Grade) => ScoreMeta
  getTopicMeta: (status: TopicStatus) => TopicMeta
  handleBack: () => void
  isExcellent: boolean
  isLoading: boolean
  navigateToScreen: (screen: Screen) => void
  student: Student
}

const MIN_LOADING_MS = 1500

const fallbackSubjectData: SubjectData = {
  id: 'math',
  name: 'מתמטיקה',
  riskLevel: 'red',
  aiSummary:
    'עדיין אין מספיק מידע מלא, אבל אפשר להתחיל משיחה קצרה: מה היה קל, מה היה קשה, ואיפה הילד הרגיש שהוא נתקע.',
  topics: [],
  attendance: {
    percentage: 100,
    attendanceFlag: false,
    relevantAbsences: [],
  },
  grades: [],
}

const riskMeta: Record<RiskLevel, RiskMeta> = {
  red: {
    label: 'דורש תשומת לב',
    className: 'bg-red-50/90 text-red-700 ring-red-200',
  },
  yellow: {
    label: 'במעקב',
    className: 'bg-amber-50/90 text-amber-700 ring-amber-200',
  },
  green: {
    label: 'תקין',
    className: 'bg-emerald-50/90 text-emerald-700 ring-emerald-200',
  },
}

const topicMeta: Record<TopicStatus, TopicMeta> = {
  'needs-support': {
    label: 'צריך חיזוק',
    dotClassName: 'bg-red-500',
    textClassName: 'text-red-700',
  },
  medium: {
    label: 'בינוני',
    dotClassName: 'bg-amber-500',
    textClassName: 'text-amber-700',
  },
  strong: {
    label: 'חזק',
    dotClassName: 'bg-emerald-500',
    textClassName: 'text-emerald-700',
  },
}

const getScoreTone = (gapFromAverage: number): ScoreTone => {
  if (gapFromAverage <= -10) {
    return 'red'
  }

  if (gapFromAverage < -3) {
    return 'orange'
  }

  return 'green'
}

const scoreClassName: Record<ScoreTone, string> = {
  red: 'bg-red-50 text-red-700 ring-red-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export const useSubjectDetail = (): UseSubjectDetailReturn => {
  const [isLoading, setIsLoading] = useState(true)
  const activeStudentId = useAtomValue(activeStudentIdAtom)
  const activeSubjectId = useAtomValue(activeSubjectIdAtom)
  const { subjectId } = useParams<{ subjectId: string }>()
  const children = useAtomValue(childrenAtom)
  const progressByStudentId = useAtomValue(subjectProgressByStudentIdAtom)
  const [detailByStudentId, setDetailByStudentId] = useAtom(subjectDataByStudentIdAtom)
  const setCurrentScreen = useSetAtom(currentScreenAtom)
  const navigate = useNavigate()
  const resolvedSubjectId = subjectId ?? activeSubjectId

  const student = children.find((child) => child.id === activeStudentId) ?? children[0] ?? yonatanStudent
  const detail =
    detailByStudentId[student.id]?.[resolvedSubjectId] ??
    detailByStudentId[student.id]?.[activeSubjectId] ??
    detailByStudentId[student.id]?.[progressByStudentId[student.id]?.[0]?.id ?? ''] ??
    fallbackSubjectData
  const attendanceDatesText = detail.attendance.relevantAbsences
    .slice(0, 4)
    .map((absence) => absence.date)
    .join(', ')

  const isExcellent = useMemo(
    () => detail.topics.length > 0 && detail.topics.every((topic) => topic.status === 'strong'),
    [detail.topics],
  )

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsLoading(false)
    }, MIN_LOADING_MS)

    return () => window.clearTimeout(timerId)
  }, [activeStudentId, resolvedSubjectId])

  useEffect(() => {
    let isMounted = true

    const loadSubjectDetail = async () => {
      const response = await api.students.getSubjectDetail(student.id, resolvedSubjectId)

      if (!isMounted) {
        return
      }

      setDetailByStudentId((currentDetails) => ({
        ...currentDetails,
        [student.id]: {
          ...currentDetails[student.id],
          [resolvedSubjectId]: {
            id: response.subjectId,
            name: response.name,
            _source: response._source,
            riskLevel: response.riskLevel,
            aiSummary: response.aiSummary,
            aiSummarySource: response.aiSummarySource,
            topics: response.topics,
            attendance: {
              _source: response.attendance._source,
              percentage: response.attendance.percentage,
              attendanceFlag: response.attendance.attendanceFlag,
              relevantAbsences: response.attendance.relevantAbsences,
            },
            grades: response.grades,
          },
        },
      }))
    }

    void loadSubjectDetail()

    return () => {
      isMounted = false
    }
  }, [resolvedSubjectId, setDetailByStudentId, student.id])

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen)

    if (screen === 'home') {
      navigate('/home')
      return
    }

    if (screen === 'profile') {
      navigate('/profile')
    }
  }

  return {
    attendanceDatesText,
    detail,
    getRiskMeta: (riskLevel) => riskMeta[riskLevel],
    getScoreMeta: (grade) => {
      const tone = getScoreTone(grade.score - grade.classAvg)

      return {
        tone,
        className: scoreClassName[tone],
      }
    },
    getTopicMeta: (status) => topicMeta[status],
    handleBack: () => navigateToScreen('home'),
    isExcellent,
    isLoading,
    navigateToScreen,
    student,
  }
}

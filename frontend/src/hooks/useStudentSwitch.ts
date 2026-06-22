import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  activeStudentIdAtom,
  activeSubjectIdAtom,
  childrenAtom,
  currentScreenAtom,
  parentUserAtom,
  subjectProgressByStudentIdAtom,
} from '../state/atoms'
import { api } from '../services/api'
import { yonatanStudent } from '../data/mockData'
import type { RiskLevel, RiskMeta, Screen, Student, SubjectProgress } from '../types/insight'
import type { DataSource } from '../types/insight'

interface UseStudentSwitchReturn {
  activeStudent: Student
  aiSummary: string
  aiSummarySource?: DataSource
  children: Student[]
  currentScreen: Screen
  greeting: string
  hasMultipleChildren: boolean
  isSwitcherOpen: boolean
  otherChildren: Student[]
  sortedSubjects: SubjectProgress[]
  closeSwitcher: () => void
  getRiskMeta: (riskLevel: RiskLevel) => RiskMeta
  navigateToScreen: (screen: Screen) => void
  openSubjectDetail: (subjectId: string) => void
  selectChild: (studentId: string) => void
  switchChild: (studentId: string) => void
  toggleSwitcher: () => void
}

const riskOrder: Record<RiskLevel, number> = {
  red: 0,
  yellow: 1,
  green: 2,
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

export const useStudentSwitch = (): UseStudentSwitchReturn => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [aiSummaryByStudentId, setAiSummaryByStudentId] = useState<Record<string, { text: string; source: DataSource }>>({})
  const children = useAtomValue(childrenAtom)
  const [activeStudentId, setActiveStudentId] = useAtom(activeStudentIdAtom)
  const [currentScreen, setCurrentScreen] = useAtom(currentScreenAtom)
  const parentUser = useAtomValue(parentUserAtom)
  const [progressByStudentId, setProgressByStudentId] = useAtom(subjectProgressByStudentIdAtom)
  const setActiveSubjectId = useSetAtom(activeSubjectIdAtom)
  const navigate = useNavigate()

  const activeStudent =
    children.find((student) => student.id === activeStudentId) ?? children[0] ?? yonatanStudent
  const subjects = progressByStudentId[activeStudent.id] ?? []
  const sortedSubjects = [...subjects].sort(
    (firstSubject, secondSubject) =>
      riskOrder[firstSubject.riskLevel] - riskOrder[secondSubject.riskLevel],
  )
  const otherChildren = children.filter((student) => student.id !== activeStudent.id)
  const hasMultipleChildren = children.length > 1
  const focusSubject = sortedSubjects[0]
  const missingLesson = focusSubject?.missingLessons[0]
  const aiSummary =
    aiSummaryByStudentId[activeStudent.id]?.text ??
    (focusSubject && missingLesson
      ? `${activeStudent.name} צריך חיזוק ממוקד ב${focusSubject.name}. הפער המרכזי הוא בנושא ${missingLesson}, וכדאי להשלים אותו לפני המעבר לתרגול מתקדם.`
      : `${activeStudent.name} מתקדם בצורה יציבה. כדאי לשמר רצף תרגול קצר כדי לזהות פערים מוקדם.`)
  const aiSummarySource = aiSummaryByStudentId[activeStudent.id]?.source

  useEffect(() => {
    if (activeStudent.id.length === 0) {
      return
    }

    let isMounted = true

    const loadOverview = async () => {
      const overview = await api.students.getOverview(activeStudent.id)

      if (!isMounted) {
        return
      }

      setProgressByStudentId((currentProgress) => ({
        ...currentProgress,
        [activeStudent.id]: overview.subjects,
      }))
      setAiSummaryByStudentId((currentSummaries) => ({
        ...currentSummaries,
        [activeStudent.id]: {
          text: overview.aiSummary.text,
          source: overview.aiSummary._source,
        },
      }))
    }

    void loadOverview()

    return () => {
      isMounted = false
    }
  }, [activeStudent.id, setProgressByStudentId])

  const selectChild = (studentId: string) => {
    setActiveStudentId(studentId)
    setCurrentScreen('home')
    navigate('/home')
  }

  const switchChild = (studentId: string) => {
    setActiveStudentId(studentId)
    setIsSwitcherOpen(false)
  }

  const openSubjectDetail = (subjectId: string) => {
    setActiveSubjectId(subjectId)
    setCurrentScreen('subject-detail')
    navigate(`/subject/${subjectId}`)
  }

  return {
    activeStudent,
    aiSummary,
    aiSummarySource,
    children,
    currentScreen,
    greeting: `שלום, ${parentUser.name} 👋`,
    hasMultipleChildren,
    isSwitcherOpen,
    otherChildren,
    sortedSubjects,
    closeSwitcher: () => setIsSwitcherOpen(false),
    getRiskMeta: (riskLevel) => riskMeta[riskLevel],
    navigateToScreen: setCurrentScreen,
    openSubjectDetail,
    selectChild,
    switchChild,
    toggleSwitcher: () => setIsSwitcherOpen((isOpen) => !isOpen),
  }
}

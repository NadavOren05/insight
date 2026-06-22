import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  activeStudentIdAtom,
  activeSubjectIdAtom,
  childrenAtom,
  currentScreenAtom,
  parentUserAtom,
  subjectProgressByStudentIdAtom,
} from '../state/atoms'
import {
  defaultParentUser,
  multiChildStudents,
  nadavParentUser,
  singleChildStudents,
  yonatanStudent,
} from '../data/mockData'
import type { ParentUser, RiskLevel, RiskMeta, Screen, Student, SubjectProgress } from '../types/insight'

interface UseStudentSwitchReturn {
  activeStudent: Student
  aiSummary: string
  children: Student[]
  currentScreen: Screen
  greeting: string
  hasMultipleChildren: boolean
  isSwitcherOpen: boolean
  otherChildren: Student[]
  sortedSubjects: SubjectProgress[]
  closeSwitcher: () => void
  configureLoginScenario: (credential: string) => Screen
  getRiskMeta: (riskLevel: RiskLevel) => RiskMeta
  navigateToScreen: (screen: Screen) => void
  openSubjectDetail: (subjectId: string) => void
  selectChild: (studentId: string) => void
  switchChild: (studentId: string) => void
  toggleSwitcher: () => void
}

const MULTI_CHILD_PARENT_NAME = 'נדב'

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

const createSingleParentUser = (credential: string): ParentUser => {
  const trimmedCredential = credential.trim()

  if (trimmedCredential.length === 0) {
    return defaultParentUser
  }

  return {
    id: 'parent-single',
    name: trimmedCredential,
    phone: trimmedCredential,
  }
}

export const useStudentSwitch = (): UseStudentSwitchReturn => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [children, setChildren] = useAtom(childrenAtom)
  const [activeStudentId, setActiveStudentId] = useAtom(activeStudentIdAtom)
  const [currentScreen, setCurrentScreen] = useAtom(currentScreenAtom)
  const parentUser = useAtomValue(parentUserAtom)
  const progressByStudentId = useAtomValue(subjectProgressByStudentIdAtom)
  const setParentUser = useSetAtom(parentUserAtom)
  const setActiveSubjectId = useSetAtom(activeSubjectIdAtom)

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
    focusSubject && missingLesson
      ? `${activeStudent.name} צריך חיזוק ממוקד ב${focusSubject.name}. הפער המרכזי הוא בנושא ${missingLesson}, וכדאי להשלים אותו לפני המעבר לתרגול מתקדם.`
      : `${activeStudent.name} מתקדם בצורה יציבה. כדאי לשמר רצף תרגול קצר כדי לזהות פערים מוקדם.`

  const configureLoginScenario = (credential: string): Screen => {
    const trimmedCredential = credential.trim()
    const isMultiChildScenario = trimmedCredential === MULTI_CHILD_PARENT_NAME

    if (isMultiChildScenario) {
      setParentUser(nadavParentUser)
      setChildren(multiChildStudents)
      setActiveStudentId('')
      return 'child-select'
    }

    setParentUser(createSingleParentUser(trimmedCredential))
    setChildren(singleChildStudents)
    setActiveStudentId(yonatanStudent.id)
    return 'home'
  }

  const selectChild = (studentId: string) => {
    setActiveStudentId(studentId)
    setCurrentScreen('home')
  }

  const switchChild = (studentId: string) => {
    setActiveStudentId(studentId)
    setIsSwitcherOpen(false)
  }

  const openSubjectDetail = (subjectId: string) => {
    setActiveSubjectId(subjectId)
    setCurrentScreen('subject-detail')
  }

  return {
    activeStudent,
    aiSummary,
    children,
    currentScreen,
    greeting: `שלום, ${parentUser.name} 👋`,
    hasMultipleChildren,
    isSwitcherOpen,
    otherChildren,
    sortedSubjects,
    closeSwitcher: () => setIsSwitcherOpen(false),
    configureLoginScenario,
    getRiskMeta: (riskLevel) => riskMeta[riskLevel],
    navigateToScreen: setCurrentScreen,
    openSubjectDetail,
    selectChild,
    switchChild,
    toggleSwitcher: () => setIsSwitcherOpen((isOpen) => !isOpen),
  }
}

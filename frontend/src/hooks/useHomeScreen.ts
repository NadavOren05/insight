import { useStudentSwitch } from './useStudentSwitch'
import type { DataSource, RiskLevel, RiskMeta, Screen, Student, SubjectProgress } from '../types/insight'

interface UseHomeScreenReturn {
  greeting: string
  student: Student
  aiSummary: string
  aiSummarySource?: DataSource
  sortedSubjects: SubjectProgress[]
  currentScreen: Screen
  hasMultipleChildren: boolean
  isSwitcherOpen: boolean
  otherChildren: Student[]
  closeSwitcher: () => void
  navigateToScreen: (screen: Screen) => void
  openSubjectDetail: (subjectId: string) => void
  getRiskMeta: (riskLevel: RiskLevel) => RiskMeta
  switchChild: (studentId: string) => void
  toggleSwitcher: () => void
}

export const useHomeScreen = (): UseHomeScreenReturn => {
  const {
    activeStudent,
    aiSummary,
    aiSummarySource,
    closeSwitcher,
    currentScreen,
    getRiskMeta,
    greeting,
    hasMultipleChildren,
    isSwitcherOpen,
    navigateToScreen,
    openSubjectDetail,
    otherChildren,
    sortedSubjects,
    switchChild,
    toggleSwitcher,
  } = useStudentSwitch()

  return {
    greeting,
    student: activeStudent,
    aiSummary,
    aiSummarySource,
    sortedSubjects,
    currentScreen,
    hasMultipleChildren,
    isSwitcherOpen,
    otherChildren,
    closeSwitcher,
    navigateToScreen,
    openSubjectDetail,
    getRiskMeta,
    switchChild,
    toggleSwitcher,
  }
}

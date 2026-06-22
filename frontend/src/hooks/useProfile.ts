import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  activeStudentIdAtom,
  activeSubjectIdAtom,
  authTokenAtom,
  childrenAtom,
  currentScreenAtom,
  isAuthenticatedAtom,
  parentUserAtom,
  sessionExpiryAtom,
  subjectDataByStudentIdAtom,
  subjectProgressByStudentIdAtom,
} from '../state/atoms'
import {
  defaultParentUser,
  singleChildStudents,
  subjectDataByStudentId,
  subjectProgressByStudentId,
  yonatanStudent,
} from '../data/mockData'
import { clearStoredSession } from '../utils/session'
import type { ParentUser, Student } from '../types/insight'

interface UseProfileReturn {
  activeChild: Student
  children: Student[]
  hasMultipleChildren: boolean
  isSwitching: boolean
  parentUser: ParentUser
  handleChildSelect: (studentId: string) => void
  handleLogout: () => void
}

const SWITCH_DELAY_MS = 650

export const useProfile = (): UseProfileReturn => {
  const navigate = useNavigate()
  const parentUser = useAtomValue(parentUserAtom)
  const children = useAtomValue(childrenAtom)
  const [activeStudentId, setActiveStudentId] = useAtom(activeStudentIdAtom)
  const setActiveSubjectId = useSetAtom(activeSubjectIdAtom)
  const setAuthToken = useSetAtom(authTokenAtom)
  const setChildren = useSetAtom(childrenAtom)
  const setCurrentScreen = useSetAtom(currentScreenAtom)
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setParentUser = useSetAtom(parentUserAtom)
  const setSessionExpiry = useSetAtom(sessionExpiryAtom)
  const setSubjectDataByStudentId = useSetAtom(subjectDataByStudentIdAtom)
  const setSubjectProgressByStudentId = useSetAtom(subjectProgressByStudentIdAtom)
  const [isSwitching, setIsSwitching] = useState(false)

  const activeChild =
    children.find((child) => child.id === activeStudentId) ?? children[0] ?? yonatanStudent
  const hasMultipleChildren = children.length > 1

  const handleChildSelect = (studentId: string) => {
    if (studentId === activeStudentId || isSwitching) {
      return
    }

    setIsSwitching(true)
    setActiveStudentId(studentId)
    setCurrentScreen('home')

    window.setTimeout(() => {
      setIsSwitching(false)
      navigate('/home')
    }, SWITCH_DELAY_MS)
  }

  const handleLogout = () => {
    clearStoredSession()
    setAuthToken(null)
    setSessionExpiry(null)
    setParentUser(defaultParentUser)
    setChildren(singleChildStudents)
    setActiveStudentId(yonatanStudent.id)
    setActiveSubjectId('math')
    setSubjectProgressByStudentId(subjectProgressByStudentId)
    setSubjectDataByStudentId(subjectDataByStudentId)
    setCurrentScreen('login')
    setIsAuthenticated(false)
    navigate('/login', { replace: true })
  }

  return {
    activeChild,
    children,
    hasMultipleChildren,
    isSwitching,
    parentUser,
    handleChildSelect,
    handleLogout,
  }
}

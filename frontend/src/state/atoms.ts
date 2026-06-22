import { atom } from 'jotai'
import {
  defaultParentUser,
  singleChildStudents,
  subjectDataByStudentId,
  subjectProgressByStudentId,
  yonatanStudent,
} from '../data/mockData'
import type {
  ParentUser,
  Screen,
  Student,
  SubjectDataByStudentId,
  SubjectProgressByStudentId,
} from '../types/insight'
import { isSessionExpired, readStoredSession } from '../utils/session'

const storedSession = readStoredSession()
const hasValidStoredSession =
  storedSession !== null && !isSessionExpired(storedSession.expiryTimestamp)

export const parentUserAtom = atom<ParentUser>(
  hasValidStoredSession
    ? {
        _source: storedSession.parentSource,
        id: storedSession.parentId,
        name: storedSession.parentName,
        phone: '',
      }
    : defaultParentUser,
)

export const authTokenAtom = atom<string | null>(
  hasValidStoredSession ? storedSession.authToken : null,
)

export const sessionExpiryAtom = atom<number | null>(
  hasValidStoredSession ? storedSession.expiryTimestamp : null,
)

export const childrenAtom = atom<Student[]>(
  hasValidStoredSession ? storedSession.children : singleChildStudents,
)

export const activeStudentIdAtom = atom<string>(
  hasValidStoredSession ? (storedSession.children[0]?.id ?? yonatanStudent.id) : yonatanStudent.id,
)

export const activeSubjectIdAtom = atom<string>('math')

export const subjectProgressByStudentIdAtom =
  atom<SubjectProgressByStudentId>(subjectProgressByStudentId)

export const subjectDataByStudentIdAtom = atom<SubjectDataByStudentId>(subjectDataByStudentId)

export const currentScreenAtom = atom<Screen>('login')

export const isAuthenticatedAtom = atom<boolean>(hasValidStoredSession)

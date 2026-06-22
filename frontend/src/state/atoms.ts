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

export const parentUserAtom = atom<ParentUser>(defaultParentUser)

export const childrenAtom = atom<Student[]>(singleChildStudents)

export const activeStudentIdAtom = atom<string>(yonatanStudent.id)

export const activeSubjectIdAtom = atom<string>('math')

export const subjectProgressByStudentIdAtom =
  atom<SubjectProgressByStudentId>(subjectProgressByStudentId)

export const subjectDataByStudentIdAtom = atom<SubjectDataByStudentId>(subjectDataByStudentId)

export const currentScreenAtom = atom<Screen>('login')

export const isAuthenticatedAtom = atom<boolean>(false)

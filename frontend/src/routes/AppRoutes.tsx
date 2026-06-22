import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { ChildSelectionScreen } from '../components/ChildSelectionScreen'
import { ExamPractice } from '../components/ExamPractice'
import { HomeScreen } from '../components/HomeScreen'
import { LoginScreen } from '../components/LoginScreen'
import { PracticePlaceholder } from '../components/PracticePlaceholder'
import { ProfilePlaceholder } from '../components/ProfilePlaceholder'
import { SubjectDetail } from '../components/SubjectDetail'
import { activeStudentIdAtom, childrenAtom, isAuthenticatedAtom } from '../state/atoms'
import { ProtectedRoute } from './ProtectedRoute'

const SubjectDetailRoute = () => {
  const { subjectId } = useParams<{ subjectId: string }>()

  return <SubjectDetail key={subjectId ?? 'subject'} />
}

export const AppRoutes = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const children = useAtomValue(childrenAtom)
  const activeStudentId = useAtomValue(activeStudentIdAtom)
  const authenticatedLandingPath =
    children.length > 1 && activeStudentId.length === 0 ? '/child-selection' : '/home'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={authenticatedLandingPath} replace /> : <LoginScreen />}
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/child-selection" element={<ChildSelectionScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/profile" element={<ProfilePlaceholder />} />
        <Route path="/subject/:subjectId" element={<SubjectDetailRoute />} />
        <Route path="/exams/:examId/practice" element={<ExamPractice />} />
        <Route path="/practice/:topicId" element={<PracticePlaceholder />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? authenticatedLandingPath : '/login'} replace />}
      />
    </Routes>
  )
}

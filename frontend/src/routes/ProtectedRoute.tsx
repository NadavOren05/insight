import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  authTokenAtom,
  childrenAtom,
  isAuthenticatedAtom,
  parentUserAtom,
  sessionExpiryAtom,
} from '../state/atoms'
import { clearStoredSession, isSessionExpired } from '../utils/session'
import { defaultParentUser, singleChildStudents } from '../data/mockData'

const ExpiredSessionRedirect = () => {
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setAuthToken = useSetAtom(authTokenAtom)
  const setSessionExpiry = useSetAtom(sessionExpiryAtom)
  const setParentUser = useSetAtom(parentUserAtom)
  const setChildren = useSetAtom(childrenAtom)

  useEffect(() => {
    clearStoredSession()
    setIsAuthenticated(false)
    setAuthToken(null)
    setSessionExpiry(null)
    setParentUser(defaultParentUser)
    setChildren(singleChildStudents)
  }, [setAuthToken, setChildren, setIsAuthenticated, setParentUser, setSessionExpiry])

  return <Navigate to="/login" replace />
}

export const ProtectedRoute = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const authToken = useAtomValue(authTokenAtom)
  const sessionExpiry = useAtomValue(sessionExpiryAtom)

  const hasValidSession =
    isAuthenticated &&
    authToken !== null &&
    sessionExpiry !== null &&
    !isSessionExpired(sessionExpiry)

  if (!hasValidSession) {
    return <ExpiredSessionRedirect />
  }

  return <Outlet />
}

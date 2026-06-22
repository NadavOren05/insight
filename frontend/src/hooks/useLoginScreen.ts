import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import {
  activeStudentIdAtom,
  authTokenAtom,
  childrenAtom,
  isAuthenticatedAtom,
  parentUserAtom,
  sessionExpiryAtom,
} from '../state/atoms'
import { api } from '../services/api'
import { createExpiryTimestamp, persistSession } from '../utils/session'

interface UseLoginScreenReturn {
  credential: string
  isLoading: boolean
  handleCredentialChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const LOGIN_DELAY_MS = 900

export const useLoginScreen = (): UseLoginScreenReturn => {
  const [credential, setCredential] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setAuthToken = useSetAtom(authTokenAtom)
  const setSessionExpiry = useSetAtom(sessionExpiryAtom)
  const setParentUser = useSetAtom(parentUserAtom)
  const setChildren = useSetAtom(childrenAtom)
  const setActiveStudentId = useSetAtom(activeStudentIdAtom)
  const navigate = useNavigate()

  const handleCredentialChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCredential(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoading) {
      return
    }

    const loginUser = async () => {
      setIsLoading(true)

      const loginResponse = await api.auth.login(credential)
      const expiryTimestamp = createExpiryTimestamp()
      persistSession(loginResponse, expiryTimestamp)

      setAuthToken(loginResponse.authToken)
      setSessionExpiry(expiryTimestamp)
      setParentUser({
        id: loginResponse.parentId,
        name: loginResponse.parentName,
        phone: credential.trim(),
      })
      setChildren(loginResponse.children)
      setIsAuthenticated(true)
      const firstChildId = loginResponse.children[0]?.id

      if (loginResponse.children.length > 1) {
        setActiveStudentId('')
        navigate('/child-selection', { replace: true })
      } else if (firstChildId) {
        setActiveStudentId(firstChildId)
        navigate('/home', { replace: true })
      }

      setIsLoading(false)
    }

    window.setTimeout(() => {
      void loginUser()
    }, LOGIN_DELAY_MS)
  }

  return {
    credential,
    isLoading,
    handleCredentialChange,
    handleSubmit,
  }
}

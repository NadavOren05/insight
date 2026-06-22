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
  fullName: string
  phone: string
  isLoading: boolean
  handleFullNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  handlePhoneChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const LOGIN_DELAY_MS = 900

export const useLoginScreen = (): UseLoginScreenReturn => {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setAuthToken = useSetAtom(authTokenAtom)
  const setSessionExpiry = useSetAtom(sessionExpiryAtom)
  const setParentUser = useSetAtom(parentUserAtom)
  const setChildren = useSetAtom(childrenAtom)
  const setActiveStudentId = useSetAtom(activeStudentIdAtom)
  const navigate = useNavigate()

  const handleFullNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value)
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedFullName = fullName.trim()
    const trimmedPhone = phone.trim()

    if (isLoading || trimmedFullName.length === 0 || trimmedPhone.length === 0) {
      return
    }

    const loginUser = async () => {
      setIsLoading(true)

      const loginResponse = await api.auth.login(trimmedFullName, trimmedPhone)
      const expiryTimestamp = createExpiryTimestamp()
      persistSession(loginResponse, expiryTimestamp)

      setAuthToken(loginResponse.authToken)
      setSessionExpiry(expiryTimestamp)
      setParentUser({
        _source: loginResponse._source,
        id: loginResponse.parentId,
        name: loginResponse.parentName,
        phone: trimmedPhone,
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
    fullName,
    phone,
    isLoading,
    handleFullNameChange,
    handlePhoneChange,
    handleSubmit,
  }
}

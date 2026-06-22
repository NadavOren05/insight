import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { currentScreenAtom, isAuthenticatedAtom } from '../state/atoms'
import { useStudentSwitch } from './useStudentSwitch'

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
  const setCurrentScreen = useSetAtom(currentScreenAtom)
  const { configureLoginScenario } = useStudentSwitch()

  const handleCredentialChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCredential(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoading) {
      return
    }

    setIsLoading(true)

    window.setTimeout(() => {
      const nextScreen = configureLoginScenario(credential)
      setIsAuthenticated(true)
      setCurrentScreen(nextScreen)
      setIsLoading(false)
    }, LOGIN_DELAY_MS)
  }

  return {
    credential,
    isLoading,
    handleCredentialChange,
    handleSubmit,
  }
}

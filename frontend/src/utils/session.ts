import type { ApiChild, LoginResponse } from '../types/api'

export const SESSION_TTL_MS = 90 * 60 * 1000

const AUTH_TOKEN_KEY = 'auth_token'
const EXPIRY_TIMESTAMP_KEY = 'expiry_timestamp'
const SESSION_PARENT_ID_KEY = 'session_parent_id'
const SESSION_PARENT_NAME_KEY = 'session_parent_name'
const SESSION_CHILDREN_KEY = 'session_children'

export interface StoredSession {
  authToken: string
  expiryTimestamp: number
  parentId: string
  parentName: string
  children: ApiChild[]
}

export const createExpiryTimestamp = (): number => Date.now() + SESSION_TTL_MS

export const persistSession = (
  loginResponse: LoginResponse,
  expiryTimestamp: number,
): StoredSession => {
  if (typeof window === 'undefined') {
    return {
      authToken: loginResponse.authToken,
      expiryTimestamp,
      parentId: loginResponse.parentId,
      parentName: loginResponse.parentName,
      children: loginResponse.children,
    }
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, loginResponse.authToken)
  window.localStorage.setItem(EXPIRY_TIMESTAMP_KEY, String(expiryTimestamp))
  window.localStorage.setItem(SESSION_PARENT_ID_KEY, loginResponse.parentId)
  window.localStorage.setItem(SESSION_PARENT_NAME_KEY, loginResponse.parentName)
  window.localStorage.setItem(SESSION_CHILDREN_KEY, JSON.stringify(loginResponse.children))

  return {
    authToken: loginResponse.authToken,
    expiryTimestamp,
    parentId: loginResponse.parentId,
    parentName: loginResponse.parentName,
    children: loginResponse.children,
  }
}

export const clearStoredSession = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(EXPIRY_TIMESTAMP_KEY)
  window.localStorage.removeItem(SESSION_PARENT_ID_KEY)
  window.localStorage.removeItem(SESSION_PARENT_NAME_KEY)
  window.localStorage.removeItem(SESSION_CHILDREN_KEY)
}

export const readStoredSession = (): StoredSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const authToken = window.localStorage.getItem(AUTH_TOKEN_KEY)
  const expiryTimestampValue = window.localStorage.getItem(EXPIRY_TIMESTAMP_KEY)
  const parentId = window.localStorage.getItem(SESSION_PARENT_ID_KEY)
  const parentName = window.localStorage.getItem(SESSION_PARENT_NAME_KEY)
  const childrenValue = window.localStorage.getItem(SESSION_CHILDREN_KEY)

  if (!authToken || !expiryTimestampValue || !parentId || !parentName || !childrenValue) {
    return null
  }

  const expiryTimestamp = Number(expiryTimestampValue)

  if (!Number.isFinite(expiryTimestamp)) {
    return null
  }

  try {
    const children = JSON.parse(childrenValue) as ApiChild[]

    return {
      authToken,
      expiryTimestamp,
      parentId,
      parentName,
      children,
    }
  } catch {
    return null
  }
}

export const isSessionExpired = (expiryTimestamp: number): boolean => Date.now() > expiryTimestamp

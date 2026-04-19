import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getStoredToken, setStoredToken } from '../api/http'

const USER_KEY = 'techstore_user'

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
  else localStorage.removeItem(USER_KEY)
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = getStoredToken()
    const u = readUser()
    setToken(t)
    setUserState(u)
    setReady(true)
  }, [])

  const login = useCallback((payload) => {
    setStoredToken(payload.token)
    writeUser(payload.utilisateur)
    setToken(payload.token)
    setUserState(payload.utilisateur)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    writeUser(null)
    setToken(null)
    setUserState(null)
  }, [])

  const setUser = useCallback((u) => {
    writeUser(u)
    setUserState(u)
  }, [])

  const value = useMemo(
    () => ({ user, token, ready, login, logout, setUser }),
    [user, token, ready, login, logout, setUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}

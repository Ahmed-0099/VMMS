import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AUTH_TOKEN_STORAGE_KEY } from '../services/api'
import * as authService from '../services/authService'
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    let isMounted = true

    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await authService.getMe()

        if (isMounted) {
          setUser(response.user)
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
    }

    window.addEventListener('vmms:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('vmms:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    return response.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

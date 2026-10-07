import { useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
} from '../api/auth'
import { getAccessToken } from '../api/client'

import { AuthContext } from './context'

function roleHome(role) {
  if (role === 'Professional') return '/dashboard/professional'
  if (role === 'Admin') return '/admin'
  return '/dashboard/customer'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        let currentUser
        if (getAccessToken()) {
          currentUser = await getCurrentUser()
        } else {
          await refreshSession()
          currentUser = await getCurrentUser()
        }
        if (active) setUser(currentUser)
      } catch (error) {
        if (!active) return
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          setSessionError('Unable to verify your session. Please check your connection and try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [])

  async function signIn(email, password) {
    const response = await loginRequest(email, password)
    const authenticatedUser = {
      id: response.userId,
      email: response.email,
      role: response.role,
      profile: response.profile,
    }
    setUser(authenticatedUser)
    setSessionError('')
    return authenticatedUser
  }

  async function signUp(registration) {
    const response = await registerRequest(registration)
    const authenticatedUser = {
      id: response.userId,
      email: response.email,
      role: response.role,
      profile: response.profile,
    }
    setUser(authenticatedUser)
    setSessionError('')
    return authenticatedUser
  }

  async function signOut() {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    sessionError,
    signIn,
    signUp,
    signOut,
    roleHome: user ? roleHome(user.role) : '/auth',
  }), [user, loading, sessionError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

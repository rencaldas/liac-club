import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthSession, StaffCredentials, UpdateProfilePayload } from '../types/entities'
import { apiClient } from '../services/client'

const STORAGE_KEY = 'liac_staff_session'

interface AuthContextValue {
  session: AuthSession | null
  isLoading: boolean
  login(credentials: StaffCredentials): Promise<void>
  logout(): Promise<void>
  /** Stores an already-issued session directly (e.g. right after /set-password), skipping login. */
  setSession(session: AuthSession): void
  /** Saves the logged-in collaborator's own profile edits and refreshes the stored session. */
  updateProfile(payload: UpdateProfilePayload): Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => readStoredSession())
  const [isLoading, setIsLoading] = useState(false)

  function persistSession(newSession: AuthSession) {
    setSessionState(newSession)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
  }

  async function login(credentials: StaffCredentials) {
    setIsLoading(true)
    try {
      const newSession = await apiClient.login(credentials)
      persistSession(newSession)
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    if (session) {
      try {
        await apiClient.logout(session.token)
      } catch {
        // Best-effort server-side revocation — the local session is cleared regardless so the
        // user is never stuck logged in on the client after asking to log out.
      }
    }
    setSessionState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!session) return
    const updated = await apiClient.updateOwnProfile(payload, session.token)
    persistSession(updated)
  }

  return (
    <AuthContext.Provider
      value={{ session, isLoading, login, logout, setSession: persistSession, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

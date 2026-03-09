import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'

const VIEWER_SESSION_KEY = 'viewer_session'

interface ViewerSession {
  session_token: string
  network_id: string
  allowed_categories: string[]
  allowed_rooms: string[]
  can_edit: boolean
  expires_at: string
}

interface AuthContextType {
  user: User | null
  viewerSession: ViewerSession | null
  isOwner: boolean
  isViewer: boolean
  canEdit: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  loginAsViewer: (code: string) => Promise<{ error: string | null }>
  logoutViewer: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [viewerSession, setViewerSession] = useState<ViewerSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get current auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Restore viewer session from AsyncStorage
    AsyncStorage.getItem(VIEWER_SESSION_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ViewerSession
          if (new Date(parsed.expires_at) > new Date()) {
            setViewerSession(parsed)
          } else {
            AsyncStorage.removeItem(VIEWER_SESSION_KEY)
          }
        } catch {
          AsyncStorage.removeItem(VIEWER_SESSION_KEY)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const loginAsViewer = useCallback(async (code: string) => {
    const { data, error } = await supabase.rpc('validate_viewer_code', { p_code: code })
    if (error) {
      return { error: error.message }
    }
    if (data?.error) {
      return { error: data.error }
    }
    const session = data as ViewerSession
    setViewerSession(session)
    await AsyncStorage.setItem(VIEWER_SESSION_KEY, JSON.stringify(session))
    return { error: null }
  }, [])

  const logoutViewer = useCallback(() => {
    setViewerSession(null)
    AsyncStorage.removeItem(VIEWER_SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      viewerSession,
      isOwner: !!user,
      isViewer: !!viewerSession && !user,
      canEdit: !!user || (!!viewerSession && viewerSession.can_edit),
      isLoading,
      signIn,
      signOut,
      loginAsViewer,
      logoutViewer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

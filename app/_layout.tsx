import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import '../global.css'

export { ErrorBoundary } from 'expo-router'

function NotificationRegistrar() {
  usePushNotifications()
  return null
}

function AuthGate() {
  const { user, viewerSession, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    const isAuthenticated = !!user || !!viewerSession

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [user, viewerSession, isLoading, segments])

  if (isLoading) return null

  return <Slot />
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationRegistrar />
          <AuthGate />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

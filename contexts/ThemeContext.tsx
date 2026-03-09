import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = 'theme'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light')
  const [isReady, setIsReady] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored)
      }
      setIsReady(true)
    })
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    AsyncStorage.setItem(THEME_KEY, t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      AsyncStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  if (!isReady) return null

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

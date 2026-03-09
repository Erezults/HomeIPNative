import { useEffect, useRef } from 'react'
import { View, Text, ActivityIndicator, Animated, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
}

const COLORS = {
  saving: '#3b82f6',
  saved: '#22c55e',
  error: '#ef4444',
  textLight: '#475569',
  textDark: '#94a3b8',
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const { isDark } = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }

    if (status === 'idle') {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
      return
    }

    // Show
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()

    if (status === 'saved') {
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      }, 2000)
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [status, opacity])

  if (status === 'idle') return null

  const textColor = isDark ? COLORS.textDark : COLORS.textLight

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {status === 'saving' && (
        <>
          <ActivityIndicator size="small" color={COLORS.saving} />
          <Text style={[styles.text, { color: textColor }]}>Saving...</Text>
        </>
      )}
      {status === 'saved' && (
        <>
          <Text style={[styles.icon, { color: COLORS.saved }]}>✓</Text>
          <Text style={[styles.text, { color: textColor }]}>Saved</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={[styles.icon, { color: COLORS.error }]}>✕</Text>
          <Text style={[styles.text, { color: COLORS.error }]}>Error</Text>
        </>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
})

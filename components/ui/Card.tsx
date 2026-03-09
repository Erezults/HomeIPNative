import { View, Text, StyleSheet } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface CardProps {
  title?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

const COLORS = {
  bgLight: '#ffffff',
  bgDark: '#16213e',
  borderLight: '#e2e8f0',
  borderDark: '#1e293b',
  titleLight: '#1e293b',
  titleDark: '#e2e8f0',
}

export function Card({ title, children, style }: CardProps) {
  const { isDark } = useTheme()
  const { isRTL } = useLanguage()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? COLORS.bgDark : COLORS.bgLight,
          borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
          shadowColor: isDark ? '#000' : '#94a3b8',
        },
        style,
      ]}
    >
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: isDark ? COLORS.titleDark : COLORS.titleLight,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
})

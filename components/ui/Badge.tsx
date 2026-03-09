import { View, Text, StyleSheet } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  icon?: ReactNode
  style?: StyleProp<ViewStyle>
}

const VARIANT_COLORS: Record<BadgeVariant, { bgLight: string; bgDark: string; textLight: string; textDark: string; borderLight?: string; borderDark?: string }> = {
  default: {
    bgLight: '#e2e8f0',
    bgDark: '#334155',
    textLight: '#1e293b',
    textDark: '#e2e8f0',
  },
  success: {
    bgLight: '#dcfce7',
    bgDark: '#14532d',
    textLight: '#166534',
    textDark: '#86efac',
  },
  warning: {
    bgLight: '#fef9c3',
    bgDark: '#713f12',
    textLight: '#854d0e',
    textDark: '#fde047',
  },
  destructive: {
    bgLight: '#fee2e2',
    bgDark: '#7f1d1d',
    textLight: '#991b1b',
    textDark: '#fca5a5',
  },
  outline: {
    bgLight: 'transparent',
    bgDark: 'transparent',
    textLight: '#475569',
    textDark: '#94a3b8',
    borderLight: '#cbd5e1',
    borderDark: '#475569',
  },
}

export function Badge({ variant = 'default', children, icon, style }: BadgeProps) {
  const { isDark } = useTheme()
  const colors = VARIANT_COLORS[variant]

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? colors.bgDark : colors.bgLight,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline'
            ? isDark
              ? colors.borderDark
              : colors.borderLight
            : 'transparent',
        },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          { color: isDark ? colors.textDark : colors.textLight },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})

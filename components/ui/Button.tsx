import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'
import type { PressableProps, ViewStyle, TextStyle } from 'react-native'
import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const COLORS = {
  primary: '#3b82f6',
  primaryPressed: '#2563eb',
  destructive: '#ef4444',
  destructivePressed: '#dc2626',
  secondaryLight: '#e2e8f0',
  secondaryDark: '#334155',
  secondaryPressedLight: '#cbd5e1',
  secondaryPressedDark: '#475569',
  ghostPressedLight: 'rgba(0,0,0,0.05)',
  ghostPressedDark: 'rgba(255,255,255,0.1)',
  outlineBorderLight: '#cbd5e1',
  outlineBorderDark: '#475569',
  textLight: '#1e293b',
  textDark: '#e2e8f0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const { isDark } = useTheme()
  const isDisabled = disabled || loading

  const getBackgroundColor = (pressed: boolean): string => {
    if (variant === 'primary') return pressed ? COLORS.primaryPressed : COLORS.primary
    if (variant === 'destructive') return pressed ? COLORS.destructivePressed : COLORS.destructive
    if (variant === 'secondary') {
      if (isDark) return pressed ? COLORS.secondaryPressedDark : COLORS.secondaryDark
      return pressed ? COLORS.secondaryPressedLight : COLORS.secondaryLight
    }
    if (variant === 'ghost') return pressed ? (isDark ? COLORS.ghostPressedDark : COLORS.ghostPressedLight) : 'transparent'
    if (variant === 'outline') return pressed ? (isDark ? COLORS.ghostPressedDark : COLORS.ghostPressedLight) : 'transparent'
    return COLORS.primary
  }

  const getTextColor = (): string => {
    if (variant === 'primary' || variant === 'destructive') return '#ffffff'
    return isDark ? COLORS.textDark : COLORS.textLight
  }

  const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
    sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13, borderRadius: 6 },
    md: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 15, borderRadius: 8 },
    lg: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 17, borderRadius: 10 },
  }

  const s = sizeStyles[size]

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          backgroundColor: getBackgroundColor(pressed),
          opacity: isDisabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? (isDark ? COLORS.outlineBorderDark : COLORS.outlineBorderLight) : 'transparent',
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { fontSize: s.fontSize, color: getTextColor() }]}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
})

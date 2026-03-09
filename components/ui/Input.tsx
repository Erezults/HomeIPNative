import { View, Text, TextInput, StyleSheet } from 'react-native'
import type { TextInputProps, ViewStyle } from 'react-native'
import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  containerStyle?: ViewStyle
}

const COLORS = {
  bgLight: '#ffffff',
  bgDark: '#16213e',
  borderLight: '#cbd5e1',
  borderDark: '#334155',
  borderFocus: '#3b82f6',
  borderError: '#ef4444',
  textLight: '#1e293b',
  textDark: '#e2e8f0',
  placeholderLight: '#94a3b8',
  placeholderDark: '#64748b',
  labelLight: '#475569',
  labelDark: '#94a3b8',
  errorColor: '#ef4444',
}

export function Input({
  label,
  error,
  iconLeft,
  iconRight,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const { isDark } = useTheme()
  const { isRTL } = useLanguage()

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: isDark ? COLORS.labelDark : COLORS.labelLight,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? COLORS.bgDark : COLORS.bgLight,
            borderColor: error ? COLORS.borderError : isDark ? COLORS.borderDark : COLORS.borderLight,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
        <TextInput
          placeholderTextColor={isDark ? COLORS.placeholderDark : COLORS.placeholderLight}
          style={[
            styles.input,
            {
              color: isDark ? COLORS.textDark : COLORS.textLight,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
            style,
          ]}
          {...rest}
        />
        {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
      </View>
      {error ? (
        <Text
          style={[
            styles.error,
            { textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  icon: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
})

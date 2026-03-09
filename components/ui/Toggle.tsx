import { View, Text, Switch, StyleSheet } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface ToggleProps {
  label?: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

const COLORS = {
  trackActiveLight: '#3b82f6',
  trackActiveDark: '#3b82f6',
  trackInactiveLight: '#cbd5e1',
  trackInactiveDark: '#334155',
  thumbLight: '#ffffff',
  thumbDark: '#e2e8f0',
  labelLight: '#1e293b',
  labelDark: '#e2e8f0',
}

export function Toggle({ label, value, onChange, disabled = false, style }: ToggleProps) {
  const { isDark } = useTheme()
  const { isRTL } = useLanguage()

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
        style,
      ]}
    >
      {label ? (
        <Text
          style={[
            styles.label,
            { color: isDark ? COLORS.labelDark : COLORS.labelLight },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{
          false: isDark ? COLORS.trackInactiveDark : COLORS.trackInactiveLight,
          true: isDark ? COLORS.trackActiveDark : COLORS.trackActiveLight,
        }}
        thumbColor={isDark ? COLORS.thumbDark : COLORS.thumbLight}
        ios_backgroundColor={isDark ? COLORS.trackInactiveDark : COLORS.trackInactiveLight}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
})

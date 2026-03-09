import { View, Text, Pressable, ActionSheetIOS, Platform, StyleSheet } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  style?: StyleProp<ViewStyle>
}

const COLORS = {
  bgLight: '#ffffff',
  bgDark: '#16213e',
  borderLight: '#cbd5e1',
  borderDark: '#334155',
  textLight: '#1e293b',
  textDark: '#e2e8f0',
  placeholderLight: '#94a3b8',
  placeholderDark: '#64748b',
  labelLight: '#475569',
  labelDark: '#94a3b8',
  chevronLight: '#64748b',
  chevronDark: '#94a3b8',
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  style,
}: SelectProps) {
  const { isDark } = useTheme()
  const { isRTL } = useLanguage()

  const selectedLabel = options.find((o) => o.value === value)?.label

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      const labels = options.map((o) => o.label)
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...labels, 'Cancel'],
          cancelButtonIndex: labels.length,
        },
        (buttonIndex) => {
          if (buttonIndex < labels.length) {
            onChange(options[buttonIndex].value)
          }
        },
      )
    }
    // On Android, a custom picker modal could be used.
    // For now, ActionSheet covers iOS. Android can be extended.
  }

  return (
    <View style={[styles.container, style]}>
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
      <Pressable
        onPress={handlePress}
        style={[
          styles.select,
          {
            backgroundColor: isDark ? COLORS.bgDark : COLORS.bgLight,
            borderColor: isDark ? COLORS.borderDark : COLORS.borderLight,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Text
          style={[
            styles.valueText,
            {
              color: selectedLabel
                ? isDark
                  ? COLORS.textDark
                  : COLORS.textLight
                : isDark
                  ? COLORS.placeholderDark
                  : COLORS.placeholderLight,
            },
          ]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        <Text style={{ color: isDark ? COLORS.chevronDark : COLORS.chevronLight, fontSize: 12 }}>
          ▼
        </Text>
      </Pressable>
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
  select: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 15,
    flex: 1,
  },
})

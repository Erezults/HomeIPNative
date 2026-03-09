import { Pressable, Text, StyleSheet } from 'react-native'
import type { PressableProps, ViewStyle, StyleProp } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

interface FABProps extends Omit<PressableProps, 'style'> {
  icon?: string
  style?: StyleProp<ViewStyle>
}

const COLORS = {
  bg: '#3b82f6',
  bgPressed: '#2563eb',
  shadow: '#1e40af',
}

export function FAB({ icon = '+', style, ...rest }: FABProps) {
  const { isDark } = useTheme()

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: pressed ? COLORS.bgPressed : COLORS.bg,
          shadowColor: isDark ? '#000' : COLORS.shadow,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
})

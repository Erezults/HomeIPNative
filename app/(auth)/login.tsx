import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginScreen() {
  const { isDark } = useTheme()

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>HomeIP</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Login Screen
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
})

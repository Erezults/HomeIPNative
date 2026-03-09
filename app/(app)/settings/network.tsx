import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NetworkSettingsScreen() {
  const { isDark } = useTheme()
  const { t } = useLanguage()

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t.settings.network}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Network settings placeholder
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
})

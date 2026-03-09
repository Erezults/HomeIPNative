import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface SettingsItemProps {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  route: string
  colors: { text: string; mutedText: string; border: string }
}

function SettingsItem({ title, icon, route, colors }: SettingsItemProps) {
  const router = useRouter()

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={colors.mutedText} />
        <Text style={[styles.itemText, { color: colors.text }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const { isDark } = useTheme()
  const { t } = useLanguage()

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#2a2a3e' : '#e5e7eb',
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t.settings.title}
      </Text>

      <View style={styles.list}>
        <SettingsItem
          title={t.settings.network}
          icon="globe-outline"
          route="/(app)/settings/network"
          colors={colors}
        />
        <SettingsItem
          title={t.settings.categories}
          icon="grid-outline"
          route="/(app)/settings/categories"
          colors={colors}
        />
        <SettingsItem
          title={t.settings.rooms}
          icon="home-outline"
          route="/(app)/settings/rooms"
          colors={colors}
        />
        <SettingsItem
          title={t.settings.viewers}
          icon="eye-outline"
          route="/(app)/settings/viewers"
          colors={colors}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 8,
  },
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    fontSize: 16,
  },
})

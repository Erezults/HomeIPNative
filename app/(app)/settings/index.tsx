import { useState } from 'react'
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type SaveStatus = 'idle' | 'saving' | 'saved'

interface SettingsItemProps {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  route: string
  colors: { text: string; mutedText: string; border: string }
  isRTL: boolean
}

function SettingsItem({ title, icon, route, colors, isRTL }: SettingsItemProps) {
  const router = useRouter()

  return (
    <TouchableOpacity
      style={[styles.navItem, { borderBottomColor: colors.border }]}
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.navItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name={icon} size={22} color={colors.mutedText} />
        <Text style={[styles.navItemText, { color: colors.text }]}>{title}</Text>
      </View>
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={colors.mutedText}
      />
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const { isDark, theme, setTheme } = useTheme()
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { user } = useAuth()
  const [themeStatus, setThemeStatus] = useState<SaveStatus>('idle')
  const [langStatus, setLangStatus] = useState<SaveStatus>('idle')

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    cardBg: isDark ? '#16213e' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#2a2a3e' : '#e5e7eb',
    activeSegment: '#3b82f6',
    segmentBg: isDark ? '#1a1a2e' : '#e2e8f0',
  }

  const saveSettings = async (settings: { theme: string; language: string }, setStatus: (s: SaveStatus) => void) => {
    if (!user) return
    setStatus('saving')
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, theme: settings.theme, language: settings.language },
        { onConflict: 'user_id' }
      )
    if (!error) {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('idle')
    }
  }

  const handleThemeToggle = (value: boolean) => {
    const newTheme = value ? 'dark' : 'light'
    setTheme(newTheme)
    saveSettings({ theme: newTheme, language }, setThemeStatus)
  }

  const handleLanguageChange = (lang: 'he' | 'en') => {
    setLanguage(lang)
    saveSettings({ theme, language: lang }, setLangStatus)
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {t.settings.title}
      </Text>

      {/* General Settings - inline */}
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t.settings.general}
        </Text>

        {/* Theme toggle */}
        <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.settingInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={22}
              color={colors.mutedText}
            />
            <View>
              <Text style={[styles.settingLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t.settings.theme}
              </Text>
              <Text style={[styles.settingValue, { color: colors.mutedText, textAlign: isRTL ? 'right' : 'left' }]}>
                {isDark ? t.settings.dark : t.settings.light}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {themeStatus === 'saving' && (
              <Text style={[styles.saveStatusText, { color: colors.mutedText }]}>...</Text>
            )}
            {themeStatus === 'saved' && (
              <Text style={[styles.saveStatusText, { color: '#22c55e' }]}>{'\u2713'}</Text>
            )}
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={isDark ? '#e2e8f0' : '#ffffff'}
              ios_backgroundColor="#cbd5e1"
            />
          </View>
        </View>

        {/* Language selector - segmented control */}
        <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {t.settings.language}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {langStatus === 'saving' && (
              <Text style={[styles.saveStatusText, { color: colors.mutedText }]}>...</Text>
            )}
            {langStatus === 'saved' && (
              <Text style={[styles.saveStatusText, { color: '#22c55e' }]}>{'\u2713'}</Text>
            )}
            <View style={[styles.segmentedControl, { backgroundColor: colors.segmentBg }]}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  language === 'en' && [styles.segmentButtonActive, { backgroundColor: colors.activeSegment }],
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: language === 'en' ? '#ffffff' : colors.text },
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  language === 'he' && [styles.segmentButtonActive, { backgroundColor: colors.activeSegment }],
                ]}
                onPress={() => handleLanguageChange('he')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: language === 'he' ? '#ffffff' : colors.text },
                  ]}
                >
                  {'\u05E2\u05D1\u05E8\u05D9\u05EA'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation items */}
      <View style={[styles.navList, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <SettingsItem
          title={t.settings.network}
          icon="globe-outline"
          route="/(app)/settings/network"
          colors={colors}
          isRTL={isRTL}
        />
        <SettingsItem
          title={t.settings.categories}
          icon="grid-outline"
          route="/(app)/settings/categories"
          colors={colors}
          isRTL={isRTL}
        />
        <SettingsItem
          title={t.settings.rooms}
          icon="home-outline"
          route="/(app)/settings/rooms"
          colors={colors}
          isRTL={isRTL}
        />
        <SettingsItem
          title={t.settings.viewers}
          icon="eye-outline"
          route="/(app)/settings/viewers"
          colors={colors}
          isRTL={isRTL}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 12,
    marginTop: 2,
  },
  saveStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navList: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemText: {
    fontSize: 16,
  },
})

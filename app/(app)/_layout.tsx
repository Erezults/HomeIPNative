import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VersionModal } from '@/components/layout/VersionModal'

export default function AppLayout() {
  const { isViewer } = useAuth()
  const { isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [versionModalVisible, setVersionModalVisible] = useState(false)

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    tabBarBg: isDark ? '#1a1a2e' : '#ffffff',
    tabBarBorder: isDark ? '#2a2a3e' : '#e5e7eb',
    tabBarActive: isDark ? '#60a5fa' : '#2563eb',
    tabBarInactive: isDark ? '#6b7280' : '#9ca3af',
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header onVersionPress={() => setVersionModalVisible(true)} />

      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.tabBarActive,
            tabBarInactiveTintColor: colors.tabBarInactive,
            tabBarStyle: {
              backgroundColor: colors.tabBarBg,
              borderTopColor: colors.tabBarBorder,
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
              // Hide settings tab for viewers
              href: isViewer ? null : '/(app)/settings',
            }}
          />
        </Tabs>
      </View>

      <Footer />

      <VersionModal
        visible={versionModalVisible}
        onClose={() => setVersionModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})

import { Stack } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'

export default function SettingsLayout() {
  const { isDark } = useTheme()

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    headerBg: isDark ? '#1a1a2e' : '#ffffff',
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Settings', headerShown: false }}
      />
      <Stack.Screen
        name="network"
        options={{ title: 'Network Settings' }}
      />
      <Stack.Screen
        name="categories"
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="rooms"
        options={{ title: 'Rooms' }}
      />
      <Stack.Screen
        name="viewers"
        options={{ title: 'Viewers' }}
      />
    </Stack>
  )
}

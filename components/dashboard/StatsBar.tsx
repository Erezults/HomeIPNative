import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface StatsBarProps {
  totalDevices: number
  activeDevices: number
  availableIPs: number
}

interface StatItem {
  label: string
  value: number
  icon: keyof typeof Ionicons.glyphMap
  color: string
  bgLight: string
  bgDark: string
  borderLight: string
  borderDark: string
}

export function StatsBar({ totalDevices, activeDevices, availableIPs }: StatsBarProps) {
  const { isDark } = useTheme()
  const { t } = useLanguage()

  const stats: StatItem[] = [
    {
      label: t.dashboard.totalDevices,
      value: totalDevices,
      icon: 'desktop-outline',
      color: '#3b82f6',
      bgLight: 'rgba(59,130,246,0.1)',
      bgDark: 'rgba(59,130,246,0.2)',
      borderLight: 'rgba(59,130,246,0.2)',
      borderDark: 'rgba(59,130,246,0.3)',
    },
    {
      label: t.dashboard.activeDevices,
      value: activeDevices,
      icon: 'wifi-outline',
      color: '#10b981',
      bgLight: 'rgba(16,185,129,0.1)',
      bgDark: 'rgba(16,185,129,0.2)',
      borderLight: 'rgba(16,185,129,0.2)',
      borderDark: 'rgba(16,185,129,0.3)',
    },
    {
      label: t.dashboard.availableIPs,
      value: availableIPs,
      icon: 'grid-outline',
      color: '#f59e0b',
      bgLight: 'rgba(245,158,11,0.1)',
      bgDark: 'rgba(245,158,11,0.2)',
      borderLight: 'rgba(245,158,11,0.2)',
      borderDark: 'rgba(245,158,11,0.3)',
    },
  ]

  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? stat.bgDark : stat.bgLight,
              borderColor: isDark ? stat.borderDark : stat.borderLight,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? stat.bgDark : stat.bgLight },
            ]}
          >
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text style={[styles.value, { color: isDark ? '#ffffff' : '#111827' }]}>
            {stat.value}
          </Text>
          <Text
            style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}
            numberOfLines={1}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
})

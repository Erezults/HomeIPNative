import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import type { Device } from '@/types/database'

interface DeviceRowProps {
  device: Device
  categoryColor: string
  onPress: () => void
  onLongPress?: () => void
}

export function DeviceRow({ device, categoryColor, onPress, onLongPress }: DeviceRowProps) {
  const { isDark } = useTheme()

  const colors = {
    bg: isDark ? '#16213e' : '#ffffff',
    border: isDark ? '#1e293b' : '#e2e8f0',
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    imageBg: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.1)',
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? (isDark ? '#1e293b' : '#f1f5f9') : colors.bg,
          borderColor: colors.border,
          borderLeftColor: categoryColor,
          borderLeftWidth: 3,
        },
      ]}
    >
      {device.image_url ? (
        <Image
          source={{ uri: device.image_url }}
          style={[styles.image, { backgroundColor: colors.imageBg }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.imageBg }]}>
          <Ionicons name="desktop-outline" size={16} color={colors.muted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {device.name}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: device.is_active ? '#10b981' : '#9ca3af' },
          ]}
        />
      </View>

      <Text style={[styles.ip, { color: colors.muted }]}>{device.ip_address}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  imagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ip: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
})

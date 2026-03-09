import { useState } from 'react'
import { View, Text, Pressable, Image, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Badge } from '@/components/ui/Badge'
import { DeviceRow } from './DeviceRow'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getIPRange } from '@/lib/ip-utils'
import { getLocalizedName } from '@/lib/localized-name'
import type { Device, Category, Room } from '@/types/database'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface CategorySectionProps {
  category: Category | null
  devices: Device[]
  rooms: Room[]
  onDeviceClick: (device: Device) => void
  onDeviceLongPress?: (device: Device) => void
}

export function CategorySection({
  category,
  devices,
  rooms,
  onDeviceClick,
  onDeviceLongPress,
}: CategorySectionProps) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const categoryColor = category?.color ?? '#6b7280'
  const categoryName = category ? getLocalizedName(category, language) : t.device.noCategory
  const ipRange = getIPRange(devices)

  // Group devices by room
  const devicesByRoom = new Map<string | null, Device[]>()
  for (const device of devices) {
    const roomId = device.room_id
    if (!devicesByRoom.has(roomId)) devicesByRoom.set(roomId, [])
    devicesByRoom.get(roomId)!.push(device)
  }

  // Sort: rooms with IDs first (by sort_order), then null room last
  const roomEntries = Array.from(devicesByRoom.entries()).sort(([a], [b]) => {
    if (a === null) return 1
    if (b === null) return -1
    const roomA = rooms.find((r) => r.id === a)
    const roomB = rooms.find((r) => r.id === b)
    return (roomA?.sort_order ?? 0) - (roomB?.sort_order ?? 0)
  })

  const hasMultipleRooms = roomEntries.length > 1

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)
  }

  const chevronName = isExpanded
    ? 'chevron-down'
    : isRTL
      ? 'chevron-back'
      : 'chevron-forward'

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleExpand}
        style={[
          styles.header,
          { backgroundColor: categoryColor },
        ]}
      >
        {category?.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.headerText} numberOfLines={1}>
          {categoryName}
        </Text>
        <Badge
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.badgeText}>{devices.length}</Text>
        </Badge>
        {ipRange ? (
          <Text style={styles.ipRange} numberOfLines={1}>
            {ipRange}
          </Text>
        ) : null}
        <Ionicons
          name={chevronName}
          size={16}
          color="rgba(255,255,255,0.7)"
          style={styles.chevron}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          {rooms.length === 0 ? (
            // No room grouping - flat list
            <View style={styles.deviceList}>
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  categoryColor={categoryColor}
                  onPress={() => onDeviceClick(device)}
                  onLongPress={onDeviceLongPress ? () => onDeviceLongPress(device) : undefined}
                />
              ))}
            </View>
          ) : (
            roomEntries.map(([roomId, roomDevices]) => {
              const room = roomId ? rooms.find((r) => r.id === roomId) ?? null : null

              if (hasMultipleRooms) {
                return (
                  <RoomSubSection
                    key={roomId ?? '__none__'}
                    room={room}
                    devices={roomDevices}
                    categoryColor={categoryColor}
                    onDeviceClick={onDeviceClick}
                    onDeviceLongPress={onDeviceLongPress}
                  />
                )
              }

              return (
                <View key={roomId ?? '__none__'} style={styles.deviceList}>
                  {roomDevices.map((device) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      categoryColor={categoryColor}
                      onPress={() => onDeviceClick(device)}
                      onLongPress={onDeviceLongPress ? () => onDeviceLongPress(device) : undefined}
                    />
                  ))}
                </View>
              )
            })
          )}
        </View>
      )}
    </View>
  )
}

// Collapsible room sub-section within a category
function RoomSubSection({
  room,
  devices,
  categoryColor,
  onDeviceClick,
  onDeviceLongPress,
}: {
  room: Room | null
  devices: Device[]
  categoryColor: string
  onDeviceClick: (device: Device) => void
  onDeviceLongPress?: (device: Device) => void
}) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const roomName = room ? getLocalizedName(room, language) : t.device.noRoom
  const roomColor = room?.color ?? '#6b7280'
  const ipRange = getIPRange(devices)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)
  }

  const chevronName = isExpanded
    ? 'chevron-down'
    : isRTL
      ? 'chevron-back'
      : 'chevron-forward'

  return (
    <View style={styles.subContainer}>
      <Pressable
        onPress={toggleExpand}
        style={[
          styles.subHeader,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
        ]}
      >
        <View style={[styles.roomDot, { backgroundColor: roomColor }]} />
        <Text
          style={[styles.subHeaderText, { color: isDark ? '#94a3b8' : '#64748b' }]}
          numberOfLines={1}
        >
          {roomName}
        </Text>
        <Badge variant="outline">
          {devices.length}
        </Badge>
        {ipRange ? (
          <Text
            style={[styles.subIpRange, { color: isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.7)' }]}
            numberOfLines={1}
          >
            {ipRange}
          </Text>
        ) : null}
        <Ionicons
          name={chevronName}
          size={14}
          color={isDark ? '#94a3b8' : '#64748b'}
          style={styles.chevron}
        />
      </Pressable>

      {isExpanded && (
        <View style={[styles.deviceList, { paddingLeft: 8 }]}>
          {devices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              categoryColor={categoryColor}
              onPress={() => onDeviceClick(device)}
              onLongPress={onDeviceLongPress ? () => onDeviceLongPress(device) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  ipRange: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  content: {
    paddingLeft: 8,
    gap: 6,
  },
  deviceList: {
    gap: 4,
  },
  subContainer: {
    gap: 4,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  roomDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subHeaderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subIpRange: {
    fontSize: 10,
    fontFamily: 'monospace',
    flex: 1,
  },
})

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

interface RoomSectionProps {
  room: Room | null
  devices: Device[]
  categories: Category[]
  onDeviceClick: (device: Device) => void
  onDeviceLongPress?: (device: Device) => void
}

export function RoomSection({
  room,
  devices,
  categories,
  onDeviceClick,
  onDeviceLongPress,
}: RoomSectionProps) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const roomColor = room?.color ?? '#6b7280'
  const roomName = room ? getLocalizedName(room, language) : t.device.noRoom
  const ipRange = getIPRange(devices)

  // Group devices by category
  const devicesByCategory = new Map<string | null, Device[]>()
  for (const device of devices) {
    const catId = device.category_id
    if (!devicesByCategory.has(catId)) devicesByCategory.set(catId, [])
    devicesByCategory.get(catId)!.push(device)
  }

  // Sort: categories with IDs first (by sort_order), then null last
  const categoryEntries = Array.from(devicesByCategory.entries()).sort(([a], [b]) => {
    if (a === null) return 1
    if (b === null) return -1
    const catA = categories.find((c) => c.id === a)
    const catB = categories.find((c) => c.id === b)
    return (catA?.sort_order ?? 0) - (catB?.sort_order ?? 0)
  })

  const hasMultipleCategories = categoryEntries.length > 1

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
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
        ]}
      >
        <View
          style={[styles.roomIcon, { backgroundColor: roomColor }]}
        >
          <Text style={styles.roomIconText}>{room?.icon ?? '#'}</Text>
        </View>
        <Text
          style={[styles.headerText, { color: isDark ? '#e2e8f0' : '#1e293b' }]}
          numberOfLines={1}
        >
          {roomName}
        </Text>
        <Badge>
          {devices.length}
        </Badge>
        {ipRange ? (
          <Text
            style={[styles.ipRange, { color: isDark ? '#94a3b8' : '#64748b' }]}
            numberOfLines={1}
          >
            {ipRange}
          </Text>
        ) : null}
        <Ionicons
          name={chevronName}
          size={16}
          color={isDark ? '#94a3b8' : '#64748b'}
          style={styles.chevron}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          {categories.length === 0 ? (
            // No category grouping - flat list
            <View style={styles.deviceList}>
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  categoryColor={roomColor}
                  onPress={() => onDeviceClick(device)}
                  onLongPress={onDeviceLongPress ? () => onDeviceLongPress(device) : undefined}
                />
              ))}
            </View>
          ) : (
            categoryEntries.map(([catId, catDevices]) => {
              const category = catId ? categories.find((c) => c.id === catId) ?? null : null
              const catColor = category?.color ?? '#6b7280'

              if (hasMultipleCategories) {
                return (
                  <CategorySubSection
                    key={catId ?? '__none__'}
                    category={category}
                    devices={catDevices}
                    onDeviceClick={onDeviceClick}
                    onDeviceLongPress={onDeviceLongPress}
                  />
                )
              }

              return (
                <View key={catId ?? '__none__'} style={styles.deviceList}>
                  {catDevices.map((device) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      categoryColor={catColor}
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

// Collapsible category sub-section within a room
function CategorySubSection({
  category,
  devices,
  onDeviceClick,
  onDeviceLongPress,
}: {
  category: Category | null
  devices: Device[]
  onDeviceClick: (device: Device) => void
  onDeviceLongPress?: (device: Device) => void
}) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const categoryName = category ? getLocalizedName(category, language) : t.device.noCategory
  const categoryColor = category?.color ?? '#6b7280'
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
        style={[styles.subHeader, { backgroundColor: categoryColor }]}
      >
        {category?.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.subCategoryImage}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.subHeaderText} numberOfLines={1}>
          {categoryName}
        </Text>
        <Badge style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <Text style={styles.subBadgeText}>{devices.length}</Text>
        </Badge>
        {ipRange ? (
          <Text style={styles.subIpRange} numberOfLines={1}>
            {ipRange}
          </Text>
        ) : null}
        <Ionicons
          name={chevronName}
          size={14}
          color="rgba(255,255,255,0.7)"
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
  roomIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIconText: {
    fontSize: 14,
    color: '#ffffff',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 0,
  },
  ipRange: {
    fontSize: 11,
    fontFamily: 'monospace',
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
  subCategoryImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  subHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  subIpRange: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
})

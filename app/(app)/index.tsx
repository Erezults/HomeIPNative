import { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNetwork } from '@/hooks/useNetwork'
import { useDevices } from '@/hooks/useDevices'
import { getSubnetSize } from '@/lib/ip-utils'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { SearchFilter } from '@/components/dashboard/SearchFilter'
import { CategorySection } from '@/components/dashboard/CategorySection'
import { RoomSection } from '@/components/dashboard/RoomSection'
import { DeviceRow } from '@/components/dashboard/DeviceRow'
import { DeviceViewModal } from '@/components/devices/DeviceViewModal'
import { DeviceDialog } from '@/components/devices/DeviceDialog'
import { FAB } from '@/components/ui/FAB'
import type { Device } from '@/types/database'

const GROUPING_KEY = 'homeip_grouping'

interface GroupingState {
  categories: boolean
  rooms: boolean
}

function useGrouping() {
  const [grouping, setGroupingState] = useState<GroupingState>({ categories: true, rooms: true })
  const [loaded, setLoaded] = useState(false)

  // Load from storage
  if (!loaded) {
    AsyncStorage.getItem(GROUPING_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setGroupingState({
            categories: parsed.categories !== false,
            rooms: parsed.rooms !== false,
          })
        } catch { /* ignore */ }
      }
      setLoaded(true)
    })
  }

  const toggleGrouping = useCallback((key: 'categories' | 'rooms') => {
    setGroupingState((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      AsyncStorage.setItem(GROUPING_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { grouping, toggleGrouping }
}

export default function DashboardScreen() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const { canEdit } = useAuth()
  const { network, categories, rooms, loading: networkLoading, refetch: refetchNetwork } = useNetwork()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [roomFilter, setRoomFilter] = useState<string | null>(null)
  const { grouping, toggleGrouping } = useGrouping()

  const {
    devices,
    loading: devicesLoading,
    addDevice,
    updateDevice,
    deleteDevice,
    refetch: refetchDevices,
  } = useDevices({
    networkId: network?.id ?? null,
    search,
    categoryFilter,
    roomFilter,
  })

  // View modal state
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [viewDevice, setViewDevice] = useState<Device | null>(null)

  // Edit dialog state
  const [editDialogVisible, setEditDialogVisible] = useState(false)
  const [editDevice, setEditDevice] = useState<Device | null>(null)

  const [refreshing, setRefreshing] = useState(false)

  const loading = networkLoading || devicesLoading

  // Stats
  const totalDevices = devices.length
  const activeDevices = devices.filter((d) => d.is_active).length
  const availableIPs = useMemo(() => {
    if (!network?.subnet) return 0
    const subnetSize = getSubnetSize(network.subnet)
    return Math.max(0, subnetSize - devices.length)
  }, [network, devices])

  // Group devices by category
  const categoryEntries = useMemo(() => {
    const map = new Map<string | null, Device[]>()
    for (const device of devices) {
      const catId = device.category_id
      if (!map.has(catId)) map.set(catId, [])
      map.get(catId)!.push(device)
    }

    const entries: Array<{ categoryId: string | null; devices: Device[] }> = []
    for (const cat of categories) {
      const catDevices = map.get(cat.id)
      if (catDevices && catDevices.length > 0) {
        entries.push({ categoryId: cat.id, devices: catDevices })
      }
    }
    const uncategorized = map.get(null)
    if (uncategorized && uncategorized.length > 0) {
      entries.push({ categoryId: null, devices: uncategorized })
    }
    return entries
  }, [categories, devices])

  // Group devices by room
  const roomEntries = useMemo(() => {
    const map = new Map<string | null, Device[]>()
    for (const device of devices) {
      const rmId = device.room_id
      if (!map.has(rmId)) map.set(rmId, [])
      map.get(rmId)!.push(device)
    }

    const entries: Array<{ roomId: string | null; devices: Device[] }> = []
    for (const room of rooms) {
      const roomDevices = map.get(room.id)
      if (roomDevices && roomDevices.length > 0) {
        entries.push({ roomId: room.id, devices: roomDevices })
      }
    }
    const noRoom = map.get(null)
    if (noRoom && noRoom.length > 0) {
      entries.push({ roomId: null, devices: noRoom })
    }
    return entries
  }, [rooms, devices])

  const handleDeviceClick = (device: Device) => {
    setViewDevice(device)
    setViewModalVisible(true)
  }

  const handleDeviceLongPress = (device: Device) => {
    if (!canEdit) return
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t.device.edit, t.device.delete, t.device.cancel],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setEditDevice(device)
            setEditDialogVisible(true)
          } else if (buttonIndex === 1) {
            // Delete is handled inside DeviceDialog
            setEditDevice(device)
            setEditDialogVisible(true)
          }
        }
      )
    } else {
      // On Android, just open edit
      setEditDevice(device)
      setEditDialogVisible(true)
    }
  }

  const handleEditFromView = () => {
    setViewModalVisible(false)
    setEditDevice(viewDevice)
    setEditDialogVisible(true)
  }

  const handleAddDevice = () => {
    setEditDevice(null)
    setEditDialogVisible(true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchNetwork(), refetchDevices()])
    setRefreshing(false)
  }

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    muted: isDark ? '#9ca3af' : '#6b7280',
    toggleActiveBg: isDark ? '#3b82f6' : '#2563eb',
    toggleActiveText: '#ffffff',
    toggleInactiveBg: isDark ? '#1e293b' : '#ffffff',
    toggleInactiveText: isDark ? '#94a3b8' : '#6b7280',
    toggleBorder: isDark ? '#334155' : '#e2e8f0',
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#60a5fa' : '#3b82f6'}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Title row with grouping toggles */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t.dashboard.title}
          </Text>
          <View style={styles.groupingToggles}>
            <Pressable
              onPress={() => toggleGrouping('categories')}
              style={[
                styles.groupToggle,
                {
                  backgroundColor: grouping.categories
                    ? colors.toggleActiveBg
                    : colors.toggleInactiveBg,
                  borderColor: grouping.categories
                    ? colors.toggleActiveBg
                    : colors.toggleBorder,
                },
              ]}
            >
              <Ionicons
                name="layers-outline"
                size={14}
                color={grouping.categories ? colors.toggleActiveText : colors.toggleInactiveText}
              />
              <Text
                style={[
                  styles.groupToggleText,
                  {
                    color: grouping.categories
                      ? colors.toggleActiveText
                      : colors.toggleInactiveText,
                  },
                ]}
                numberOfLines={1}
              >
                {t.dashboard.groupByCategory}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleGrouping('rooms')}
              style={[
                styles.groupToggle,
                {
                  backgroundColor: grouping.rooms
                    ? colors.toggleActiveBg
                    : colors.toggleInactiveBg,
                  borderColor: grouping.rooms
                    ? colors.toggleActiveBg
                    : colors.toggleBorder,
                },
              ]}
            >
              <Ionicons
                name="home-outline"
                size={14}
                color={grouping.rooms ? colors.toggleActiveText : colors.toggleInactiveText}
              />
              <Text
                style={[
                  styles.groupToggleText,
                  {
                    color: grouping.rooms
                      ? colors.toggleActiveText
                      : colors.toggleInactiveText,
                  },
                ]}
                numberOfLines={1}
              >
                {t.dashboard.groupByRoom}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <StatsBar
          totalDevices={totalDevices}
          activeDevices={activeDevices}
          availableIPs={availableIPs}
        />

        {/* Search and filters */}
        <View style={styles.filterSection}>
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            roomFilter={roomFilter}
            onRoomChange={setRoomFilter}
            categories={categories}
            rooms={rooms}
          />
        </View>

        {/* Device list */}
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={colors.muted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t.dashboard.noDevices}
            </Text>
            {canEdit && (
              <Pressable
                onPress={handleAddDevice}
                style={[styles.addButton, { backgroundColor: '#3b82f6' }]}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
                <Text style={styles.addButtonText}>{t.dashboard.addDevice}</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.deviceSection}>
            {grouping.categories && grouping.rooms ? (
              // Both: categories as primary, rooms as sub-sections
              categoryEntries.map(({ categoryId: catId, devices: catDevices }) => (
                <CategorySection
                  key={catId ?? '__none__'}
                  category={catId ? categories.find((c) => c.id === catId) ?? null : null}
                  devices={catDevices}
                  rooms={rooms}
                  onDeviceClick={handleDeviceClick}
                  onDeviceLongPress={handleDeviceLongPress}
                />
              ))
            ) : grouping.categories ? (
              // Categories only
              categoryEntries.map(({ categoryId: catId, devices: catDevices }) => (
                <CategorySection
                  key={catId ?? '__none__'}
                  category={catId ? categories.find((c) => c.id === catId) ?? null : null}
                  devices={catDevices}
                  rooms={[]}
                  onDeviceClick={handleDeviceClick}
                  onDeviceLongPress={handleDeviceLongPress}
                />
              ))
            ) : grouping.rooms ? (
              // Rooms only
              roomEntries.map(({ roomId: rmId, devices: roomDevices }) => (
                <RoomSection
                  key={rmId ?? '__none__'}
                  room={rmId ? rooms.find((r) => r.id === rmId) ?? null : null}
                  devices={roomDevices}
                  categories={[]}
                  onDeviceClick={handleDeviceClick}
                  onDeviceLongPress={handleDeviceLongPress}
                />
              ))
            ) : (
              // No grouping - flat list
              <View style={styles.flatList}>
                {devices.map((device) => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    categoryColor={
                      categories.find((c) => c.id === device.category_id)?.color ?? '#6b7280'
                    }
                    onPress={() => handleDeviceClick(device)}
                    onLongPress={() => handleDeviceLongPress(device)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {canEdit && devices.length > 0 && (
        <FAB onPress={handleAddDevice} />
      )}

      {/* Device View Modal */}
      <DeviceViewModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        device={viewDevice}
        category={viewDevice ? categories.find((c) => c.id === viewDevice.category_id) : undefined}
        room={viewDevice ? rooms.find((r) => r.id === viewDevice.room_id) : undefined}
        canEdit={canEdit}
        onEdit={handleEditFromView}
      />

      {/* Device Add/Edit Dialog */}
      {canEdit && (
        <DeviceDialog
          visible={editDialogVisible}
          onClose={() => setEditDialogVisible(false)}
          device={editDevice}
          network={network}
          categories={categories}
          rooms={rooms}
          existingDevices={devices}
          onSave={addDevice}
          onUpdate={updateDevice}
          onDelete={deleteDevice}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  groupingToggles: {
    flexDirection: 'row',
    gap: 6,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  groupToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterSection: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceSection: {
    marginTop: 12,
    gap: 8,
  },
  flatList: {
    gap: 4,
  },
})

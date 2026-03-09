import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getLocalizedName } from '@/lib/localized-name'
import type { Category, Room } from '@/types/database'

interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string | null
  onCategoryChange: (value: string | null) => void
  roomFilter: string | null
  onRoomChange: (value: string | null) => void
  categories: Category[]
  rooms: Room[]
}

export function SearchFilter({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  roomFilter,
  onRoomChange,
  categories,
  rooms,
}: SearchFilterProps) {
  const { isDark } = useTheme()
  const { t, language } = useLanguage()

  const categoryOptions = [
    { value: '__all__', label: t.dashboard.allCategories },
    ...categories.map((cat) => ({
      value: cat.id,
      label: getLocalizedName(cat, language),
    })),
    { value: '__none__', label: t.device.noCategory },
  ]

  const roomOptions = [
    { value: '__all__', label: t.dashboard.allRooms },
    ...rooms.map((room) => ({
      value: room.id,
      label: getLocalizedName(room, language),
    })),
    { value: '__none__', label: t.device.noRoom },
  ]

  return (
    <View style={styles.container}>
      <Input
        value={search}
        onChangeText={onSearchChange}
        placeholder={t.dashboard.search}
        iconLeft={
          <Ionicons
            name="search-outline"
            size={18}
            color={isDark ? '#64748b' : '#94a3b8'}
          />
        }
        containerStyle={styles.searchInput}
      />
      <View style={styles.filterRow}>
        <Select
          value={categoryFilter ?? '__all__'}
          options={categoryOptions}
          onChange={(val) => onCategoryChange(val === '__all__' ? null : val)}
          placeholder={t.dashboard.allCategories}
          style={styles.filterSelect}
        />
        <Select
          value={roomFilter ?? '__all__'}
          options={roomOptions}
          onChange={(val) => onRoomChange(val === '__all__' ? null : val)}
          placeholder={t.dashboard.allRooms}
          style={styles.filterSelect}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterSelect: {
    flex: 1,
    marginBottom: 0,
  },
})

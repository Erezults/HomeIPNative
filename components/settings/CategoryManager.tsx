import { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Pressable, Alert, ScrollView, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNetwork } from '@/hooks/useNetwork'
import { getLocalizedName } from '@/lib/localized-name'
import { compressImage } from '@/lib/image-utils'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/types/database'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#737373', '#71717a',
  '#64748b', '#6b7280', '#a3a3a3', '#9ca3af', '#94a3b8',
  '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#fb7185',
]

const ICON_OPTIONS = [
  { name: 'monitor', icon: 'desktop-outline' as const },
  { name: 'smartphone', icon: 'phone-portrait-outline' as const },
  { name: 'tablet', icon: 'tablet-portrait-outline' as const },
  { name: 'laptop', icon: 'laptop-outline' as const },
  { name: 'tv', icon: 'tv-outline' as const },
  { name: 'wifi', icon: 'wifi-outline' as const },
  { name: 'server', icon: 'server-outline' as const },
  { name: 'printer', icon: 'print-outline' as const },
  { name: 'camera', icon: 'camera-outline' as const },
  { name: 'speaker', icon: 'volume-high-outline' as const },
  { name: 'lightbulb', icon: 'bulb-outline' as const },
  { name: 'thermometer', icon: 'thermometer-outline' as const },
  { name: 'lock', icon: 'lock-closed-outline' as const },
  { name: 'home', icon: 'home-outline' as const },
  { name: 'building', icon: 'business-outline' as const },
  { name: 'door', icon: 'enter-outline' as const },
  { name: 'bed', icon: 'bed-outline' as const },
  { name: 'bath', icon: 'water-outline' as const },
  { name: 'utensils', icon: 'restaurant-outline' as const },
  { name: 'sofa', icon: 'cafe-outline' as const },
  { name: 'car', icon: 'car-outline' as const },
  { name: 'tree', icon: 'leaf-outline' as const },
  { name: 'gamepad', icon: 'game-controller-outline' as const },
  { name: 'music', icon: 'musical-notes-outline' as const },
  { name: 'film', icon: 'film-outline' as const },
]

function getIconName(name: string): string {
  return ICON_OPTIONS.find((i) => i.name === name)?.icon ?? 'desktop-outline'
}

async function uploadCategoryImage(categoryId: string, imageUri: string): Promise<string | null> {
  try {
    const compressed = await compressImage(imageUri)
    const path = `${categoryId}.webp`

    const formData = new FormData()
    formData.append('', {
      uri: compressed.uri,
      name: path,
      type: compressed.type,
    } as unknown as Blob)

    await supabase.storage.from('category-images').remove([path])

    const { error } = await supabase.storage
      .from('category-images')
      .upload(path, formData, { contentType: 'image/webp', upsert: true })

    if (error) {
      console.error('Category image upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('category-images')
      .getPublicUrl(path)

    return `${urlData.publicUrl}?t=${Date.now()}`
  } catch (err) {
    console.error('Category image upload error:', err)
    return null
  }
}

export function CategoryManager() {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const { network, categories, refetch } = useNetwork()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', name_en: '', color: PRESET_COLORS[0], icon: 'monitor', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageChanged, setImageChanged] = useState(false)
  const [imageRemoved, setImageRemoved] = useState(false)

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    cardBg: isDark ? '#16213e' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#1a1a2e' : '#f8fafc',
  }

  const openAdd = () => {
    setEditingCategory(null)
    setForm({ name: '', name_en: '', color: PRESET_COLORS[0], icon: 'monitor', sort_order: 0 })
    setImageUri(null)
    setImageChanged(false)
    setImageRemoved(false)
    setModalVisible(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      name_en: cat.name_en,
      color: cat.color,
      icon: cat.icon,
      sort_order: cat.sort_order,
    })
    setImageUri(cat.image_url || null)
    setImageChanged(false)
    setImageRemoved(false)
    setModalVisible(true)
  }

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    }

    let result: ImagePicker.ImagePickerResult
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) return
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
      setImageChanged(true)
      setImageRemoved(false)
    }
  }

  const showImageOptions = () => {
    const buttons: Array<{ text: string; onPress: () => void; style?: 'cancel' | 'destructive' | 'default' }> = [
      { text: '\uD83D\uDCF7 Camera', onPress: () => handlePickImage('camera') },
      { text: t.device.fromGallery, onPress: () => handlePickImage('gallery') },
    ]

    if (imageUri) {
      buttons.push({ text: t.device.removeImage, onPress: () => { setImageUri(null); setImageChanged(true); setImageRemoved(true) }, style: 'destructive' })
    }

    buttons.push({ text: t.device.cancel, onPress: () => {}, style: 'cancel' })

    Alert.alert(t.settings.categoryImage, undefined, buttons)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !network) return
    setSaving(true)

    if (editingCategory) {
      let imageUrl = editingCategory.image_url
      if (imageChanged && imageUri && !imageRemoved) {
        const url = await uploadCategoryImage(editingCategory.id, imageUri)
        if (url) imageUrl = url
      } else if (imageRemoved) {
        await supabase.storage.from('category-images').remove([`${editingCategory.id}.webp`])
        imageUrl = ''
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: form.name,
          name_en: form.name_en,
          color: form.color,
          icon: form.icon,
          sort_order: form.sort_order,
          image_url: imageUrl,
        })
        .eq('id', editingCategory.id)

      if (error) {
        Alert.alert(t.common.error, error.message)
      } else {
        setModalVisible(false)
        await refetch()
      }
    } else {
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order))
        : 0

      const { data: inserted, error } = await supabase
        .from('categories')
        .insert({
          network_id: network.id,
          name: form.name,
          name_en: form.name_en,
          color: form.color,
          icon: form.icon,
          sort_order: form.sort_order || maxOrder + 1,
        })
        .select('id')
        .single()

      if (error) {
        Alert.alert(t.common.error, error.message)
      } else {
        if (imageChanged && imageUri && inserted) {
          const url = await uploadCategoryImage(inserted.id, imageUri)
          if (url) {
            await supabase.from('categories').update({ image_url: url }).eq('id', inserted.id)
          }
        }
        setModalVisible(false)
        await refetch()
      }
    }
    setSaving(false)
  }

  const handleDelete = (cat: Category) => {
    Alert.alert(
      t.settings.deleteConfirm,
      getLocalizedName(cat, language),
      [
        { text: t.device.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            await supabase.storage.from('category-images').remove([`${cat.id}.webp`])
            const { error } = await supabase.from('categories').delete().eq('id', cat.id)
            if (error) {
              Alert.alert(t.common.error, error.message)
            } else {
              await refetch()
            }
          },
        },
      ]
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Add button */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t.settings.categories}
        </Text>
        <Button size="sm" onPress={openAdd}>
          {t.settings.addCategory}
        </Button>
      </View>

      {/* List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {categories.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>{t.settings.addCategory}</Text>
        ) : (
          categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.item, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => openEdit(cat)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                {cat.image_url ? (
                  <Image source={{ uri: cat.image_url }} style={styles.itemImage} />
                ) : (
                  <Ionicons
                    name={getIconName(cat.icon) as any}
                    size={20}
                    color={colors.muted}
                  />
                )}
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {getLocalizedName(cat, language)}
                </Text>
              </View>
              <View style={[styles.itemActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  onPress={() => handleDelete(cat)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
                <Ionicons
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={18}
                  color={colors.muted}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingCategory ? t.settings.editCategory : t.settings.addCategory}
      >
        {/* Image */}
        <View style={styles.imageSection}>
          <Pressable
            onPress={showImageOptions}
            style={[
              styles.imageButton,
              {
                backgroundColor: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.1)',
                borderColor: isDark ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.2)',
              },
            ]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color={colors.muted} />
                <Text style={[styles.imagePlaceholderText, { color: colors.muted }]}>
                  {t.settings.tapToAddCategoryImage}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Name Hebrew */}
        <Input
          label={t.settings.categoryNameHe}
          value={form.name}
          onChangeText={(val) => setForm((prev) => ({ ...prev, name: val }))}
          autoFocus
        />

        {/* Name English */}
        <Input
          label={t.settings.categoryNameEn}
          value={form.name_en}
          onChangeText={(val) => setForm((prev) => ({ ...prev, name_en: val }))}
          style={{ textAlign: 'left', writingDirection: 'ltr' }}
        />

        {/* Sort Order */}
        <Input
          label="Sort Order"
          value={String(form.sort_order)}
          onChangeText={(val) => setForm((prev) => ({ ...prev, sort_order: parseInt(val, 10) || 0 }))}
          keyboardType="numeric"
          style={{ textAlign: 'left', writingDirection: 'ltr' }}
        />

        {/* Color picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.color}
          </Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  form.color === color && styles.colorSwatchSelected,
                ]}
                onPress={() => setForm((prev) => ({ ...prev, color }))}
              />
            ))}
          </View>
        </View>

        {/* Icon selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.icon}
          </Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map(({ name, icon }) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.iconOption,
                  {
                    borderColor: form.icon === name ? '#3b82f6' : colors.border,
                    backgroundColor: form.icon === name
                      ? isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)'
                      : 'transparent',
                  },
                ]}
                onPress={() => setForm((prev) => ({ ...prev, icon: name }))}
              >
                <Ionicons
                  name={icon as any}
                  size={20}
                  color={form.icon === name ? '#3b82f6' : colors.muted}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {editingCategory && (
            <Button variant="destructive" onPress={() => { setModalVisible(false); handleDelete(editingCategory) }}>
              {t.device.delete}
            </Button>
          )}
          <View style={{ flex: 1 }} />
          <Button variant="outline" onPress={() => setModalVisible(false)}>
            {t.device.cancel}
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            disabled={!form.name.trim() || saving}
            loading={saving}
          >
            {t.device.save}
          </Button>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 2,
  },
  imagePlaceholderText: {
    fontSize: 9,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    alignItems: 'center',
  },
})

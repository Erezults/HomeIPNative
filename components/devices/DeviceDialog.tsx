import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getLocalizedName } from '@/lib/localized-name'
import { isValidIP, isIPInSubnet, getNextAvailableIP } from '@/lib/ip-utils'
import { compressImage } from '@/lib/image-utils'
import { supabase } from '@/lib/supabase'
import type { Device, Category, Room, Network } from '@/types/database'

interface DeviceDialogProps {
  visible: boolean
  onClose: () => void
  device: Device | null // null = add mode
  network: Network | null
  categories: Category[]
  rooms: Room[]
  existingDevices: Device[]
  onSave: (data: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null; id?: string }>
  onUpdate: (id: string, data: Partial<Device>) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
}

export function DeviceDialog({
  visible,
  onClose,
  device,
  network,
  categories,
  rooms,
  existingDevices,
  onSave,
  onUpdate,
  onDelete,
}: DeviceDialogProps) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const isEditing = !!device

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [macAddress, setMacAddress] = useState('')
  const [categoryId, setCategoryId] = useState<string>('__none__')
  const [roomId, setRoomId] = useState<string>('__none__')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageChanged, setImageChanged] = useState(false)
  const [imageRemoved, setImageRemoved] = useState(false)

  // Reset form when dialog opens or device changes
  useEffect(() => {
    if (visible) {
      if (device) {
        setName(device.name)
        setDescription(device.description ?? '')
        setIpAddress(device.ip_address)
        setMacAddress(device.mac_address ?? '')
        setCategoryId(device.category_id ?? '__none__')
        setRoomId(device.room_id ?? '__none__')
        setIsActive(device.is_active)
        setNotes(device.notes ?? '')
        setModel(device.model ?? '')
        setSerialNumber(device.serial_number ?? '')
        setImageUri(device.image_url || null)
      } else {
        setName('')
        setDescription('')
        setIpAddress('')
        setMacAddress('')
        setCategoryId('__none__')
        setRoomId('__none__')
        setIsActive(true)
        setNotes('')
        setModel('')
        setSerialNumber('')
        setImageUri(null)
      }
      setImageChanged(false)
      setImageRemoved(false)
    }
  }, [visible, device])

  // IP validation
  const ipError = useMemo(() => {
    if (!ipAddress) return null
    if (!isValidIP(ipAddress)) return t.device.ipInvalid
    if (network?.subnet && !isIPInSubnet(ipAddress, network.subnet)) return t.device.ipOutOfRange
    const taken = existingDevices.some(
      (d) => d.ip_address === ipAddress && d.id !== device?.id
    )
    if (taken) return t.device.ipTaken
    return null
  }, [ipAddress, network, existingDevices, device, t])

  const handleSuggestIP = () => {
    if (!network?.subnet) return

    if (ipAddress.trim()) {
      Alert.alert(
        t.device.suggestIP,
        t.device.confirmNewIP,
        [
          { text: t.device.cancel, style: 'cancel' },
          { text: t.common.confirm, onPress: doSuggestIP },
        ]
      )
    } else {
      doSuggestIP()
    }
  }

  const doSuggestIP = () => {
    if (!network?.subnet) return
    const usedIPs = existingDevices
      .filter((d) => d.id !== device?.id)
      .map((d) => d.ip_address)
    const startFrom = network.dhcp_range_start || network.gateway || network.subnet.split('/')[0]
    const suggested = getNextAvailableIP(usedIPs, network.subnet, startFrom)
    if (suggested) {
      setIpAddress(suggested)
    }
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

  const handleRemoveImage = () => {
    setImageUri(null)
    setImageChanged(true)
    setImageRemoved(true)
  }

  const showImageOptions = () => {
    const buttons: Array<{ text: string; onPress: () => void }> = [
      { text: t.device.fromGallery, onPress: () => { handlePickImage('gallery') } },
    ]

    // Camera option
    buttons.unshift({
      text: '\uD83D\uDCF7 Camera',
      onPress: () => { handlePickImage('camera') },
    })

    if (imageUri) {
      buttons.push({
        text: t.device.removeImage,
        onPress: handleRemoveImage,
      })
    }

    buttons.push({ text: t.device.cancel, onPress: () => {} })

    Alert.alert(
      t.device.uploadImage,
      undefined,
      buttons.map((b, i) => ({
        ...b,
        style: b.text === t.device.removeImage
          ? 'destructive' as const
          : b.text === t.device.cancel
            ? 'cancel' as const
            : 'default' as const,
      }))
    )
  }

  const uploadImage = async (deviceId: string): Promise<string | null> => {
    if (!imageUri || !imageChanged) return null
    try {
      const compressed = await compressImage(imageUri)
      const ext = 'webp'
      const path = `${deviceId}.${ext}`

      // Read file into form data
      const formData = new FormData()
      formData.append('', {
        uri: compressed.uri,
        name: path,
        type: compressed.type,
      } as unknown as Blob)

      // Remove old image
      await supabase.storage.from('device-images').remove([path])

      const { error } = await supabase.storage
        .from('device-images')
        .upload(path, formData, { contentType: 'image/webp', upsert: true })

      if (error) {
        console.error('Image upload error:', error)
        return null
      }

      const { data: urlData } = supabase.storage
        .from('device-images')
        .getPublicUrl(path)

      return `${urlData.publicUrl}?t=${Date.now()}`
    } catch (err) {
      console.error('Image upload error:', err)
      return null
    }
  }

  const canSave = name.trim() && ipAddress.trim() && !ipError && !saving

  const handleSave = async () => {
    if (!canSave || !network) return
    setSaving(true)

    const data: Record<string, unknown> = {
      network_id: network.id,
      name: name.trim(),
      description: description.trim(),
      ip_address: ipAddress.trim(),
      mac_address: macAddress.trim(),
      category_id: categoryId === '__none__' ? null : categoryId,
      room_id: roomId === '__none__' ? null : roomId,
      is_active: isActive,
      notes: notes.trim(),
      model: model.trim(),
      serial_number: serialNumber.trim(),
    }

    let result: { error: string | null; id?: string }

    if (isEditing && device) {
      if (imageChanged && imageUri && !imageRemoved) {
        const url = await uploadImage(device.id)
        if (url) data.image_url = url
      } else if (imageRemoved) {
        await supabase.storage.from('device-images').remove([`${device.id}.webp`])
        data.image_url = ''
      }
      result = await onUpdate(device.id, data)
    } else {
      result = await onSave(data as Omit<Device, 'id' | 'created_at' | 'updated_at'>)
      if (!result.error && result.id && imageChanged && imageUri) {
        const url = await uploadImage(result.id)
        if (url) {
          await onUpdate(result.id, { image_url: url })
        }
      }
    }

    setSaving(false)
    if (!result.error) {
      onClose()
    } else {
      Alert.alert(t.common.error, result.error)
    }
  }

  const handleDelete = () => {
    if (!device) return
    Alert.alert(
      t.device.delete,
      t.device.confirmDelete,
      [
        { text: t.device.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            setSaving(true)
            const result = await onDelete(device.id)
            setSaving(false)
            if (!result.error) {
              onClose()
            } else {
              Alert.alert(t.common.error, result.error)
            }
          },
        },
      ]
    )
  }

  const categoryOptions = [
    { value: '__none__', label: t.device.noCategory },
    ...categories.map((cat) => ({
      value: cat.id,
      label: getLocalizedName(cat, language),
    })),
  ]

  const roomOptions = [
    { value: '__none__', label: t.device.noRoom },
    ...rooms.map((rm) => ({
      value: rm.id,
      label: getLocalizedName(rm, language),
    })),
  ]

  const colors = {
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    imageBg: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.1)',
    imageBorder: isDark ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.2)',
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEditing ? t.device.edit : t.device.add}
    >
      {/* Image */}
      <View style={styles.imageSection}>
        <Pressable
          onPress={showImageOptions}
          style={[
            styles.imageButton,
            {
              backgroundColor: colors.imageBg,
              borderColor: colors.imageBorder,
            },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="desktop-outline" size={32} color={colors.muted} />
              <Text style={[styles.imagePlaceholderText, { color: colors.muted }]}>
                {t.device.tapToAddImage}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Name */}
      <Input
        label={t.device.name}
        value={name}
        onChangeText={setName}
        placeholder={t.device.name}
      />

      {/* Description */}
      <Input
        label={t.device.description}
        value={description}
        onChangeText={setDescription}
        placeholder={t.device.description}
      />

      {/* IP Address */}
      <View style={styles.ipRow}>
        <View style={styles.ipInput}>
          <Input
            label={t.device.ipAddress}
            value={ipAddress}
            onChangeText={setIpAddress}
            placeholder="192.168.1.100"
            keyboardType="numeric"
            error={ipError ?? undefined}
            style={{ textAlign: 'left', writingDirection: 'ltr' }}
          />
        </View>
        <Pressable
          onPress={handleSuggestIP}
          style={[
            styles.suggestButton,
            {
              backgroundColor: isDark ? '#334155' : '#e2e8f0',
              borderColor: isDark ? '#475569' : '#cbd5e1',
            },
          ]}
        >
          <Ionicons name="sparkles" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
        </Pressable>
      </View>

      {/* MAC Address */}
      <Input
        label={t.device.macAddress}
        value={macAddress}
        onChangeText={setMacAddress}
        placeholder="AA:BB:CC:DD:EE:FF"
        style={{ textAlign: 'left', writingDirection: 'ltr' }}
      />

      {/* Category */}
      <Select
        label={t.device.category}
        value={categoryId}
        options={categoryOptions}
        onChange={setCategoryId}
        placeholder={t.device.noCategory}
      />

      {/* Room */}
      <Select
        label={t.device.room}
        value={roomId}
        options={roomOptions}
        onChange={setRoomId}
        placeholder={t.device.noRoom}
      />

      {/* Model */}
      <Input
        label={t.device.model}
        value={model}
        onChangeText={setModel}
        placeholder={t.device.model}
      />

      {/* Serial Number */}
      <Input
        label={t.device.serialNumber}
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder={t.device.serialNumber}
        style={{ textAlign: 'left', writingDirection: 'ltr' }}
      />

      {/* Active toggle */}
      <Toggle
        label={t.device.active}
        value={isActive}
        onChange={setIsActive}
      />

      {/* Notes */}
      <Input
        label={t.device.notes}
        value={notes}
        onChangeText={setNotes}
        placeholder={t.device.notes}
        multiline
        numberOfLines={3}
        style={{ minHeight: 60, textAlignVertical: 'top' }}
      />

      {/* Actions */}
      <View style={styles.actions}>
        {isEditing && (
          <Button
            variant="destructive"
            onPress={handleDelete}
            disabled={saving}
          >
            {t.device.delete}
          </Button>
        )}

        <View style={{ flex: 1 }} />

        <Button variant="outline" onPress={onClose}>
          {t.device.cancel}
        </Button>

        <Button
          variant="primary"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
        >
          {t.device.save}
        </Button>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButton: {
    width: 96,
    height: 96,
    borderRadius: 16,
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
    gap: 4,
  },
  imagePlaceholderText: {
    fontSize: 10,
  },
  ipRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  ipInput: {
    flex: 1,
  },
  suggestButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    alignItems: 'center',
  },
})

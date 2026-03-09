import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, StyleSheet } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNetwork } from '@/hooks/useNetwork'
import { getLocalizedName } from '@/lib/localized-name'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import type { ViewerCode } from '@/types/database'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function ViewerManager() {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()
  const { network, categories, rooms } = useNetwork()
  const [viewers, setViewers] = useState<ViewerCode[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  const [form, setForm] = useState({
    code: generateCode(),
    label: '',
    can_edit: false,
    allowed_categories: [] as string[],
    allowed_rooms: [] as string[],
  })
  const [saving, setSaving] = useState(false)

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    cardBg: isDark ? '#16213e' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#1e293b' : '#e2e8f0',
    codeBg: isDark ? '#1a1a2e' : '#f1f5f9',
  }

  const fetchViewers = useCallback(async () => {
    if (!network) return
    setLoading(true)
    const { data, error } = await supabase
      .from('viewer_codes')
      .select('*')
      .eq('network_id', network.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setViewers(data as ViewerCode[])
    }
    setLoading(false)
  }, [network])

  useEffect(() => {
    fetchViewers()
  }, [fetchViewers])

  const openCreate = () => {
    setForm({
      code: generateCode(),
      label: '',
      can_edit: false,
      allowed_categories: [],
      allowed_rooms: [],
    })
    setModalVisible(true)
  }

  const handleCreate = async () => {
    if (!form.label.trim() || !network) return
    setSaving(true)

    const { error } = await supabase.from('viewer_codes').insert({
      network_id: network.id,
      code: form.code,
      label: form.label,
      is_active: true,
      is_frozen: false,
      can_edit: form.can_edit,
      allowed_categories: form.allowed_categories,
      allowed_rooms: form.allowed_rooms,
    })

    setSaving(false)
    if (error) {
      Alert.alert(t.common.error, error.message)
    } else {
      setModalVisible(false)
      await fetchViewers()
    }
  }

  const handleFreeze = async (viewer: ViewerCode) => {
    const { error } = await supabase
      .from('viewer_codes')
      .update({ is_frozen: !viewer.is_frozen })
      .eq('id', viewer.id)

    if (error) {
      Alert.alert(t.common.error, error.message)
    } else {
      await fetchViewers()
    }
  }

  const handleDelete = (viewer: ViewerCode) => {
    Alert.alert(
      t.settings.deleteConfirm,
      viewer.label,
      [
        { text: t.device.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('viewer_codes').delete().eq('id', viewer.id)
            if (error) {
              Alert.alert(t.common.error, error.message)
            } else {
              await fetchViewers()
            }
          },
        },
      ]
    )
  }

  const handleEditLabel = (viewer: ViewerCode) => {
    Alert.prompt(
      t.viewers.label,
      undefined,
      [
        { text: t.device.cancel, style: 'cancel' },
        {
          text: t.device.save,
          onPress: async (newLabel?: string) => {
            if (!newLabel?.trim()) return
            const { error } = await supabase
              .from('viewer_codes')
              .update({ label: newLabel.trim() })
              .eq('id', viewer.id)
            if (!error) await fetchViewers()
          },
        },
      ],
      'plain-text',
      viewer.label
    )
  }

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code)
    Alert.alert(t.viewers.copied)
  }

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      allowed_categories: prev.allowed_categories.includes(id)
        ? prev.allowed_categories.filter((c) => c !== id)
        : [...prev.allowed_categories, id],
    }))
  }

  const toggleRoom = (id: string) => {
    setForm((prev) => ({
      ...prev,
      allowed_rooms: prev.allowed_rooms.includes(id)
        ? prev.allowed_rooms.filter((r) => r !== id)
        : [...prev.allowed_rooms, id],
    }))
  }

  const selectAllCategories = () => {
    setForm((prev) => ({
      ...prev,
      allowed_categories: prev.allowed_categories.length === categories.length
        ? []
        : categories.map((c) => c.id),
    }))
  }

  const selectAllRooms = () => {
    setForm((prev) => ({
      ...prev,
      allowed_rooms: prev.allowed_rooms.length === rooms.length
        ? []
        : rooms.map((r) => r.id),
    }))
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return t.viewers.never
    return new Date(dateStr).toLocaleDateString()
  }

  const getPermissionsSummary = (viewer: ViewerCode): string => {
    const catCount = viewer.allowed_categories.length
    const roomCount = viewer.allowed_rooms.length
    const catText = catCount === 0 ? t.viewers.allCategories : `${catCount} ${t.settings.categories}`
    const roomText = roomCount === 0 ? t.viewers.allRooms : `${roomCount} ${t.settings.rooms}`
    return `${catText}, ${roomText}`
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t.viewers.title}
        </Text>
        <Button size="sm" onPress={openCreate}>
          {t.viewers.create}
        </Button>
      </View>

      {/* List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>{t.common.loading}</Text>
        ) : viewers.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>{t.viewers.noViewers}</Text>
        ) : (
          viewers.map((viewer) => (
            <View
              key={viewer.id}
              style={[styles.viewerCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            >
              {/* Top row: code + label + status */}
              <View style={[styles.viewerTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.viewerInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity
                    onPress={() => copyCode(viewer.code)}
                    style={[styles.codeBox, { backgroundColor: colors.codeBg }]}
                  >
                    <Text style={[styles.codeText, { color: colors.text }]}>{viewer.code}</Text>
                    <Ionicons name="copy-outline" size={14} color={colors.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditLabel(viewer)}
                    style={styles.labelRow}
                  >
                    <Text style={[styles.labelText, { color: colors.text }]}>{viewer.label}</Text>
                    <Ionicons name="pencil-outline" size={14} color={colors.muted} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.badges, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {viewer.can_edit && (
                    <Badge variant="outline">{t.viewers.canEdit}</Badge>
                  )}
                  {viewer.is_frozen ? (
                    <Badge variant="warning">{t.viewers.frozen}</Badge>
                  ) : viewer.is_active ? (
                    <Badge variant="success">{t.viewers.active}</Badge>
                  ) : (
                    <Badge variant="outline">{t.viewers.inactive}</Badge>
                  )}
                </View>
              </View>

              {/* Permissions + last used */}
              <View style={[styles.viewerMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
                  {t.viewers.permissions}: {getPermissionsSummary(viewer)}
                </Text>
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {t.viewers.lastUsed}: {formatDate(viewer.last_used_at)}
                </Text>
              </View>

              {/* Actions */}
              <View style={[styles.viewerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.border }]}
                  onPress={() => handleFreeze(viewer)}
                >
                  <Ionicons
                    name={viewer.is_frozen ? 'play-outline' : 'snow-outline'}
                    size={16}
                    color={colors.text}
                  />
                  <Text style={[styles.actionText, { color: colors.text }]}>
                    {viewer.is_frozen ? t.viewers.unfreeze : t.viewers.freeze}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.border }]}
                  onPress={() => handleDelete(viewer)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>
                    {t.viewers.delete}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Code Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t.viewers.newCode}
      >
        {/* Code display */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.viewers.code}
          </Text>
          <View style={styles.codeDisplay}>
            <View style={[styles.codeDisplayBox, { backgroundColor: colors.codeBg }]}>
              <Text style={[styles.codeDisplayText, { color: colors.text }]}>{form.code}</Text>
            </View>
            <TouchableOpacity
              style={[styles.regenerateButton, { borderColor: colors.border }]}
              onPress={() => setForm((prev) => ({ ...prev, code: generateCode() }))}
            >
              <Ionicons name="refresh-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Label */}
        <Input
          label={t.viewers.codeLabel}
          value={form.label}
          onChangeText={(val) => setForm((prev) => ({ ...prev, label: val }))}
          autoFocus
        />

        {/* Can Edit toggle */}
        <View style={styles.section}>
          <Toggle
            label={t.viewers.canEdit}
            value={form.can_edit}
            onChange={(val) => setForm((prev) => ({ ...prev, can_edit: val }))}
          />
          <Text style={[styles.hintText, { color: colors.muted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.viewers.canEditDesc}
          </Text>
        </View>

        {/* Allowed Categories */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t.viewers.allowedCategories}</Text>
            <TouchableOpacity onPress={selectAllCategories}>
              <Text style={[styles.selectAllText, { color: '#3b82f6' }]}>
                {form.allowed_categories.length === categories.length
                  ? t.viewers.deselectAll
                  : t.viewers.selectAll}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hintText, { color: colors.muted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.viewers.allCategories}
          </Text>
          <View style={styles.checkboxList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.checkboxRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Ionicons
                  name={form.allowed_categories.includes(cat.id) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={form.allowed_categories.includes(cat.id) ? '#3b82f6' : colors.muted}
                />
                <View style={[styles.checkboxDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  {getLocalizedName(cat, language)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allowed Rooms */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t.viewers.allowedRooms}</Text>
            <TouchableOpacity onPress={selectAllRooms}>
              <Text style={[styles.selectAllText, { color: '#3b82f6' }]}>
                {form.allowed_rooms.length === rooms.length
                  ? t.viewers.deselectAll
                  : t.viewers.selectAll}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hintText, { color: colors.muted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.viewers.allRooms}
          </Text>
          <View style={styles.checkboxList}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[styles.checkboxRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => toggleRoom(room.id)}
              >
                <Ionicons
                  name={form.allowed_rooms.includes(room.id) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={form.allowed_rooms.includes(room.id) ? '#3b82f6' : colors.muted}
                />
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  {getLocalizedName(room, language)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={{ flex: 1 }} />
          <Button variant="outline" onPress={() => setModalVisible(false)}>
            {t.device.cancel}
          </Button>
          <Button
            variant="primary"
            onPress={handleCreate}
            disabled={!form.label.trim() || saving}
            loading={saving}
          >
            {t.viewers.create}
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
  viewerCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  viewerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  viewerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
  },
  viewerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 11,
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeDisplayBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  codeDisplayText: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 4,
  },
  regenerateButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxList: {
    gap: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    alignItems: 'center',
  },
})

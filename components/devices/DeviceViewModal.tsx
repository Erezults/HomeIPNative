import { View, Text, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getLocalizedName } from '@/lib/localized-name'
import type { Device, Category, Room } from '@/types/database'

interface DeviceViewModalProps {
  visible: boolean
  onClose: () => void
  device: Device | null
  category?: Category
  room?: Room
  canEdit: boolean
  onEdit: () => void
}

export function DeviceViewModal({
  visible,
  onClose,
  device,
  category,
  room,
  canEdit,
  onEdit,
}: DeviceViewModalProps) {
  const { isDark } = useTheme()
  const { t, language, isRTL } = useLanguage()

  if (!device) return null

  const categoryColor = category?.color ?? '#6b7280'
  const roomColor = room?.color ?? '#6b7280'

  const colors = {
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    imageBg: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.1)',
    divider: isDark ? '#1e293b' : '#e2e8f0',
  }

  return (
    <Modal visible={visible} onClose={onClose} title={device.name}>
      {/* Product image */}
      <View style={styles.imageContainer}>
        {device.image_url ? (
          <Image
            source={{ uri: device.image_url }}
            style={[styles.image, { backgroundColor: colors.imageBg }]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.imageBg }]}>
            <Ionicons name="desktop-outline" size={48} color={colors.muted} />
          </View>
        )}
      </View>

      {/* Status badge */}
      <View style={styles.statusRow}>
        <Badge variant={device.is_active ? 'success' : 'default'}>
          <View style={styles.statusContent}>
            <Ionicons
              name={device.is_active ? 'wifi' : 'wifi-outline'}
              size={14}
              color={device.is_active ? (isDark ? '#86efac' : '#166534') : (isDark ? '#e2e8f0' : '#1e293b')}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: device.is_active ? (isDark ? '#86efac' : '#166534') : (isDark ? '#e2e8f0' : '#1e293b'),
                marginLeft: 4,
              }}
            >
              {device.is_active ? t.device.active : t.device.inactive}
            </Text>
          </View>
        </Badge>
      </View>

      {/* Info rows */}
      <View style={styles.infoSection}>
        <InfoRow
          label={t.device.ipAddress}
          value={device.ip_address}
          mono
          colors={colors}
          isRTL={isRTL}
        />

        {device.mac_address ? (
          <InfoRow
            label={t.device.macAddress}
            value={device.mac_address}
            mono
            colors={colors}
            isRTL={isRTL}
          />
        ) : null}

        {category ? (
          <InfoRow
            label={t.device.category}
            colors={colors}
            isRTL={isRTL}
            valueNode={
              <View style={styles.tagRow}>
                <View style={[styles.colorDot, { backgroundColor: categoryColor }]} />
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {getLocalizedName(category, language)}
                </Text>
              </View>
            }
          />
        ) : null}

        {room ? (
          <InfoRow
            label={t.device.room}
            colors={colors}
            isRTL={isRTL}
            valueNode={
              <View style={styles.tagRow}>
                <View style={[styles.colorDot, { backgroundColor: roomColor }]} />
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {getLocalizedName(room, language)}
                </Text>
              </View>
            }
          />
        ) : null}

        {device.model ? (
          <InfoRow label={t.device.model} value={device.model} colors={colors} isRTL={isRTL} />
        ) : null}

        {device.serial_number ? (
          <InfoRow
            label={t.device.serialNumber}
            value={device.serial_number}
            mono
            colors={colors}
            isRTL={isRTL}
          />
        ) : null}

        {device.description ? (
          <InfoRow label={t.device.description} value={device.description} colors={colors} isRTL={isRTL} />
        ) : null}

        {device.notes ? (
          <InfoRow label={t.device.notes} value={device.notes} colors={colors} isRTL={isRTL} />
        ) : null}
      </View>

      {/* Footer actions */}
      <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {canEdit ? (
          <Button variant="outline" onPress={onEdit}>
            {t.device.edit}
          </Button>
        ) : null}
        <View style={{ flex: 1 }} />
        <Button variant="ghost" onPress={onClose}>
          {t.common.close}
        </Button>
      </View>
    </Modal>
  )
}

function InfoRow({
  label,
  value,
  valueNode,
  mono,
  colors,
  isRTL,
}: {
  label: string
  value?: string
  valueNode?: React.ReactNode
  mono?: boolean
  colors: { text: string; muted: string }
  isRTL: boolean
}) {
  return (
    <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
      {valueNode ?? (
        <Text
          style={[
            styles.infoValue,
            {
              color: colors.text,
              fontFamily: mono ? 'monospace' : undefined,
              textAlign: isRTL ? 'left' : 'right',
            },
          ]}
        >
          {value}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 128,
    height: 128,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoSection: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    flexShrink: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    gap: 8,
    paddingTop: 8,
  },
})

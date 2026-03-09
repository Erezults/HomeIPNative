import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  APP_VERSION,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  changelog,
} from '@/config/version'
import type { ChangeCategory } from '@/config/version'

// Collect all categories used in the changelog for the legend
function getUsedCategories(): ChangeCategory[] {
  const used = new Set<ChangeCategory>()
  for (const entry of changelog) {
    for (const group of entry.changes) {
      used.add(group.category)
    }
  }
  return Array.from(used)
}

interface VersionModalProps {
  visible: boolean
  onClose: () => void
}

export function VersionModal({ visible, onClose }: VersionModalProps) {
  const insets = useSafeAreaInsets()
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const usedCategories = getUsedCategories()

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    cardBg: isDark ? '#222238' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
    border: isDark ? '#2a2a3e' : '#e5e7eb',
    headerBg: isDark ? '#111122' : '#f3f4f6',
    currentBadgeBg: isDark ? '#3b82f6' : '#2563eb',
    otherBadgeBg: isDark ? '#374151' : '#e5e7eb',
    otherBadgeText: isDark ? '#d1d5db' : '#4b5563',
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t.version.changelog}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color={colors.mutedText} />
          </TouchableOpacity>
        </View>

        {/* Category Legend */}
        <View style={[styles.legend, { borderBottomColor: colors.border }]}>
          {usedCategories.map((cat) => (
            <View key={cat} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: CATEGORY_COLORS[cat] },
                ]}
              />
              <Text style={[styles.legendLabel, { color: colors.mutedText }]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </View>
          ))}
        </View>

        {/* Changelog ScrollView */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {changelog.map((entry) => {
            const isCurrent = entry.version === APP_VERSION

            return (
              <View key={entry.version} style={styles.versionBlock}>
                {/* Version header */}
                <View style={styles.versionHeader}>
                  <View
                    style={[
                      styles.versionBadge,
                      {
                        backgroundColor: isCurrent
                          ? colors.currentBadgeBg
                          : colors.otherBadgeBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.versionBadgeText,
                        {
                          color: isCurrent ? '#ffffff' : colors.otherBadgeText,
                        },
                      ]}
                    >
                      v{entry.version}
                    </Text>
                  </View>
                  <Text style={[styles.versionDate, { color: colors.mutedText }]}>
                    {entry.date}
                  </Text>
                </View>

                {/* Change items */}
                <View style={styles.changesList}>
                  {entry.changes.flatMap((group) =>
                    group.items.map((item, ii) => (
                      <View
                        key={`${group.category}-${ii}`}
                        style={styles.changeItem}
                      >
                        <View
                          style={[
                            styles.categoryBadge,
                            {
                              borderColor: CATEGORY_COLORS[group.category],
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              { color: CATEGORY_COLORS[group.category] },
                            ]}
                          >
                            {CATEGORY_LABELS[group.category]}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.changeText,
                            { color: colors.mutedText },
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
    columnGap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  versionBlock: {
    gap: 8,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  versionBadgeText: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  versionDate: {
    fontSize: 12,
  },
  changesList: {
    gap: 6,
    paddingLeft: 4,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
    flexShrink: 0,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  changeText: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
})

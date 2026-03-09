import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}

const COLORS = {
  bgLight: '#f8fafc',
  bgDark: '#1a1a2e',
  headerLight: '#ffffff',
  headerDark: '#16213e',
  borderLight: '#e2e8f0',
  borderDark: '#1e293b',
  titleLight: '#1e293b',
  titleDark: '#e2e8f0',
  closeLight: '#64748b',
  closeDark: '#94a3b8',
  backdrop: 'rgba(0,0,0,0.5)',
}

export function Modal({ visible, onClose, title, children, contentStyle }: ModalProps) {
  const { isDark } = useTheme()
  const { isRTL } = useLanguage()
  const insets = useSafeAreaInsets()

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? COLORS.bgDark : COLORS.bgLight,
                paddingBottom: insets.bottom || 16,
              },
            ]}
            onPress={() => {}} // Prevent backdrop dismiss when tapping content
          >
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: isDark ? '#475569' : '#cbd5e1' },
                ]}
              />
            </View>

            {/* Header */}
            {title ? (
              <View
                style={[
                  styles.header,
                  {
                    borderBottomColor: isDark ? COLORS.borderDark : COLORS.borderLight,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? COLORS.titleDark : COLORS.titleLight },
                  ]}
                >
                  {title}
                </Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Text
                    style={[
                      styles.closeText,
                      { color: isDark ? COLORS.closeDark : COLORS.closeLight },
                    ]}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Content */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 200,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    padding: 16,
  },
})

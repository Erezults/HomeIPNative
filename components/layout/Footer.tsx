import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

export function Footer() {
  const [modalVisible, setModalVisible] = useState(false)
  const { t } = useLanguage()
  const { isDark } = useTheme()

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? '#2a2a3e' : '#e5e7eb',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
  }

  const handleOpenWebsite = () => {
    Linking.openURL('https://erezults.com')
  }

  return (
    <>
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.footerContent}>
          <Text style={[styles.footerText, { color: colors.mutedText }]}>
            {t.footer.developedBy}
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            style={styles.logoButton}
          >
            <Image
              source={require('@/assets/images/rezults_clear.png')}
              style={[styles.footerLogo, { opacity: 0.8 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Developer Info Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalCard}>
              {/* Background gradient effect via layered views */}
              <View style={styles.gradientBg} />

              {/* Content */}
              <View style={styles.modalContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require('@/assets/images/rezults_clear.png')}
                    style={styles.modalLogo}
                    resizeMode="contain"
                  />
                </View>

                {/* Separator */}
                <View style={styles.separator} />

                {/* Developer info */}
                <Text style={styles.developerName}>{t.footer.developer}</Text>
                <Text style={styles.companyName}>{t.footer.company}</Text>

                {/* Website link */}
                <TouchableOpacity
                  onPress={handleOpenWebsite}
                  style={styles.websiteButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.websiteText}>erezults.com</Text>
                  <Ionicons name="open-outline" size={12} color="rgba(196,181,253,0.8)" />
                </TouchableOpacity>

                {/* Close button */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
  logoButton: {
    padding: 2,
  },
  footerLogo: {
    width: 80,
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#140e24',
  },
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
    position: 'relative',
  },
  logoContainer: {
    marginBottom: 24,
  },
  modalLogo: {
    width: 160,
    height: 120,
  },
  separator: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(167,139,250,0.3)',
    marginBottom: 20,
  },
  developerName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  companyName: {
    color: 'rgba(167,139,250,0.5)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  websiteText: {
    color: 'rgba(196,181,253,0.8)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
})

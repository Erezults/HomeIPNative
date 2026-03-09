import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useVersionCheck } from '@/hooks/useVersionCheck'
import { APP_VERSION } from '@/config/version'

interface HeaderProps {
  onVersionPress?: () => void
}

export function Header({ onVersionPress }: HeaderProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, isViewer, signOut, logoutViewer } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { theme, toggleTheme, isDark } = useTheme()
  const { hasUpdate, latestVersion } = useVersionCheck()

  // Green pulse animation for update badge
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (hasUpdate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      animation.start()
      return () => animation.stop()
    }
  }, [hasUpdate, pulseAnim])

  const handleLogout = () => {
    if (isViewer) {
      logoutViewer()
    } else {
      signOut()
    }
  }

  const handleToggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he')
  }

  const colors = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? '#2a2a3e' : '#e5e7eb',
    text: isDark ? '#ffffff' : '#111827',
    mutedText: isDark ? '#9ca3af' : '#6b7280',
    iconColor: isDark ? '#d1d5db' : '#4b5563',
    badgeBg: isDark ? '#374151' : '#f3f4f6',
    badgeBorder: isDark ? '#4b5563' : '#d1d5db',
    updateBadgeBg: '#16a34a',
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        {/* Left side: Logo + Version */}
        <View style={styles.leftSection}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>HomeNetIP</Text>

          {/* Version Badge */}
          <TouchableOpacity
            onPress={onVersionPress}
            activeOpacity={0.7}
          >
            {hasUpdate ? (
              <Animated.View
                style={[
                  styles.versionBadge,
                  {
                    backgroundColor: colors.updateBadgeBg,
                    borderColor: colors.updateBadgeBg,
                    opacity: pulseAnim,
                  },
                ]}
              >
                <Text style={[styles.versionText, { color: '#ffffff' }]}>
                  v{latestVersion}
                </Text>
              </Animated.View>
            ) : (
              <View
                style={[
                  styles.versionBadge,
                  {
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.badgeBorder,
                  },
                ]}
              >
                <Text style={[styles.versionText, { color: colors.mutedText }]}>
                  v{APP_VERSION}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {isViewer && (
            <View
              style={[
                styles.viewerBadge,
                { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder },
              ]}
            >
              <Text style={[styles.viewerBadgeText, { color: colors.mutedText }]}>
                {t.viewers.title}
              </Text>
            </View>
          )}
        </View>

        {/* Right side: Actions */}
        <View style={styles.rightSection}>
          {/* Theme toggle - for viewers */}
          {isViewer && (
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.iconColor}
              />
            </TouchableOpacity>
          )}

          {/* Language toggle - for viewers */}
          {isViewer && (
            <TouchableOpacity
              onPress={handleToggleLanguage}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.flagEmoji}>
                {language === 'he' ? '\u{1F1FA}\u{1F1F8}' : '\u{1F1EE}\u{1F1F1}'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Settings - for owners */}
          {user && (
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.iconColor} />
            </TouchableOpacity>
          )}

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  viewerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  viewerBadgeText: {
    fontSize: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  flagEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
})

import { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Footer } from '@/components/layout/Footer'

type LoginMode = 'owner' | 'viewer'

export default function LoginScreen() {
  const { signIn, loginAsViewer } = useAuth()
  const { t, isRTL } = useLanguage()
  const { isDark } = useTheme()

  const [mode, setMode] = useState<LoginMode>('owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [viewerCode, setViewerCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const colors = {
    background: isDark ? '#0f0d23' : '#f0f4ff',
    cardBg: isDark ? 'rgba(26, 26, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    titleGradientStart: isDark ? '#60a5fa' : '#2563eb',
    subtitle: isDark ? '#9ca3af' : '#6b7280',
    text: isDark ? '#e2e8f0' : '#1e293b',
    separatorLine: isDark ? '#334155' : '#e2e8f0',
    separatorBg: isDark ? '#1a1a2e' : '#f0f4ff',
    separatorText: isDark ? '#9ca3af' : '#6b7280',
    errorBg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
    errorBorder: isDark ? '#991b1b' : '#fca5a5',
    errorText: isDark ? '#f87171' : '#dc2626',
    toggleText: isDark ? '#94a3b8' : '#64748b',
  }

  const handleOwnerLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setError(null)
    setLoading(true)
    try {
      const result = await signIn(email.trim(), password)
      if (result.error) {
        setError(t.login.invalidCredentials)
      }
    } catch {
      setError(t.login.invalidCredentials)
    }
    setLoading(false)
  }

  const handleViewerLogin = async () => {
    if (!viewerCode.trim()) return
    setError(null)
    setLoading(true)
    try {
      const result = await loginAsViewer(viewerCode.trim().toUpperCase())
      if (result.error) {
        setError(t.login.invalidCode)
      }
    } catch {
      setError(t.login.invalidCode)
    }
    setLoading(false)
  }

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode)
    setError(null)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Decorative background circles */}
          <View style={styles.bgCircleContainer} pointerEvents="none">
            <View
              style={[
                styles.bgCircle,
                styles.bgCircle1,
                { backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.12)' },
              ]}
            />
            <View
              style={[
                styles.bgCircle,
                styles.bgCircle2,
                { backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.1)' },
              ]}
            />
          </View>

          {/* Header: Logo + Title */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.titleGradientStart }]}>
              HomeNetIP
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>
              {t.app.subtitle}
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {/* Error message */}
            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: colors.errorBg,
                    borderColor: colors.errorBorder,
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.errorText }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {mode === 'owner' ? (
              /* Owner Login Form */
              <View>
                <Input
                  label={t.login.email}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  editable={!loading}
                />
                <Input
                  label={t.login.password}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  editable={!loading}
                  onSubmitEditing={handleOwnerLogin}
                />
                <Button
                  onPress={handleOwnerLogin}
                  loading={loading}
                  disabled={!email.trim() || !password.trim()}
                  size="lg"
                  style={styles.submitButton}
                >
                  {t.login.submit}
                </Button>

                {/* Separator */}
                <View style={styles.separatorRow}>
                  <View style={[styles.separatorLine, { backgroundColor: colors.separatorLine }]} />
                  <Text
                    style={[
                      styles.separatorText,
                      {
                        color: colors.separatorText,
                        backgroundColor: colors.cardBg,
                      },
                    ]}
                  >
                    {t.common.or}
                  </Text>
                  <View style={[styles.separatorLine, { backgroundColor: colors.separatorLine }]} />
                </View>

                {/* Switch to viewer mode */}
                <Button
                  variant="outline"
                  onPress={() => switchMode('viewer')}
                  style={styles.toggleButton}
                >
                  {t.login.viewerCode}
                </Button>
              </View>
            ) : (
              /* Viewer Login Form */
              <View>
                <Input
                  label={t.login.enterCode}
                  value={viewerCode}
                  onChangeText={(text) => setViewerCode(text.toUpperCase())}
                  placeholder="XXXXXX"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  returnKeyType="done"
                  editable={!loading}
                  onSubmitEditing={handleViewerLogin}
                  style={styles.codeInput}
                />
                <Button
                  onPress={handleViewerLogin}
                  loading={loading}
                  disabled={viewerCode.trim().length === 0}
                  size="lg"
                  style={styles.submitButton}
                >
                  {t.login.connect}
                </Button>

                {/* Switch to owner mode */}
                <Button
                  variant="ghost"
                  onPress={() => switchMode('owner')}
                  style={styles.toggleButton}
                >
                  {t.login.backToLogin}
                </Button>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <Footer />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  bgCircleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgCircle1: {
    width: 280,
    height: 280,
    top: '15%',
    left: -60,
  },
  bgCircle2: {
    width: 260,
    height: 260,
    bottom: '20%',
    right: -50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 4,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  separatorText: {
    paddingHorizontal: 12,
    fontSize: 13,
  },
  toggleButton: {
    marginTop: 0,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
})

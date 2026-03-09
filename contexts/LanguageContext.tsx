import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { translations } from '@/i18n'
import type { Language, TranslationKeys } from '@/i18n'

const LANGUAGE_KEY = 'language'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isReady, setIsReady] = useState(false)

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored && (stored === 'he' || stored === 'en')) {
        setLanguageState(stored as Language)
        const rtl = stored === 'he'
        if (I18nManager.isRTL !== rtl) {
          I18nManager.forceRTL(rtl)
        }
      }
      setIsReady(true)
    })
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    AsyncStorage.setItem(LANGUAGE_KEY, lang)
    const rtl = lang === 'he'
    if (I18nManager.isRTL !== rtl) {
      I18nManager.forceRTL(rtl)
      // Note: RTL change requires app restart on React Native
    }
  }, [])

  const t = translations[language]
  const isRTL = language === 'he'

  if (!isReady) return null

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

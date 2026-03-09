import { he } from './he'
import { en } from './en'

export const translations = { he, en } as const
export type Language = keyof typeof translations
export type TranslationKeys = typeof he

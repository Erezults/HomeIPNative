import type { Language } from '@/i18n'

export function getLocalizedName(
  item: { name: string; name_en: string } | null | undefined,
  language: Language
): string {
  if (!item) return ''
  if (language === 'en' && item.name_en) return item.name_en
  return item.name
}

import type { LocalizedText } from '~/types/content'

export function useLocalizedText() {
  const { locale } = useI18n()

  return (value: LocalizedText) => {
    return locale.value === 'en' ? value.en : value.zh
  }
}

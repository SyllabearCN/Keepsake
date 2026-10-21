import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<Theme>('light')
  const galleryAlbum = ref('all')
  const favorites = ref<string[]>([])

  function applyTheme(nextTheme: Theme) {
    theme.value = nextTheme
    if (import.meta.client) {
      document.documentElement.dataset.theme = nextTheme
      localStorage.setItem('keepsake-theme', nextTheme)
    }
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function syncTheme() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('keepsake-theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = saved ?? (prefersDark ? 'dark' : 'light')
    applyTheme(theme.value)

    try {
      const savedFavorites = JSON.parse(localStorage.getItem('keepsake-favorites') ?? '[]')
      favorites.value = Array.isArray(savedFavorites) ? savedFavorites : []
    }
    catch {
      favorites.value = []
    }
  }

  function toggleFavorite(photoId: string) {
    favorites.value = favorites.value.includes(photoId)
      ? favorites.value.filter(id => id !== photoId)
      : [...favorites.value, photoId]

    if (import.meta.client) {
      localStorage.setItem('keepsake-favorites', JSON.stringify(favorites.value))
    }
  }

  return {
    theme,
    galleryAlbum,
    favorites,
    syncTheme,
    toggleTheme,
    toggleFavorite,
  }
})

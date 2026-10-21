import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'
export type GalleryView = 'grid' | 'timeline'
export type ViewMode = 'grid' | 'timeline'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<Theme>('light')
  const galleryAlbum = ref('all')
  const galleryView = ref<GalleryView>('grid')
  const journeyView = ref<ViewMode>('grid')
  const storyView = ref<ViewMode>('grid')
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

    const savedGalleryView = localStorage.getItem('keepsake-gallery-view')
    galleryView.value = savedGalleryView === 'timeline' ? 'timeline' : 'grid'
    journeyView.value = localStorage.getItem('keepsake-journey-view') === 'timeline' ? 'timeline' : 'grid'
    storyView.value = localStorage.getItem('keepsake-story-view') === 'timeline' ? 'timeline' : 'grid'
  }

  function toggleFavorite(photoId: string) {
    favorites.value = favorites.value.includes(photoId)
      ? favorites.value.filter(id => id !== photoId)
      : [...favorites.value, photoId]

    if (import.meta.client) {
      localStorage.setItem('keepsake-favorites', JSON.stringify(favorites.value))
    }
  }

  function setGalleryView(view: GalleryView) {
    galleryView.value = view
    if (import.meta.client)
      localStorage.setItem('keepsake-gallery-view', view)
  }

  function setJourneyView(view: ViewMode) {
    journeyView.value = view
    if (import.meta.client)
      localStorage.setItem('keepsake-journey-view', view)
  }

  function setStoryView(view: ViewMode) {
    storyView.value = view
    if (import.meta.client)
      localStorage.setItem('keepsake-story-view', view)
  }

  return {
    theme,
    galleryAlbum,
    galleryView,
    journeyView,
    storyView,
    favorites,
    syncTheme,
    toggleTheme,
    setGalleryView,
    setJourneyView,
    setStoryView,
    toggleFavorite,
  }
})

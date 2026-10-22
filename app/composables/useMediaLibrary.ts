import type { MediaManifest } from '~/types/content'

const emptyManifest: MediaManifest = {
  generatedAt: '',
  source: 'snapshot',
  albums: [],
  gallery: [],
  banners: [],
  journeyCovers: [],
  storyCovers: [],
  aboutPhotos: [],
  journeys: [],
  stories: [],
}

export async function useMediaLibrary() {
  const { data, pending, error, refresh } = await useFetch<MediaManifest>('/api/media', {
    key: 'media-library',
    default: () => emptyManifest,
  })

  return {
    media: computed(() => data.value ?? emptyManifest),
    pending,
    error,
    refresh,
  }
}

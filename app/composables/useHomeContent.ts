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

export async function useHomeContent() {
  const { data, pending, error } = await useFetch<MediaManifest>('/api/home', {
    key: 'home-content',
    default: () => emptyManifest,
  })

  return {
    media: computed(() => data.value ?? emptyManifest),
    pending,
    error,
  }
}

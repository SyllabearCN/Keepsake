export interface LocalizedText {
  zh: string
  en: string
}

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  title: LocalizedText
  caption: LocalizedText
  date: string
  location: LocalizedText
  album: string
  width: number
  height: number
}

export interface Album {
  id: string
  label: LocalizedText
  description: LocalizedText
  date?: string
  photoCount?: number
}

export interface Journey {
  id: string
  bvid: string
  title: LocalizedText
  description: LocalizedText
  location: LocalizedText
  date: string
  duration: string
  featured?: boolean
}

export interface MediaAsset {
  src: string
  filename: string
  width: number
  height: number
}

export interface MediaManifest {
  generatedAt: string
  source: 'cloud' | 'snapshot'
  albums: Album[]
  gallery: GalleryPhoto[]
  banners: MediaAsset[]
  journeyCovers: MediaAsset[]
  storyCovers: MediaAsset[]
  aboutPhotos: MediaAsset[]
  journeys: Journey[]
  stories: StorySummary[]
}

export interface StorySummary {
  path: string
  title: string
  description: string
  date: string
  category: string
  cover: string
  readingTime?: number
}

export interface StoryDocument extends StorySummary {
  slug: string
  contentMarkdown: string
  contentHtml: string
}

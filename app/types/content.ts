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
  albums: Album[]
  gallery: GalleryPhoto[]
  banners: MediaAsset[]
  journeyCovers: MediaAsset[]
  storyCovers: MediaAsset[]
}

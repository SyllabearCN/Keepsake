export type ResourceName = 'albums' | 'stories' | 'videos' | 'banners'
export type BannerUsage = 'hero' | 'about'

export interface AlbumPhoto {
  id: string
  url: string
  key?: string
  filename?: string
  width?: number
  height?: number
}

export interface AlbumRecord {
  _id: string
  title: string
  slug: string
  date: string
  cover: string
  list: string[]
  photos: AlbumPhoto[]
  description: string
  sort_order: number
  enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface StoryRecord {
  _id: string
  title: string
  slug: string
  description: string
  date: string
  category: string
  location: string
  reading_time: number
  cover_url: string
  content_markdown: string
  sort_order: number
  enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface VideoRecord {
  _id: string
  title: string
  title_en: string
  description: string
  description_en: string
  location: string
  location_en: string
  bvid: string
  cover_url: string
  date: string
  duration: string
  featured: boolean
  sort_order: number
  enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface BannerRecord {
  _id: string
  title: string
  image_url: string
  storage_key: string
  usage: BannerUsage
  alt: string
  width: number
  height: number
  sort_order: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export type ResourceRecord = AlbumRecord | StoryRecord | VideoRecord | BannerRecord

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface DashboardResponse {
  counts: {
    albums: number
    photos: number
    stories: number
    videos: number
    banners: number
    enabled: number
    disabled: number
  }
  recent: {
    albums: AlbumRecord[]
    stories: StoryRecord[]
    videos: VideoRecord[]
  }
  cloudConnected: boolean
}

export const enabledOptions = [
  { label: '全部内容', value: 'all' },
  { label: '已启用', value: 'true' },
  { label: '已停用', value: 'false' },
] as const

export const bannerUsageOptions = [
  { label: '首页横图', value: 'hero' },
  { label: '关于页成员照', value: 'about' },
] as const

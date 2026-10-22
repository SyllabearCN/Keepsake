import { marked } from 'marked'
import { getUniCloudClient } from './unicloudClient'
import snapshot from '../data/unicloud-snapshot.json'
import type {
  Album,
  GalleryPhoto,
  Journey,
  MediaAsset,
  MediaManifest,
  StoryDocument,
  StorySummary,
} from '../../app/types/content'

interface CloudPhoto {
  id?: string
  url: string
  width?: number
  height?: number
  filename?: string
}

interface CloudAlbum {
  _id: string
  title: string
  slug: string
  date: string
  cover: string
  list: string[]
  photos?: CloudPhoto[]
  description?: string
  sort_order?: number
}

interface CloudVideo {
  _id: string
  title: string
  title_en?: string
  description?: string
  description_en?: string
  location?: string
  location_en?: string
  bvid: string
  cover_url?: string
  date: string
  duration: string
  featured?: boolean
  sort_order?: number
}

interface CloudStory {
  _id: string
  title: string
  slug: string
  description: string
  date: string
  category: string
  location?: string
  reading_time?: number
  cover_url?: string
  content_markdown: string
  sort_order?: number
}

interface CloudBanner {
  _id: string
  title: string
  image_url: string
  storage_key?: string
  usage: 'hero' | 'about'
  alt?: string
  width?: number
  height?: number
  sort_order?: number
}

interface SnapshotContent {
  generatedAt: string
  albums: CloudAlbum[]
  videos: CloudVideo[]
  stories: CloudStory[]
  banners: CloudBanner[]
}

const fallbackContent = snapshot as unknown as SnapshotContent

function getClient() {
  return getUniCloudClient()
}

function resultRows<T>(response: unknown): T[] {
  if (Array.isArray(response))
    return response as T[]

  const record = response as Record<string, unknown> | null
  if (!record)
    return []

  if (Array.isArray(record.result))
    return record.result as T[]
  if (Array.isArray(record.data))
    return record.data as T[]

  const result = record.result as Record<string, unknown> | undefined
  if (Array.isArray(result?.data))
    return result.data as T[]
  if (Array.isArray(result?.list))
    return result.list as T[]
  if (result && typeof result === 'object' && '_id' in result)
    return [result as T]
  if ('_id' in record)
    return [record as T]

  return []
}

async function queryCollection<T>(
  name: string,
  sort: Record<string, number>,
  query: Record<string, unknown> = { status: 'published' },
) {
  const db = getClient()
  if (!db)
    return null

  let collection = db.database().collection(name)
  collection = collection.where(query)
  for (const [field, direction] of Object.entries(sort))
    collection = collection.orderBy(field, direction > 0 ? 'asc' : 'desc')
  collection = collection.limit(1000)
  const response = await collection.get()
  return resultRows<T>(response)
}

function toAsset(url: string, width = 1600, height = 1000, filename = ''): MediaAsset {
  return {
    src: url || '/icons/media-placeholder.svg',
    filename: filename || url.split('/').pop() || '',
    width,
    height,
  }
}

function mapAlbum(album: CloudAlbum): Album {
  return {
    id: album.slug || album._id,
    label: { zh: album.title, en: album.title },
    description: {
      zh: album.description || `${album.title}，记录于 ${album.date}。`,
      en: `${album.title}, captured on ${album.date}.`,
    },
    date: album.date,
  }
}

function mapGalleryPhoto(album: CloudAlbum, photo: CloudPhoto, index: number): GalleryPhoto {
  return {
    id: `${album.slug || album._id}-${index + 1}`,
    src: photo.url,
    alt: `${album.title} - 照片 ${String(index + 1).padStart(3, '0')}`,
    title: {
      zh: `${album.title} · ${String(index + 1).padStart(3, '0')}`,
      en: `${album.title} · ${String(index + 1).padStart(3, '0')}`,
    },
    caption: {
      zh: album.description || album.title,
      en: album.description || album.title,
    },
    date: album.date,
    location: { zh: album.title, en: album.title },
    album: album.slug || album._id,
    width: photo.width || 1600,
    height: photo.height || 1000,
  }
}

function mapVideo(video: CloudVideo): Journey {
  return {
    id: video._id,
    bvid: video.bvid,
    title: { zh: video.title, en: video.title_en || video.title },
    description: {
      zh: video.description || '',
      en: video.description_en || video.description || '',
    },
    location: {
      zh: video.location || '',
      en: video.location_en || video.location || '',
    },
    date: video.date,
    duration: video.duration,
    featured: video.featured,
  }
}

function mapStorySummary(story: CloudStory): StorySummary {
  return {
    path: `/stories/${story.slug || story._id}`,
    title: story.title,
    description: story.description,
    date: story.date,
    category: story.category,
    cover: story.cover_url || '/icons/media-placeholder.svg',
    readingTime: story.reading_time,
  }
}

function mapStoryDocument(story: CloudStory): StoryDocument {
  return {
    ...mapStorySummary(story),
    slug: story.slug || story._id,
    contentMarkdown: story.content_markdown,
    contentHtml: marked.parse(story.content_markdown, { async: false }),
  }
}

function buildContent(
  albums: CloudAlbum[],
  videos: CloudVideo[],
  stories: CloudStory[],
  banners: CloudBanner[],
  generatedAt: string,
  source: MediaManifest['source'],
): {
  manifest: MediaManifest
  stories: StoryDocument[]
} {
  const gallery = albums.flatMap((album) => {
    const photos = album.photos?.length
      ? album.photos
      : album.list.map(url => ({ url }))
    return photos.map((photo, index) => mapGalleryPhoto(album, photo, index))
  })
  const heroBanners = banners.filter(banner => banner.usage === 'hero')
  const aboutBanners = banners.filter(banner => banner.usage === 'about')

  return {
    manifest: {
      generatedAt,
      source,
      albums: albums.map(mapAlbum),
      gallery,
      banners: heroBanners.map(banner => toAsset(
        banner.image_url,
        banner.width,
        banner.height,
        banner.storage_key,
      )),
      journeyCovers: videos.map(video => toAsset(video.cover_url || '')),
      storyCovers: stories.map(story => toAsset(story.cover_url || '')),
      aboutPhotos: aboutBanners.map(banner => toAsset(
        banner.image_url,
        banner.width,
        banner.height,
        banner.storage_key,
      )),
      journeys: videos.map(mapVideo),
      stories: stories.map(mapStorySummary),
    },
    stories: stories.map(mapStoryDocument),
  }
}

function getFallbackContent() {
  return buildContent(
    fallbackContent.albums,
    fallbackContent.videos,
    fallbackContent.stories,
    fallbackContent.banners,
    fallbackContent.generatedAt,
    'snapshot',
  )
}

export async function getUniCloudContent(): Promise<{
  manifest: MediaManifest
  stories: StoryDocument[]
}> {
  if (!getClient())
    return getFallbackContent()

  try {
    const [albumRows, videoRows, storyRows, bannerRows] = await Promise.all([
      queryCollection<CloudAlbum>('keepsake_albums', { sort_order: 1 }),
      queryCollection<CloudVideo>('keepsake_videos', { sort_order: 1 }),
      queryCollection<CloudStory>('keepsake_stories', { sort_order: 1 }),
      queryCollection<CloudBanner>('keepsake_banners', { usage: 1, sort_order: 1 }, { active: true }),
    ])

    const albums = albumRows ?? []
    const videos = videoRows ?? []
    const stories = storyRows ?? []
    const banners = bannerRows ?? []
    if (!albums.length && fallbackContent.albums.length) {
      console.warn('uniCloud returned no albums; using the committed cloud URL snapshot.')
      return getFallbackContent()
    }
    return buildContent(
      albums,
      videos,
      stories,
      banners,
      new Date().toISOString(),
      'cloud',
    )
  }
  catch (error) {
    console.warn('uniCloud query failed; using the committed cloud URL snapshot.', error)
    return getFallbackContent()
  }
}

export async function getUniCloudStory(slug: string) {
  const db = getClient()
  if (db) {
    try {
      const response = await db.database()
        .collection('keepsake_stories')
        .where({ slug, status: 'published' })
        .limit(1)
        .get()
      const rows = resultRows<CloudStory>(response)
      const story = rows[0]
      if (story)
        return mapStoryDocument(story)
    }
    catch (error) {
      console.warn(`uniCloud story query failed for ${slug}; using snapshot.`, error)
    }
  }

  const story = fallbackContent.stories.find(item => (
    item.slug === slug || item._id === slug
  ))
  return story ? mapStoryDocument(story) : null
}

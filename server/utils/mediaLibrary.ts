import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import sharp from 'sharp'
import type { Album, GalleryPhoto, MediaAsset, MediaManifest } from '../../app/types/content'

const mediaRoot = resolve(process.env.KEEPSAKE_MEDIA_ROOT || 'G:\\照片')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const specialFolders = new Set(['banner', 'journey', 'story'])
const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })
const cacheDuration = 10_000

let cachedManifest: MediaManifest | null = null
let cachedAt = 0

export function parseAlbumFolderName(folderName: string) {
  const match = folderName.match(/^(.+?)\s+(\d{4})-(\d{1,2})-(\d{1,2})$/u)
  if (!match)
    return null

  const year = match[2]!
  const month = match[3]!.padStart(2, '0')
  const day = match[4]!.padStart(2, '0')
  const date = `${year}-${month}-${day}`
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  if (
    parsedDate.getUTCFullYear() !== Number(year)
    || parsedDate.getUTCMonth() + 1 !== Number(month)
    || parsedDate.getUTCDate() !== Number(day)
  ) {
    return null
  }

  return {
    title: match[1]!.trim(),
    date,
  }
}

function assetUrl(path: string, width: number) {
  const normalized = path.replaceAll(sep, '/')
  return `/api/media/asset?path=${encodeURIComponent(normalized)}&w=${width}`
}

async function listImages(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort(collator.compare)
}

async function imageDimensions(source: string) {
  const metadata = await sharp(source).metadata()
  const rotated = metadata.orientation != null && metadata.orientation >= 5
  return {
    width: rotated ? metadata.height ?? 0 : metadata.width ?? 0,
    height: rotated ? metadata.width ?? 0 : metadata.height ?? 0,
  }
}

async function scanSpecialFolder(folderName: string, width: number, descending = false) {
  const folderPath = join(mediaRoot, folderName)
  const files = await listImages(folderPath)
  if (descending)
    files.reverse()

  const assets: MediaAsset[] = []
  for (const filename of files) {
    const dimensions = await imageDimensions(join(folderPath, filename))
    assets.push({
      src: assetUrl(join(folderName, filename), width),
      filename,
      ...dimensions,
    })
  }
  return assets
}

async function scanAlbums() {
  const entries = await readdir(mediaRoot, { withFileTypes: true })
  const albumFolders = entries
    .filter(entry => entry.isDirectory() && !specialFolders.has(entry.name))
    .map(entry => ({
      folderName: entry.name,
      ...parseAlbumFolderName(entry.name),
    }))
    .filter((album): album is { folderName: string, title: string, date: string } => album.title != null)
    .sort((left, right) => right.date.localeCompare(left.date) || collator.compare(left.title, right.title))

  const albums: Album[] = []
  const gallery: GalleryPhoto[] = []

  for (const [albumIndex, album] of albumFolders.entries()) {
    const folderPath = join(mediaRoot, album.folderName)
    const files = await listImages(folderPath)
    if (!files.length)
      continue

    const albumId = `album-${album.date.replaceAll('-', '')}-${albumIndex + 1}`

    for (const [photoIndex, filename] of files.entries()) {
      const source = join(folderPath, filename)
      const dimensions = await imageDimensions(source)
      const sequence = String(photoIndex + 1).padStart(3, '0')

      gallery.push({
        id: `${albumId}-${photoIndex + 1}`,
        src: assetUrl(relative(mediaRoot, source), 2000),
        alt: `${album.title} - 照片 ${sequence}`,
        title: {
          zh: `${album.title} · ${sequence}`,
          en: `${album.title} · ${sequence}`,
        },
        caption: {
          zh: `上传于 ${album.date}`,
          en: `Uploaded on ${album.date}`,
        },
        date: album.date,
        location: {
          zh: album.title,
          en: album.title,
        },
        album: albumId,
        ...dimensions,
      })
    }

    albums.push({
      id: albumId,
      label: {
        zh: album.title,
        en: album.title,
      },
      description: {
        zh: `${album.title}，上传于 ${album.date}，共 ${files.length} 张照片。`,
        en: `${album.title}, uploaded on ${album.date}, with ${files.length} photos.`,
      },
      date: album.date,
    })
  }

  return { albums, gallery }
}

export async function getMediaLibrary(force = false): Promise<MediaManifest> {
  if (!force && cachedManifest && Date.now() - cachedAt < cacheDuration)
    return cachedManifest

  const [{ albums, gallery }, banners, journeyCovers, storyCovers] = await Promise.all([
    scanAlbums(),
    scanSpecialFolder('banner', 2400),
    scanSpecialFolder('journey', 1600, true),
    scanSpecialFolder('story', 1600, true),
  ])

  cachedManifest = {
    generatedAt: new Date().toISOString(),
    albums,
    gallery,
    banners,
    journeyCovers,
    storyCovers,
  }
  cachedAt = Date.now()
  return cachedManifest
}

export async function renderMediaAsset(pathValue: string, requestedWidth: number) {
  const source = resolve(mediaRoot, pathValue.replaceAll('/', sep))
  if (!source.startsWith(mediaRoot + sep))
    throw new Error('Invalid media path')
  if (!imageExtensions.has(extname(source).toLowerCase()))
    throw new Error('Unsupported media type')

  const file = await stat(source)
  if (!file.isFile())
    throw new Error('Media file not found')

  const width = Math.min(2400, Math.max(320, requestedWidth))
  return sharp(source)
    .rotate()
    .resize({
      width,
      height: width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer()
}

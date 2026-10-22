import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const projectRoot = process.cwd()
const photoRoot = process.env.KEEPSAKE_PHOTO_ROOT || 'G:\\照片'
const cdnBase = (process.env.KEEPSAKE_CDN_BASE
  || 'https://mp-174d4239-a43e-4e0a-9fdc-92547241a10b.cdn.bspapp.com')
  .replace(/\/+$/, '')
const databaseRoot = join(projectRoot, 'uniCloud-aliyun', 'database')
const generatedRoot = join(projectRoot, '.generated', 'unicloud')

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })
const albumSlugs = new Map([
  ['婚礼筹备中 2023-09-30', 'wedding-preparation-2023-09-30'],
  ['婚纱照 2023-10-01', 'wedding-photos-2023-10-01'],
  ['海洋王国 2026-08-10', 'ocean-kingdom-2026-08-10'],
  ['百日宴 2026-09-06', 'hundred-day-feast-2026-09-06'],
  ['百日照 2026-09-06', 'hundred-day-photos-2026-09-06'],
  ['结婚照 2023-11-26', 'wedding-portraits-2023-11-26'],
  ['西安行 2025-01-11', 'xian-trip-2025-01-11'],
  ['香港澳门行 2024-02-10', 'hong-kong-macau-2024-02-10'],
])

const albumSlugByDate = new Map([
  ['2026-06-28', 'changde-wildlife-park-2026-06-28'],
])
const albumDateOverrides = new Map([
  ['hundred-day-feast-2026-09-06', '2026-06-16'],
  ['hundred-day-photos-2026-09-06', '2026-06-16'],
])

function toUrl(key) {
  return `${cdnBase}/${key.split('/').map(encodeURIComponent).join('/')}`
}

async function listImages(folder) {
  const files = await readdir(folder, { withFileTypes: true })
  return files
    .filter(entry => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort(collator.compare)
}

async function imageRecord(source, objectKey, index) {
  const metadata = await sharp(source).metadata()
  const info = await stat(source)
  const rotated = metadata.orientation != null && metadata.orientation >= 5
  return {
    id: `photo-${String(index + 1).padStart(4, '0')}`,
    sourcePath: source,
    key: objectKey,
    url: toUrl(objectKey),
    filename: basename(source),
    width: rotated ? metadata.height ?? 0 : metadata.width ?? 0,
    height: rotated ? metadata.width ?? 0 : metadata.height ?? 0,
    bytes: info.size,
  }
}

function parseAlbumFolder(folderName) {
  const match = folderName.match(/^(.+?)\s+(\d{4})-(\d{1,2})-(\d{1,2})$/u)
  if (!match)
    return null
  return {
    title: match[1].trim(),
    date: `${match[2]}-${match[3].padStart(2, '0')}-${match[4].padStart(2, '0')}`,
  }
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match)
    throw new Error('Story is missing frontmatter')
  const metadata = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z]+):\s*(.*)$/)
    if (!field)
      continue
    metadata[field[1]] = field[2].trim().replace(/^["']|["']$/g, '')
  }
  return { metadata, body: match[2].trim() }
}

async function loadJourneys() {
  const journeyPath = join(projectRoot, 'app', 'data', 'journeys.ts')
  const module = await import(`${pathToFileURL(journeyPath).href}?v=${Date.now()}`)
  return module.journeys
}

await mkdir(databaseRoot, { recursive: true })
await mkdir(generatedRoot, { recursive: true })

const topFolders = (await readdir(photoRoot, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
const specialFolders = new Set(['about', 'banner', 'journey', 'story'])

const albumDocs = []
const uploadEntries = []
for (const folderName of topFolders.filter(name => !specialFolders.has(name))) {
  const parsed = parseAlbumFolder(folderName)
  if (!parsed)
    continue
  const slug = albumSlugs.get(folderName) ?? albumSlugByDate.get(parsed.date)
  if (!slug)
    throw new Error(`Missing album slug mapping: ${folderName}`)
  const date = albumDateOverrides.get(slug) ?? parsed.date

  const files = await listImages(join(photoRoot, folderName))
  const photos = []
  for (const [index, filename] of files.entries()) {
    const source = join(photoRoot, folderName, filename)
    const extension = extname(filename).toLowerCase()
    const key = `keepsake/albums/${slug}/${String(index + 1).padStart(3, '0')}${extension}`
    const photo = await imageRecord(source, key, index)
    photos.push(photo)
    uploadEntries.push({ sourcePath: photo.sourcePath, key, size: photo.bytes })
  }

  albumDocs.push({
    _id: slug,
    title: parsed.title,
    slug,
    date,
    cover: photos[0]?.url ?? '',
    list: photos.map(photo => photo.url),
    photos: photos.map(photo => ({
      id: photo.id,
      key: photo.key,
      url: photo.url,
      filename: photo.filename,
      width: photo.width,
      height: photo.height,
    })),
    description: `${parsed.title}，记录于 ${parsed.date}，共 ${photos.length} 张照片。`,
    sort_order: albumDocs.length,
    status: 'published',
  })
  albumDocs.at(-1).description = albumDocs.at(-1).description.replace(parsed.date, date)
}

albumDocs.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title, 'zh-CN'))
albumDocs.forEach((album, index) => {
  album.sort_order = index
})

async function collectSpecial(folder, keyBuilder, startIndex = 0) {
  const files = await listImages(join(photoRoot, folder))
  const photos = []
  for (const [offset, filename] of files.entries()) {
    const source = join(photoRoot, folder, filename)
    const extension = extname(filename).toLowerCase()
    const key = keyBuilder(filename, extension, startIndex + offset)
    const photo = await imageRecord(source, key, startIndex + offset)
    photos.push(photo)
    uploadEntries.push({ sourcePath: photo.sourcePath, key, size: photo.bytes })
  }
  return photos
}

const aboutPhotos = await collectSpecial('about', (_, extension, index) => (
  `keepsake/about/${String(index + 1).padStart(3, '0')}${extension}`
))
const heroPhotos = await collectSpecial('banner', (filename, extension) => (
  `keepsake/banner/${basename(filename, extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '-')}${extension}`
))
const journeyCovers = await collectSpecial('journey', (_, extension, index) => (
  `keepsake/journeys/cover-${String(index + 1).padStart(2, '0')}${extension}`
))
const storySources = await listImages(join(photoRoot, 'story'))
const storyCovers = []
for (const [index, filename] of storySources.entries()) {
  const source = join(photoRoot, 'story', filename)
  const extension = extname(filename).toLowerCase()
  const stem = basename(filename, extname(filename))
  const dateMatch = stem.match(/^(\d{4})(\d{2})(\d{2})/)
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : stem
  const key = `keepsake/stories/${date}${extension}`
  const photo = await imageRecord(source, key, index)
  storyCovers.push({ ...photo, date })
  uploadEntries.push({ sourcePath: photo.sourcePath, key, size: photo.bytes })
}

const bannerDocs = [
  ...heroPhotos.map((photo, index) => ({
    _id: `hero-${String(index + 1).padStart(2, '0')}`,
    title: `首页横幅 ${index + 1}`,
    image_url: photo.url,
    storage_key: photo.key,
    usage: 'hero',
    alt: 'Keepsake 家庭记忆横幅',
    width: photo.width,
    height: photo.height,
    sort_order: index,
    active: true,
  })),
  ...aboutPhotos.map((photo, index) => ({
    _id: `about-${String(index + 1).padStart(2, '0')}`,
    title: ['PAPA', 'MAMA', 'KIDDO'][index] ?? `家庭成员 ${index + 1}`,
    image_url: photo.url,
    storage_key: photo.key,
    usage: 'about',
    alt: ['爸爸', '妈妈', '孩子'][index] ?? `家庭成员 ${index + 1}`,
    width: photo.width,
    height: photo.height,
    sort_order: index,
    active: true,
  })),
]

const journeys = await loadJourneys()
const videoDocs = journeys.map((journey, index) => ({
  _id: journey.id,
  title: journey.title.zh,
  title_en: journey.title.en,
  description: journey.description.zh,
  description_en: journey.description.en,
  location: journey.location.zh,
  location_en: journey.location.en,
  bvid: journey.bvid,
  cover_url: journeyCovers[index]?.url ?? '',
  date: journey.date,
  duration: journey.duration,
  featured: journey.featured ?? false,
  sort_order: index,
  status: 'published',
}))

const storyFiles = (await readdir(join(projectRoot, 'content', 'stories')))
  .filter(name => name.endsWith('.md'))
  .sort()
const storyDocs = []
for (const [index, filename] of storyFiles.entries()) {
  const { metadata, body } = parseFrontmatter(
    await readFile(join(projectRoot, 'content', 'stories', filename), 'utf8'),
  )
  const slug = basename(filename, '.md')
  const cover = storyCovers.find(item => item.date === metadata.date)
  storyDocs.push({
    _id: slug,
    title: metadata.title,
    slug,
    description: metadata.description,
    date: metadata.date,
    category: metadata.category,
    location: metadata.location || '',
    reading_time: Number(metadata.readingTime || 4),
    cover_url: cover?.url ?? '',
    content_markdown: body,
    sort_order: index,
    status: 'published',
  })
}
storyDocs.sort((left, right) => right.date.localeCompare(left.date))
storyDocs.forEach((story, index) => {
  story.sort_order = index
})

const dbInit = {
  keepsake_albums: {
    data: albumDocs,
    index: [
      {
        IndexName: 'date_desc',
        MgoKeySchema: {
          MgoIndexKeys: [{ Name: 'date', Direction: '-1' }],
          MgoIsUnique: false,
        },
      },
    ],
  },
  keepsake_videos: {
    data: videoDocs,
    index: [
      {
        IndexName: 'sort_order',
        MgoKeySchema: {
          MgoIndexKeys: [{ Name: 'sort_order', Direction: '1' }],
          MgoIsUnique: false,
        },
      },
    ],
  },
  keepsake_stories: {
    data: storyDocs,
    index: [
      {
        IndexName: 'date_desc',
        MgoKeySchema: {
          MgoIndexKeys: [{ Name: 'date', Direction: '-1' }],
          MgoIsUnique: false,
        },
      },
    ],
  },
  keepsake_banners: {
    data: bannerDocs,
    index: [
      {
        IndexName: 'usage_sort',
        MgoKeySchema: {
          MgoIndexKeys: [
            { Name: 'usage', Direction: '1' },
            { Name: 'sort_order', Direction: '1' },
          ],
          MgoIsUnique: false,
        },
      },
    ],
  },
}

const uploadManifest = {
  generatedAt: new Date().toISOString(),
  cdnBase,
  photoRoot,
  counts: {
    albums: albumDocs.length,
    albumPhotos: albumDocs.reduce((sum, album) => sum + album.list.length, 0),
    banners: bannerDocs.length,
    videos: videoDocs.length,
    stories: storyDocs.length,
    files: uploadEntries.length,
  },
  entries: uploadEntries,
}

await writeFile(join(databaseRoot, 'db_init.json'), `${JSON.stringify(dbInit, null, 2)}\n`, 'utf8')
await writeFile(join(generatedRoot, 'upload-manifest.json'), `${JSON.stringify(uploadManifest, null, 2)}\n`, 'utf8')

console.log(JSON.stringify(uploadManifest.counts, null, 2))

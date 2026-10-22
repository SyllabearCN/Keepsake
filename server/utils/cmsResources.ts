import type {
  AlbumPhoto,
  AlbumRecord,
  BannerRecord,
  ContentStatus,
  ResourceName,
  ResourceRecord,
  StoryRecord,
  VideoRecord,
} from '#shared/cms'

type ResourceInput = Record<string, unknown>

interface ResourceDefinition {
  collection: string
  searchFields: string[]
  sort: Record<string, number>
}

export const resourceDefinitions: Record<ResourceName, ResourceDefinition> = {
  albums: {
    collection: 'keepsake_albums',
    searchFields: ['title', 'slug', 'description'],
    sort: { date: -1, sort_order: 1 },
  },
  stories: {
    collection: 'keepsake_stories',
    searchFields: ['title', 'slug', 'category', 'description'],
    sort: { sort_order: 1, date: -1 },
  },
  videos: {
    collection: 'keepsake_videos',
    searchFields: ['title', 'title_en', 'bvid', 'location'],
    sort: { sort_order: 1, date: -1 },
  },
  banners: {
    collection: 'keepsake_banners',
    searchFields: ['title', 'alt', 'storage_key'],
    sort: { sort_order: 1, title: 1 },
  },
}

export function parseResource(value: string | undefined): ResourceName {
  if (value && value in resourceDefinitions) {
    return value as ResourceName
  }
  throw createError({ statusCode: 404, statusMessage: 'Unknown resource' })
}

function stringValue(input: ResourceInput, key: string, fallback = '') {
  const value = input[key]
  return typeof value === 'string' ? value.trim() : fallback
}

function numberValue(input: ResourceInput, key: string, fallback = 0) {
  const value = Number(input[key])
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

function booleanValue(input: ResourceInput, key: string, fallback = false) {
  const value = input[key]
  return typeof value === 'boolean' ? value : fallback
}

function statusValue(input: ResourceInput, fallback: ContentStatus = 'draft'): ContentStatus {
  const status = stringValue(input, 'status')
  return ['draft', 'published', 'archived'].includes(status)
    ? status as ContentStatus
    : fallback
}

function requireText(input: ResourceInput, key: string, label: string) {
  const value = stringValue(input, key)
  if (!value) {
    throw createError({ statusCode: 422, statusMessage: `${label}不能为空` })
  }
  return value
}

function slugify(value: string, fallbackPrefix: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `${fallbackPrefix}-${Date.now()}`
}

function normalizePhotos(input: ResourceInput): AlbumPhoto[] {
  const rawPhotos = Array.isArray(input.photos) ? input.photos : []
  const photos = rawPhotos.flatMap((raw, index): AlbumPhoto[] => {
    if (typeof raw === 'string' && raw.trim()) {
      return [{ id: `photo-${index + 1}`, url: raw.trim() }]
    }
    if (!raw || typeof raw !== 'object') {
      return []
    }
    const photo = raw as Record<string, unknown>
    const url = stringValue(photo, 'url')
    if (!url) {
      return []
    }
    return [{
      id: stringValue(photo, 'id') || `photo-${index + 1}`,
      url,
      key: stringValue(photo, 'key') || undefined,
      filename: stringValue(photo, 'filename') || url.split('/').pop(),
      width: numberValue(photo, 'width') || undefined,
      height: numberValue(photo, 'height') || undefined,
    }]
  })

  if (!photos.length && Array.isArray(input.list)) {
    return input.list.flatMap((url, index) => (
      typeof url === 'string' && url.trim()
        ? [{
            id: `photo-${index + 1}`,
            url: url.trim(),
            filename: url.split('/').pop(),
          }]
        : []
    ))
  }

  return photos
}

function normalizeRecord(resource: ResourceName, input: ResourceInput): ResourceInput {
  const timestamp = new Date()
  if (resource === 'albums') {
    const photos = normalizePhotos(input)
    const title = requireText(input, 'title', '相册名称')
    const date = requireText(input, 'date', '相册日期')
    const list = photos.map(photo => photo.url)
    const cover = stringValue(input, 'cover') || list[0] || ''
    if (!cover) {
      throw createError({ statusCode: 422, statusMessage: '请至少添加一张照片或选择封面' })
    }
    return {
      title,
      slug: stringValue(input, 'slug') || slugify(`${title}-${date}`, 'album'),
      date,
      cover,
      list,
      photos,
      description: stringValue(input, 'description'),
      sort_order: numberValue(input, 'sort_order'),
      status: statusValue(input),
      updated_at: timestamp,
    }
  }

  if (resource === 'stories') {
    return {
      title: requireText(input, 'title', '文章标题'),
      slug: stringValue(input, 'slug') || slugify(stringValue(input, 'title'), 'story'),
      description: requireText(input, 'description', '文章摘要'),
      date: requireText(input, 'date', '发布日期'),
      category: requireText(input, 'category', '文章分类'),
      location: stringValue(input, 'location'),
      reading_time: Math.max(1, numberValue(input, 'reading_time', 4)),
      cover_url: stringValue(input, 'cover_url'),
      content_markdown: requireText(input, 'content_markdown', 'Markdown 正文'),
      sort_order: numberValue(input, 'sort_order'),
      status: statusValue(input),
    }
  }

  if (resource === 'videos') {
    return {
      title: requireText(input, 'title', '视频标题'),
      title_en: stringValue(input, 'title_en'),
      description: stringValue(input, 'description'),
      description_en: stringValue(input, 'description_en'),
      location: stringValue(input, 'location'),
      location_en: stringValue(input, 'location_en'),
      bvid: requireText(input, 'bvid', 'Bilibili BV 编号'),
      cover_url: stringValue(input, 'cover_url'),
      date: requireText(input, 'date', '发布日期'),
      duration: requireText(input, 'duration', '视频时长'),
      featured: booleanValue(input, 'featured'),
      sort_order: numberValue(input, 'sort_order'),
      status: statusValue(input),
    }
  }

  const usage = stringValue(input, 'usage') === 'about' ? 'about' : 'hero'
  return {
    title: requireText(input, 'title', '横图标题'),
    image_url: requireText(input, 'image_url', '图片地址'),
    storage_key: stringValue(input, 'storage_key'),
    usage,
    alt: stringValue(input, 'alt'),
    width: numberValue(input, 'width'),
    height: numberValue(input, 'height'),
    sort_order: numberValue(input, 'sort_order'),
    active: booleanValue(input, 'active', true),
  }
}

function normalizeRow(resource: ResourceName, raw: ResourceInput): ResourceRecord {
  if (resource === 'albums') {
    const photos = normalizePhotos(raw)
    return {
      ...raw,
      _id: stringValue(raw, '_id'),
      title: stringValue(raw, 'title'),
      slug: stringValue(raw, 'slug'),
      date: stringValue(raw, 'date'),
      cover: stringValue(raw, 'cover') || photos[0]?.url || '',
      list: photos.map(photo => photo.url),
      photos,
      description: stringValue(raw, 'description'),
      sort_order: numberValue(raw, 'sort_order'),
      status: statusValue(raw, 'published'),
    } as AlbumRecord
  }

  if (resource === 'stories') {
    return {
      ...raw,
      _id: stringValue(raw, '_id'),
      title: stringValue(raw, 'title'),
      slug: stringValue(raw, 'slug'),
      description: stringValue(raw, 'description'),
      date: stringValue(raw, 'date'),
      category: stringValue(raw, 'category'),
      location: stringValue(raw, 'location'),
      reading_time: numberValue(raw, 'reading_time', 4),
      cover_url: stringValue(raw, 'cover_url'),
      content_markdown: stringValue(raw, 'content_markdown'),
      sort_order: numberValue(raw, 'sort_order'),
      status: statusValue(raw, 'published'),
    } as StoryRecord
  }

  if (resource === 'videos') {
    return {
      ...raw,
      _id: stringValue(raw, '_id'),
      title: stringValue(raw, 'title'),
      title_en: stringValue(raw, 'title_en'),
      description: stringValue(raw, 'description'),
      description_en: stringValue(raw, 'description_en'),
      location: stringValue(raw, 'location'),
      location_en: stringValue(raw, 'location_en'),
      bvid: stringValue(raw, 'bvid'),
      cover_url: stringValue(raw, 'cover_url'),
      date: stringValue(raw, 'date'),
      duration: stringValue(raw, 'duration'),
      featured: booleanValue(raw, 'featured'),
      sort_order: numberValue(raw, 'sort_order'),
      status: statusValue(raw, 'published'),
    } as VideoRecord
  }

  return {
    ...raw,
    _id: stringValue(raw, '_id'),
    title: stringValue(raw, 'title'),
    image_url: stringValue(raw, 'image_url'),
    storage_key: stringValue(raw, 'storage_key'),
    usage: stringValue(raw, 'usage') === 'about' ? 'about' : 'hero',
    alt: stringValue(raw, 'alt'),
    width: numberValue(raw, 'width'),
    height: numberValue(raw, 'height'),
    sort_order: numberValue(raw, 'sort_order'),
    active: booleanValue(raw, 'active', true),
  } as BannerRecord
}

async function queryAll(resource: ResourceName) {
  const collection = getCmsDatabase().collection(
    resourceDefinitions[resource].collection,
  )
  let query = collection
  for (const [field, direction] of Object.entries(resourceDefinitions[resource].sort)) {
    query = query.orderBy(field, direction > 0 ? 'asc' : 'desc')
  }
  const response = await query.limit(1000).get()
  return resultRows<ResourceInput>(response)
    .map(row => normalizeRow(resource, row))
}

export async function listResource(
  resource: ResourceName,
  options: { search?: string, status?: string, page?: number, pageSize?: number },
) {
  const rows = await queryAll(resource)
  const term = options.search?.trim().toLowerCase() ?? ''
  const filtered = rows.filter((row) => {
    const statusMatches = !options.status
      || options.status === 'all'
      || ('status' in row && row.status === options.status)
      || (resource === 'banners' && options.status === 'published' && 'active' in row && row.active)
    const searchMatches = !term || resourceDefinitions[resource].searchFields.some((field) => {
      const value = (row as unknown as Record<string, unknown>)[field]
      return String(value ?? '').toLowerCase().includes(term)
    })
    return statusMatches && searchMatches
  })

  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 10))
  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export async function listAllResource<T extends ResourceRecord>(resource: ResourceName) {
  return await queryAll(resource) as T[]
}

export async function getResource<T extends ResourceRecord>(resource: ResourceName, id: string) {
  const collection = getCmsDatabase().collection(
    resourceDefinitions[resource].collection,
  )
  const response = await collection.doc(id).get()
  const row = resultRows<ResourceInput>(response)[0]
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Content not found' })
  }
  return normalizeRow(resource, row) as T
}

async function mutateCloudResource(
  action: 'create' | 'update' | 'delete',
  resource: ResourceName,
  id: string | undefined,
  data: Record<string, unknown>,
) {
  const token = useRuntimeConfig().cms.cloudSecret
  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'CMS cloud function is not configured',
      message: '请配置 NUXT_CMS_CLOUD_SECRET。',
    })
  }

  const cloud = requireUniCloudClient() as unknown as {
    callFunction: (options: {
      name: string
      data: Record<string, unknown>
    }) => Promise<{ result?: { ok?: boolean, id?: string | null } }>
  }

  try {
    const response = await cloud.callFunction({
      name: 'keepsake-cms',
      data: {
        token,
        action,
        resource,
        id,
        data,
      },
    })
    if (!response.result?.ok) {
      throw new Error('CMS cloud function rejected the operation')
    }
    return { id: response.result.id ?? id ?? null }
  }
  catch (cause) {
    throw createError({
      statusCode: 502,
      statusMessage: 'CMS cloud write failed',
      message: '云端保存失败，请确认 keepsake-cms 云函数已部署。',
      cause,
    })
  }
}

export async function createResource(resource: ResourceName, input: ResourceInput) {
  const payload = normalizeRecord(resource, input)
  return mutateCloudResource('create', resource, undefined, resource === 'albums'
    ? { ...payload, created_at: new Date() }
    : payload)
}

export async function updateResource(resource: ResourceName, id: string, input: ResourceInput) {
  const payload = normalizeRecord(resource, input)
  return mutateCloudResource('update', resource, id, payload)
}

export async function deleteResource(resource: ResourceName, id: string) {
  return mutateCloudResource('delete', resource, id, {})
}

import { getUniCloudClient } from './unicloudClient'

export interface CmsDocument {
  get: () => Promise<unknown>
  update: (data: Record<string, unknown>) => Promise<unknown>
  remove: () => Promise<unknown>
}

export interface CmsCollection {
  where: (query: Record<string, unknown>) => CmsCollection
  orderBy: (field: string, direction: 'asc' | 'desc') => CmsCollection
  limit: (value: number) => CmsCollection
  get: () => Promise<unknown>
  add: (data: Record<string, unknown>) => Promise<unknown>
  doc: (id: string) => CmsDocument
}

export interface CmsDatabase {
  collection: (name: string) => CmsCollection
}

export function requireUniCloudClient() {
  const cloud = getUniCloudClient()
  if (!cloud) {
    throw createError({
      statusCode: 503,
      statusMessage: 'uniCloud is not configured',
      message: '请先在 .env 中配置 uniCloud 空间与客户端密钥。',
    })
  }
  return cloud
}

export function getCmsDatabase() {
  const cloud = requireUniCloudClient() as unknown as { database: () => CmsDatabase }
  return cloud.database()
}

export function resultRows<T>(response: unknown): T[] {
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

export function resultId(response: unknown) {
  const record = response as Record<string, unknown> | null
  const result = record?.result as Record<string, unknown> | undefined
  const id = result?.id ?? result?._id ?? record?.id ?? record?._id
  return typeof id === 'string' ? id : null
}

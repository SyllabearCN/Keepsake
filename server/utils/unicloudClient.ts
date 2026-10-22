import { createRequire } from 'node:module'
import { join } from 'node:path'

const storage = new Map<string, unknown>()

interface UniRequestResult {
  statusCode: number
  data: unknown
  header: Record<string, string>
}

interface UniRequestOptions {
  url: string
  method?: string
  header?: Record<string, unknown>
  data?: unknown
  success?: (result: UniRequestResult) => void
  fail?: (result: { errMsg: string }) => void
  complete?: (result: UniRequestResult | { errMsg: string }) => void
}

interface UniStorageOptions {
  key: string
  data?: unknown
  success?: (result?: { data?: unknown }) => void
}

interface UniUploadResult {
  statusCode: number
  data: string
}

interface UniUploadOptions {
  url: string
  name?: string
  formData?: Record<string, unknown>
  filePath: File
  fileType?: string
  header?: Record<string, unknown>
  success?: (result: UniUploadResult) => void
  fail?: (result: { errMsg: string }) => void
  complete?: (result: UniUploadResult | { errMsg: string }) => void
}

interface UniRuntime {
  request: (options: UniRequestOptions) => { abort: () => void }
  uploadFile: (options: UniUploadOptions) => { abort: () => void }
  getStorageSync: (key: string) => unknown
  setStorageSync: (key: string, value: unknown) => void
  removeStorageSync: (key: string) => void
  clearStorageSync: () => void
  getStorage: (options: UniStorageOptions) => void
  setStorage: (options: UniStorageOptions) => void
  getSystemInfoSync: () => { platform: string, deviceId: string }
}

function normalizeHeaders(header: Record<string, unknown> | undefined) {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(header || {}))
    normalized[key.toLowerCase()] = String(value)
  return normalized
}

const runtimeGlobal = globalThis as typeof globalThis & { uni?: UniRuntime }

if (!runtimeGlobal.uni) {
  runtimeGlobal.uni = {
    request(options) {
      const controller = new AbortController()
      const headers = normalizeHeaders(options.header)
      let body: string | undefined
      if (typeof options.data === 'string') {
        body = options.data
      }
      else if (options.data && typeof options.data === 'object') {
        body = JSON.stringify(options.data)
        headers['content-type'] = 'application/json'
      }

      fetch(options.url, {
        method: options.method || 'GET',
        headers,
        body,
        signal: controller.signal,
      })
        .then(async (response) => {
          const text = await response.text()
          let data: unknown = text
          try {
            data = text ? JSON.parse(text) : {}
          }
          catch {
            // The API can return a non-JSON error page.
          }
          const result = {
            statusCode: response.status,
            data,
            header: Object.fromEntries(response.headers.entries()),
          }
          options.success?.(result)
          options.complete?.(result)
        })
        .catch((error) => {
          const result = { errMsg: error?.message || String(error) }
          options.fail?.(result)
          options.complete?.(result)
        })

      return { abort: () => controller.abort() }
    },
    uploadFile(options) {
      const controller = new AbortController()
      const body = new FormData()
      for (const [key, value] of Object.entries(options.formData || {})) {
        body.append(key, String(value))
      }
      body.append(options.name || 'file', options.filePath, options.filePath.name)

      fetch(options.url, {
        method: 'POST',
        body,
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = await response.text()
          if (!response.ok) {
            const result = {
              errMsg: `uploadFile:fail ${response.status}${data ? ` ${data.slice(0, 300)}` : ''}`,
            }
            options.fail?.(result)
            options.complete?.(result)
            return
          }
          const result = {
            statusCode: response.status,
            data,
          }
          options.success?.(result)
          options.complete?.(result)
        })
        .catch((error) => {
          const result = { errMsg: error instanceof Error ? error.message : String(error) }
          options.fail?.(result)
          options.complete?.(result)
        })

      return { abort: () => controller.abort() }
    },
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => storage.set(key, value),
    removeStorageSync: (key: string) => storage.delete(key),
    clearStorageSync: () => storage.clear(),
    getStorage: ({ key, success }) => success?.({ data: storage.get(key) }),
    setStorage: ({ key, data, success }) => {
      storage.set(key, data)
      success?.()
    },
    getSystemInfoSync: () => ({
      platform: 'server',
      deviceId: 'keepsake-nuxt-server',
    }),
  }
}

process.env.VUE_APP_PLATFORM ||= 'h5'
process.env.UNI_PLATFORM ||= 'h5'

type UniCloudModule = typeof import('@dcloudio/uni-cloud')
const uniCloudSdk = (createRequire(join(process.cwd(), 'package.json'))('@dcloudio/uni-cloud') as UniCloudModule).default

let client: ReturnType<typeof uniCloudSdk.init> | undefined

export function getUniCloudClient() {
  const config = useRuntimeConfig()
  const spaceId = config.unicloud.spaceId
  const clientSecret = config.unicloud.clientSecret
  if (!spaceId || !clientSecret)
    return null

  client ||= uniCloudSdk.init({
    provider: 'aliyun',
    spaceId,
    clientSecret,
    endpoint: config.unicloud.endpoint,
  })
  return client
}

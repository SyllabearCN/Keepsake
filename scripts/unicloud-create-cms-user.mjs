import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const username = process.env.CMS_ADMIN_USERNAME || 'admin'
const password = process.env.CMS_ADMIN_PASSWORD || ''
if (!password) {
  throw new Error('Set CMS_ADMIN_PASSWORD before running this script.')
}

function readEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map(line => line.match(/^([^#=]+)=(.*)$/))
      .filter(Boolean)
      .map(match => [match[1].trim(), match[2].trim()]),
  )
}

const storage = new Map()
globalThis.uni ||= {
  request(options) {
    const controller = new AbortController()
    const headers = Object.fromEntries(
      Object.entries(options.header || {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
    )
    const body = typeof options.data === 'string'
      ? options.data
      : options.data
        ? JSON.stringify(options.data)
        : undefined
    if (body && !headers['content-type'])
      headers['content-type'] = 'application/json'

    fetch(options.url, {
      method: options.method || 'GET',
      headers,
      body,
      signal: controller.signal,
    })
      .then(async (response) => {
        const text = await response.text()
        let data = text
        try {
          data = text ? JSON.parse(text) : {}
        }
        catch {
          // Keep the server text for diagnostics.
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
  getStorageSync: key => storage.get(key),
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: key => storage.delete(key),
  clearStorageSync: () => storage.clear(),
  getSystemInfoSync: () => ({ platform: 'server', deviceId: 'keepsake-cms-user-script' }),
}

process.env.UNI_PLATFORM ||= 'h5'
process.env.VUE_APP_PLATFORM ||= 'h5'
const uniCloudModule = createRequire(import.meta.url)('@dcloudio/uni-cloud')
const uniCloudSdk = uniCloudModule.default

const env = readEnv(await readFile(join(process.cwd(), '.env'), 'utf8'))
const cloud = uniCloudSdk.init({
  provider: 'aliyun',
  spaceId: env.NUXT_UNICLOUD_SPACE_ID,
  clientSecret: env.NUXT_UNICLOUD_CLIENT_SECRET,
  endpoint: env.NUXT_UNICLOUD_ENDPOINT || 'https://api.next.bspapp.com',
})
const cloudSecret = env.NUXT_CMS_CLOUD_SECRET || ''
if (!cloudSecret) {
  throw new Error('Set NUXT_CMS_CLOUD_SECRET before running this script.')
}

const response = await cloud.callFunction({
  name: 'keepsake-cms',
  data: {
    token: cloudSecret,
    action: 'setPassword',
    username,
    password,
  },
})
if (!response?.result?.ok) {
  throw new Error('The cloud function did not update the CMS user.')
}
console.log(`Updated CMS user "${username}" through the protected cloud function.`)

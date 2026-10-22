import { createHmac, randomBytes, scryptSync } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const username = process.env.CMS_ADMIN_USERNAME || 'admin'
const password = process.env.CMS_ADMIN_PASSWORD || ''
const passwordPepper = process.env.CMS_PASSWORD_PEPPER || ''
if (!password) {
  throw new Error('Set CMS_ADMIN_PASSWORD before running this script.')
}
if (!passwordPepper) {
  throw new Error('Set CMS_PASSWORD_PEPPER before running this script.')
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

function hashPassword(value) {
  const salt = randomBytes(16)
  const derived = createHmac('sha256', passwordPepper).update(value).digest()
  const hash = scryptSync(derived, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })
  return `scrypt$16384$8$1$${salt.toString('hex')}$${hash.toString('hex')}`
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
const collection = cloud.database().collection('keepsake_user')

function rows(response) {
  return response?.result?.data || response?.data || response?.result || []
}

const existing = rows(
  await collection.where({ username }).limit(1).get(),
)
const now = new Date()
const record = {
  username,
  display_name: username,
  password_hash: hashPassword(password),
  role: 'admin',
  active: true,
  updated_at: now,
}

if (existing.length) {
  await collection.doc(existing[0]._id).update(record)
  console.log(`Updated CMS user "${username}" with a new password hash.`)
}
else {
  await collection.add({
    _id: username,
    ...record,
    created_at: now,
  })
  console.log(`Created CMS user "${username}" with a password hash.`)
}

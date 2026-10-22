import CryptoJS from 'crypto-js'

const TOKEN_KEY = 'keepsake-cms-session'
const FUNCTION_NAME = 'keepsake-cms'

interface UniCloudResponse<T> {
  result?: T
  data?: {
    result?: T
  }
  error?: {
    code?: string
    message?: string
  }
}

let accessTokenPromise: Promise<string> | undefined
let sessionToken = ''

function config() {
  const value = useRuntimeConfig().public.unicloud
  return {
    endpoint: String(value.endpoint || 'https://api.next.bspapp.com').replace(/\/$/, ''),
    spaceId: String(value.spaceId || ''),
    clientSecret: String(value.clientSecret || ''),
  }
}

function readStoredToken() {
  if (sessionToken || !import.meta.client) {
    return sessionToken
  }
  try {
    sessionToken = localStorage.getItem(TOKEN_KEY) || ''
  }
  catch {
    sessionToken = ''
  }
  return sessionToken
}

function saveSessionToken(token: string) {
  sessionToken = token
  if (!import.meta.client) {
    return
  }
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    }
    else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
  catch {
    // Storage can be unavailable in privacy mode; the in-memory token still works.
  }
}

function sign(payload: Record<string, string | number>, clientSecret: string) {
  const source = Object.keys(payload)
    .sort()
    .filter(key => payload[key])
    .map(key => `${key}=${payload[key]}`)
    .join('&')
  return CryptoJS.HmacMD5(source, clientSecret).toString(CryptoJS.enc.Hex)
}

async function postClient<T>(payload: Record<string, string | number>, clientSecret: string) {
  const settings = config()
  if (!settings.spaceId || !settings.clientSecret) {
    throw new Error('uniCloud 尚未配置，请检查 NUXT_UNICLOUD_SPACE_ID 和 NUXT_UNICLOUD_CLIENT_SECRET。')
  }

  const token = typeof payload.token === 'string' ? payload.token : ''
  const response = await $fetch<UniCloudResponse<T>>(`${settings.endpoint}/client`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-serverless-sign': sign(payload, clientSecret),
      ...(token ? { 'x-basement-token': token } : {}),
    },
    body: payload,
    timeout: 30_000,
  })

  if (response.error) {
    throw new Error(response.error.message || response.error.code || 'uniCloud 请求失败。')
  }
  const wrapped = response.data as T | { result?: T } | undefined
  if (wrapped && typeof wrapped === 'object' && 'result' in wrapped) {
    return wrapped.result as T
  }
  return (response.result ?? wrapped) as T
}

async function getAccessToken() {
  const settings = config()
  accessTokenPromise ||= (async () => {
    const payload = {
      method: 'serverless.auth.user.anonymousAuthorize',
      params: '{}',
      spaceId: settings.spaceId,
      timestamp: Date.now(),
    }
    const result = await postClient<{ accessToken?: string }>(payload, settings.clientSecret)
    if (!result?.accessToken) {
      throw new Error('无法连接 uniCloud 服务空间。')
    }
    return result.accessToken
  })()

  try {
    return await accessTokenPromise
  }
  catch (error) {
    accessTokenPromise = undefined
    throw error
  }
}

async function invoke<T>(data: Record<string, unknown>) {
  const settings = config()
  const accessToken = await getAccessToken()
  const payload = {
    method: 'serverless.function.runtime.invoke',
    params: JSON.stringify({
      functionTarget: FUNCTION_NAME,
      functionArgs: data,
    }),
    spaceId: settings.spaceId,
    timestamp: Date.now(),
    token: accessToken,
  }
  return await postClient<T>(payload, settings.clientSecret)
}

export async function callCmsCloud<T>(
  action: string,
  data: Record<string, unknown> = {},
  requiresAuth = true,
) {
  const token = readStoredToken()
  if (requiresAuth && !token) {
    throw new Error('登录状态已失效，请重新登录。')
  }

  const result = await invoke<T & {
    ok?: boolean
    token?: string
    username?: string
  }>({
    ...data,
    action,
    sessionToken: token || undefined,
  })

  if (action === 'login' && result?.token) {
    saveSessionToken(result.token)
  }
  if (action === 'logout') {
    saveSessionToken('')
  }
  return result
}

export function getCmsSessionToken() {
  return readStoredToken()
}

export async function uploadCmsFile(file: File, usage: string) {
  await callCmsCloud<{ authenticated: boolean }>('session')

  const settings = config()
  const accessToken = await getAccessToken()
  const extension = file.type.split('/').pop()?.replace('jpeg', 'jpg') || 'jpg'
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'image'
  const now = new Date()
  const cloudPath = [
    'keepsake/cms',
    usage,
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.${extension}`,
  ].join('/')
  const payload = {
    method: 'serverless.file.resource.generateProximalSign',
    params: JSON.stringify({
      env: 'public',
      filename: cloudPath,
    }),
    spaceId: settings.spaceId,
    timestamp: Date.now(),
    token: accessToken,
  }
  const signature = await postClient<{
    accessKeyId: string
    callback?: string
    cdnDomain: string
    host: string
    id: string
    ossCallbackUrl?: string
    ossPath: string
    policy: string
    securityToken?: string
    signature: string
  }>(payload, settings.clientSecret)
  if (!signature?.host || !signature.ossPath) {
    throw new Error('无法获取云存储上传地址。')
  }

  const form = new FormData()
  form.append('Cache-Control', 'max-age=2592000')
  form.append('Content-Disposition', 'attachment')
  form.append('OSSAccessKeyId', signature.accessKeyId)
  form.append('Signature', signature.signature)
  form.append('host', signature.host)
  form.append('id', signature.id)
  form.append('key', signature.ossPath)
  form.append('policy', signature.policy)
  form.append('success_action_status', '200')
  if (signature.securityToken) {
    form.append('x-oss-security-token', signature.securityToken)
  }
  if (signature.ossCallbackUrl) {
    const callback = {
      callbackUrl: signature.ossCallbackUrl,
      callbackBody: JSON.stringify({
        fileId: signature.id,
        spaceId: settings.spaceId,
      }),
      callbackBodyType: 'application/json',
    }
    form.append(
      'callback',
      CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(callback))),
    )
  }
  form.append('file', file, file.name)

  const response = await fetch(`https://${signature.host}`, {
    method: 'POST',
    body: form,
  })
  if (!response.ok) {
    throw new Error(`图片上传失败（HTTP ${response.status}）。`)
  }

  return {
    url: `https://${signature.cdnDomain}/${signature.ossPath}`,
    fileID: `https://${signature.cdnDomain}/${signature.ossPath}`,
    key: cloudPath,
    filename: file.name,
  }
}

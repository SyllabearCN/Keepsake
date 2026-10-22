import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'keepsake_cms_session'
const SESSION_SECONDS = 60 * 60 * 24 * 7
const loginAttempts = new Map<string, { failures: number, resetAt: number }>()

function getAuthConfig(event: H3Event) {
  const config = useRuntimeConfig(event).cms
  if (!config.sessionSecret || !config.passwordPepper) {
    throw createError({
      statusCode: 503,
      statusMessage: 'CMS auth is not configured',
      message: '请配置 NUXT_CMS_SESSION_SECRET 和 NUXT_CMS_PASSWORD_PEPPER。',
    })
  }
  return config
}

function safeCompare(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

async function findAdminUser(username: string) {
  const collection = getCmsDatabase().collection('keepsake_user')
  const response = await collection
    .where({ username, active: true })
    .limit(1)
    .get()
  return resultRows<{
    _id: string
    username: string
    password_hash: string
    role?: string
    active?: boolean
  }>(response)[0] ?? null
}

export async function verifyAdminCredentials(event: H3Event, username: string, password: string) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const attempt = loginAttempts.get(ip)
  const now = Date.now()
  if (attempt && attempt.resetAt > now && attempt.failures >= 5) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many login attempts',
      message: '登录尝试过多，请五分钟后重试。',
    })
  }

  const config = getAuthConfig(event)
  const user = await findAdminUser(username)
  const passwordValid = user?.password_hash
    ? verifyCmsPassword(password, user.password_hash, config.passwordPepper)
    : (consumeDummyPasswordCheck(password, config.passwordPepper), false)
  if (!user || !passwordValid) {
    loginAttempts.set(ip, {
      failures: attempt?.resetAt && attempt.resetAt > now ? attempt.failures + 1 : 1,
      resetAt: now + 5 * 60 * 1000,
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
      message: '账号或密码不正确。',
    })
  }

  loginAttempts.delete(ip)
  return user
}

export function createAdminSession(event: H3Event, username: string) {
  const config = getAuthConfig(event)
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString('base64url')
  const token = `${payload}.${sign(payload, config.sessionSecret)}`

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export function getAdminSession(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  const config = useRuntimeConfig(event).cms
  if (!token || !config.sessionSecret) {
    return null
  }

  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeCompare(signature, sign(payload, config.sessionSecret))) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      sub?: string
      exp?: number
    }
    if (!parsed.sub || !parsed.exp || parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }
    return { username: parsed.sub, expiresAt: parsed.exp }
  }
  catch {
    return null
  }
}

export function requireAdminSession(event: H3Event) {
  const session = getAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin authentication required',
      message: '登录状态已失效，请重新登录。',
    })
  }
  return session
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

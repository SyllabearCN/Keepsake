'use strict'

const {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} = require('node:crypto')

const SERVICE_TOKEN_HASH = 'cce0259d0d3b26ff63308be7b2f99457de266286ec610ac2d4b914c085913f82'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
const COLLECTIONS = {
  albums: {
    collection: 'keepsake_albums',
    searchFields: ['title', 'slug', 'description'],
    sort: [['date', 'desc'], ['sort_order', 'asc']],
  },
  stories: {
    collection: 'keepsake_stories',
    searchFields: ['title', 'slug', 'category', 'description'],
    sort: [['sort_order', 'asc'], ['date', 'desc']],
  },
  videos: {
    collection: 'keepsake_videos',
    searchFields: ['title', 'title_en', 'bvid', 'location'],
    sort: [['sort_order', 'asc'], ['date', 'desc']],
  },
  banners: {
    collection: 'keepsake_banners',
    searchFields: ['title', 'alt', 'storage_key'],
    sort: [['sort_order', 'asc'], ['title', 'asc']],
  },
}

function database() {
  return uniCloud.database()
}

function rows(response) {
  return response?.data || response?.result?.data || response?.result || []
}

function safeCompare(actual, expected) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}

function authenticateService(token) {
  if (typeof token !== 'string' || !token) {
    return false
  }
  return safeCompare(
    createHash('sha256').update(token).digest('hex'),
    SERVICE_TOKEN_HASH,
  )
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

function stringValue(input, key, fallback = '') {
  const value = input?.[key]
  return typeof value === 'string' ? value.trim() : fallback
}

function numberValue(input, key, fallback = 0) {
  const value = Number(input?.[key])
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

function booleanValue(input, key, fallback = false) {
  return typeof input?.[key] === 'boolean' ? input[key] : fallback
}

function requiredText(input, key, label) {
  const value = stringValue(input, key)
  if (!value) {
    throw new Error(`${label}不能为空`)
  }
  return value
}

function slugify(value, prefix) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `${prefix}-${Date.now()}`
}

function normalizePhotos(input) {
  const source = Array.isArray(input?.photos)
    ? input.photos
    : Array.isArray(input?.list)
      ? input.list
      : []
  return source.flatMap((raw, index) => {
    if (typeof raw === 'string' && raw.trim()) {
      return [{
        id: `photo-${index + 1}`,
        url: raw.trim(),
        filename: raw.split('/').pop(),
      }]
    }
    if (!raw || typeof raw !== 'object') {
      return []
    }
    const url = stringValue(raw, 'url')
    if (!url) {
      return []
    }
    return [{
      id: stringValue(raw, 'id') || `photo-${index + 1}`,
      url,
      key: stringValue(raw, 'key') || undefined,
      filename: stringValue(raw, 'filename') || url.split('/').pop(),
      width: numberValue(raw, 'width') || undefined,
      height: numberValue(raw, 'height') || undefined,
    }]
  })
}

function normalizeRecord(resource, input) {
  if (resource === 'albums') {
    const photos = normalizePhotos(input)
    const cover = stringValue(input, 'cover') || photos[0]?.url || ''
    if (!cover) {
      throw new Error('请至少添加一张照片或选择封面')
    }
    const title = requiredText(input, 'title', '相册名称')
    const date = requiredText(input, 'date', '相册日期')
    return {
      title,
      slug: stringValue(input, 'slug') || slugify(`${title}-${date}`, 'album'),
      date,
      cover,
      list: photos.map(photo => photo.url),
      photos,
      description: stringValue(input, 'description'),
      sort_order: numberValue(input, 'sort_order'),
      enabled: booleanValue(input, 'enabled', true),
    }
  }

  if (resource === 'stories') {
    return {
      title: requiredText(input, 'title', '文章标题'),
      slug: stringValue(input, 'slug') || slugify(stringValue(input, 'title'), 'story'),
      description: requiredText(input, 'description', '文章摘要'),
      date: requiredText(input, 'date', '发布日期'),
      category: requiredText(input, 'category', '文章分类'),
      location: stringValue(input, 'location'),
      reading_time: Math.max(1, numberValue(input, 'reading_time', 4)),
      cover_url: stringValue(input, 'cover_url'),
      content_markdown: requiredText(input, 'content_markdown', 'Markdown 正文'),
      sort_order: numberValue(input, 'sort_order'),
      enabled: booleanValue(input, 'enabled', true),
    }
  }

  if (resource === 'videos') {
    return {
      title: requiredText(input, 'title', '视频标题'),
      title_en: stringValue(input, 'title_en'),
      description: stringValue(input, 'description'),
      description_en: stringValue(input, 'description_en'),
      location: stringValue(input, 'location'),
      location_en: stringValue(input, 'location_en'),
      bvid: requiredText(input, 'bvid', 'Bilibili BV 编号'),
      cover_url: stringValue(input, 'cover_url'),
      date: requiredText(input, 'date', '发布日期'),
      duration: requiredText(input, 'duration', '视频时长'),
      featured: booleanValue(input, 'featured'),
      sort_order: numberValue(input, 'sort_order'),
      enabled: booleanValue(input, 'enabled', true),
    }
  }

  return {
    title: requiredText(input, 'title', '横图标题'),
    image_url: requiredText(input, 'image_url', '图片地址'),
    storage_key: stringValue(input, 'storage_key'),
    usage: stringValue(input, 'usage') === 'about' ? 'about' : 'hero',
    alt: stringValue(input, 'alt'),
    width: numberValue(input, 'width'),
    height: numberValue(input, 'height'),
    sort_order: numberValue(input, 'sort_order'),
    active: booleanValue(input, 'active', true),
  }
}

function getResource(name) {
  const resource = COLLECTIONS[name]
  if (!resource) {
    throw new Error('Unsupported CMS resource')
  }
  return resource
}

async function findUser(username) {
  const response = await database()
    .collection('keepsake_user')
    .where({ username, active: true })
    .limit(1)
    .get()
  return rows(response)[0] || null
}

function verifyPassword(password, encoded) {
  const [scheme, cost, blockSize, parallelization, saltHex, hashHex] = String(encoded || '').split('$')
  if (scheme !== 'scrypt2' || !saltHex || !hashHex) {
    return false
  }
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
    maxmem: 64 * 1024 * 1024,
  })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })
  return `scrypt2$16384$8$1$${salt.toString('hex')}$${hash.toString('hex')}`
}

async function setPassword(username, password) {
  if (!username || password.length < 6) {
    throw new Error('账号不能为空，密码至少需要 6 位。')
  }
  const now = new Date()
  const user = await findUser(username)
  const payload = {
    username,
    display_name: user?.display_name || username,
    password_hash: hashPassword(password),
    role: user?.role || 'admin',
    active: true,
    sessions: [],
    updated_at: now,
  }
  if (user) {
    await database().collection('keepsake_user').doc(user._id).update(payload)
  }
  else {
    await database().collection('keepsake_user').add({
      _id: username,
      ...payload,
      created_at: now,
    })
  }
  return { ok: true, username }
}

async function createSession(user) {
  const token = `${Buffer.from(user.username).toString('base64url')}.${randomBytes(32).toString('base64url')}`
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION)
  const activeSessions = (Array.isArray(user.sessions) ? user.sessions : [])
    .filter(session => new Date(session.expires_at).getTime() > now.getTime())
    .slice(-4)
  activeSessions.push({
    token_hash: tokenHash(token),
    created_at: now,
    expires_at: expiresAt,
  })
  await database().collection('keepsake_user').doc(user._id).update({
    sessions: activeSessions,
    last_login_at: now,
    updated_at: now,
  })
  return {
    token,
    username: user.username,
    expiresAt: expiresAt.toISOString(),
  }
}

async function verifySession(token) {
  if (typeof token !== 'string' || !token.includes('.')) {
    throw new Error('登录状态已失效，请重新登录。')
  }
  let username
  try {
    username = Buffer.from(token.split('.')[0], 'base64url').toString()
  }
  catch {
    throw new Error('登录状态无效，请重新登录。')
  }
  const user = await findUser(username)
  if (!user) {
    throw new Error('登录账号不存在或已停用。')
  }
  const hash = tokenHash(token)
  const now = Date.now()
  const session = (Array.isArray(user.sessions) ? user.sessions : [])
    .find(item => item.token_hash === hash && new Date(item.expires_at).getTime() > now)
  if (!session) {
    throw new Error('登录状态已失效，请重新登录。')
  }
  return user
}

async function login(username, password) {
  const user = await findUser(username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    await new Promise(resolve => setTimeout(resolve, 350))
    throw new Error('账号或密码不正确。')
  }
  return {
    ok: true,
    authenticated: true,
    ...await createSession(user),
  }
}

async function logout(token) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: true }
  }
  let username
  try {
    username = Buffer.from(token.split('.')[0], 'base64url').toString()
  }
  catch {
    return { ok: true }
  }
  const user = await findUser(username)
  if (!user) {
    return { ok: true }
  }
  const hash = tokenHash(token)
  await database().collection('keepsake_user').doc(user._id).update({
    sessions: (Array.isArray(user.sessions) ? user.sessions : [])
      .filter(session => session.token_hash !== hash && new Date(session.expires_at).getTime() > Date.now()),
    updated_at: new Date(),
  })
  return { ok: true }
}

async function allRows(resourceName) {
  const resource = getResource(resourceName)
  let query = database().collection(resource.collection)
  for (const [field, direction] of resource.sort) {
    query = query.orderBy(field, direction)
  }
  return rows(await query.limit(1000).get())
}

async function listResource(resourceName, input = {}) {
  const resource = getResource(resourceName)
  const search = stringValue(input, 'search').toLowerCase()
  const enabled = stringValue(input, 'enabled')
  let data = await allRows(resourceName)
  data = data.filter((item) => {
    const itemEnabled = resourceName === 'banners' ? item.active !== false : item.enabled !== false
    const enabledMatches = !enabled
      || enabled === 'all'
      || itemEnabled === (enabled === 'true')
    const searchMatches = !search || resource.searchFields.some(field => (
      String(item[field] || '').toLowerCase().includes(search)
    ))
    return enabledMatches && searchMatches
  })
  const page = Math.max(1, numberValue(input, 'page', 1))
  const pageSize = Math.min(100, Math.max(1, numberValue(input, 'pageSize', 10)))
  const start = (page - 1) * pageSize
  return {
    items: data.slice(start, start + pageSize),
    total: data.length,
    page,
    pageSize,
  }
}

async function getResourceById(resourceName, id) {
  if (!id) {
    throw new Error('缺少内容编号。')
  }
  const resource = getResource(resourceName)
  const item = rows(await database().collection(resource.collection).doc(id).get())[0]
  if (!item) {
    throw new Error('内容不存在。')
  }
  return item
}

async function saveResource(action, resourceName, id, input) {
  const resource = getResource(resourceName)
  const collection = database().collection(resource.collection)
  if (action === 'delete') {
    if (!id) {
      throw new Error('缺少内容编号。')
    }
    await collection.doc(id).remove()
    return { ok: true, id }
  }

  const data = normalizeRecord(resourceName, input || {})
  if (action === 'create') {
    const payload = resourceName === 'albums'
      ? { ...data, created_at: new Date() }
      : data
    const result = await collection.add(payload)
    return { ok: true, id: result.id || result._id || null }
  }
  if (!id) {
    throw new Error('缺少内容编号。')
  }
  if (action === 'update') {
    await collection.doc(id).update(data)
    return { ok: true, id }
  }
  throw new Error('不支持的内容操作。')
}

async function dashboard() {
  const [albums, stories, videos, banners] = await Promise.all([
    allRows('albums'),
    allRows('stories'),
    allRows('videos'),
    allRows('banners'),
  ])
  const photos = albums.reduce((total, album) => (
    total + (Array.isArray(album.photos) ? album.photos.length : 0)
  ), 0)
  const records = [...albums, ...stories, ...videos]
  return {
    counts: {
      albums: albums.length,
      photos,
      stories: stories.length,
      videos: videos.length,
      banners: banners.length,
      enabled: records.filter(item => item.enabled !== false).length,
      disabled: records.filter(item => item.enabled === false).length,
    },
    recent: {
      albums: albums.slice(0, 4),
      stories: stories.slice(0, 4),
      videos: videos.slice(0, 3),
    },
    cloudConnected: true,
  }
}

async function migrateEnabled() {
  const db = database()
  const collections = [
    ['albums', 'keepsake_albums'],
    ['stories', 'keepsake_stories'],
    ['videos', 'keepsake_videos'],
  ]
  const migrated = {}
  for (const [resourceName, collectionName] of collections) {
    const items = await allRows(resourceName)
    for (const item of items) {
      const enabled = typeof item.enabled === 'boolean'
        ? item.enabled
        : item.status !== 'draft' && item.status !== 'archived'
      await db.collection(collectionName).doc(item._id).update({
        enabled,
        status: db.command.remove(),
      })
    }
    migrated[collectionName] = items.length
  }
  return { ok: true, migrated }
}

async function moveStorageFile(sourceUrl, cloudPath) {
  if (!/^https:\/\/[^/]+\.cdn\.bspapp\.com\/cloudstorage\/[^/]+$/i.test(sourceUrl)) {
    throw new Error('Only cloudstorage files can be moved.')
  }
  if (!/^keepsake\/(albums|journeys|stories|videos|banner|about)\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(cloudPath)) {
    throw new Error('Invalid destination cloud path.')
  }
  const sourceResponse = await uniCloud.httpclient.request(sourceUrl, {
    method: 'GET',
    dataType: 'arraybuffer',
    timeout: 60000,
  })
  if (!sourceResponse?.status || sourceResponse.status >= 400) {
    throw new Error(`Unable to download the source file: HTTP ${sourceResponse?.status || 'unknown'}`)
  }
  const fileContent = Buffer.isBuffer(sourceResponse.data)
    ? sourceResponse.data
    : Buffer.from(sourceResponse.data)
  if (!fileContent.length) {
    throw new Error('Unable to download the source file.')
  }
  const uploaded = await uniCloud.uploadFile({
    cloudPath,
    fileContent,
    cloudPathAsRealPath: true,
  })
  if (!uploaded?.fileID || uploaded.fileID.includes('/cloudstorage/')) {
    throw new Error('The destination path was not preserved by cloud storage.')
  }
  await uniCloud.deleteFile({ fileList: [sourceUrl] })
  return {
    ok: true,
    fileID: uploaded.fileID,
    key: cloudPath,
    bytes: fileContent.length,
  }
}

exports.main = async (event = {}) => {
  const action = event.action
  const serviceRequest = authenticateService(event.token)

  if (action === 'login') {
    return await login(
      stringValue(event, 'username'),
      typeof event.password === 'string' ? event.password : '',
    )
  }

  if (action === 'logout') {
    return await logout(event.sessionToken)
  }

  if (action === 'setPassword') {
    if (!serviceRequest) {
      throw new Error('Unauthorized CMS operation')
    }
    return await setPassword(
      stringValue(event, 'username'),
      typeof event.password === 'string' ? event.password : '',
    )
  }

  if (action === 'migrateEnabled') {
    if (!serviceRequest) {
      throw new Error('Unauthorized CMS operation')
    }
    return await migrateEnabled()
  }

  let user = null
  if (!serviceRequest) {
    user = await verifySession(event.sessionToken)
  }

  if (action === 'session') {
    return {
      ok: true,
      authenticated: Boolean(user),
      configured: true,
      username: user?.username || null,
    }
  }

  if (action === 'dashboard') {
    return dashboard()
  }
  if (action === 'moveStorageFile') {
    if (!serviceRequest && !user) {
      throw new Error('Unauthorized storage operation')
    }
    return await moveStorageFile(
      stringValue(event, 'sourceUrl'),
      stringValue(event, 'cloudPath'),
    )
  }
  if (action === 'list') {
    return listResource(event.resource, event.query)
  }
  if (action === 'get') {
    return getResourceById(event.resource, event.id)
  }
  if (action === 'create' || action === 'update' || action === 'delete') {
    return saveResource(action, event.resource, event.id, event.data)
  }

  throw new Error('Unsupported CMS action')
}

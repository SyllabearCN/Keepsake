'use strict'

const { createHash, timingSafeEqual } = require('node:crypto')

const TOKEN_HASH = 'cce0259d0d3b26ff63308be7b2f99457de266286ec610ac2d4b914c085913f82'
const COLLECTIONS = new Map([
  ['albums', 'keepsake_albums'],
  ['stories', 'keepsake_stories'],
  ['videos', 'keepsake_videos'],
  ['banners', 'keepsake_banners'],
])

function authenticate(token) {
  if (typeof token !== 'string' || !token) {
    return false
  }
  const actual = Buffer.from(createHash('sha256').update(token).digest('hex'))
  const expected = Buffer.from(TOKEN_HASH)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function validId(id) {
  return typeof id === 'string' && id.trim().length > 0
}

exports.main = async (event = {}) => {
  if (!authenticate(event.token)) {
    throw new Error('Unauthorized CMS operation')
  }

  const collectionName = COLLECTIONS.get(event.resource)
  if (!collectionName) {
    throw new Error('Unsupported CMS resource')
  }
  if (!event.data || typeof event.data !== 'object') {
    throw new Error('Missing CMS data')
  }

  const collection = uniCloud.database().collection(collectionName)
  if (event.action === 'create') {
    const result = await collection.add(event.data)
    return { ok: true, id: result.id || result._id || null }
  }
  if (!validId(event.id)) {
    throw new Error('Missing CMS document id')
  }
  if (event.action === 'update') {
    await collection.doc(event.id).update(event.data)
    return { ok: true, id: event.id }
  }
  if (event.action === 'delete') {
    await collection.doc(event.id).remove()
    return { ok: true, id: event.id }
  }
  throw new Error('Unsupported CMS action')
}

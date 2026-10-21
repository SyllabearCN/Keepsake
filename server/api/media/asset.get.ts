export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = typeof query.path === 'string' ? query.path : ''
  const requestedWidth = Number(query.w) || 1600

  if (!path)
    throw createError({ statusCode: 400, statusMessage: 'Missing media path' })

  try {
    const image = await renderMediaAsset(path, requestedWidth)
    setResponseHeader(event, 'Content-Type', 'image/webp')
    setResponseHeader(event, 'Cache-Control', 'private, max-age=86400')
    return image
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }
})

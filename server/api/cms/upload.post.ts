const acceptedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)
  if (!file?.filename || !file.data.length) {
    throw createError({ statusCode: 422, statusMessage: 'Missing image file' })
  }
  if (file.data.length > 25 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Image must be smaller than 25 MB' })
  }

  const extension = acceptedTypes.get(file.type || '')
  if (!extension) {
    throw createError({ statusCode: 415, statusMessage: 'Only JPG, PNG, WebP and GIF are supported' })
  }

  const usageParam = getQuery(event).usage
  const allowedUsages = new Set(['albums', 'stories', 'videos', 'banners', 'about'])
  const usage = typeof usageParam === 'string' && allowedUsages.has(usageParam)
    ? usageParam
    : 'albums'
  const baseName = file.filename
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'image'
  const date = new Date()
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${baseName}.${extension}`
  const requestedCloudPath = getQuery(event).cloudPath
  const cloudPath = typeof requestedCloudPath === 'string'
    && /^keepsake\/(albums|journeys|stories|videos|banner|about)\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(requestedCloudPath)
    ? requestedCloudPath
    : `keepsake/cms/${usage}/${year}/${month}/${uniqueName}`
  const upload = new File([new Uint8Array(file.data)], `${baseName}.${extension}`, {
    type: file.type || `image/${extension}`,
  })
  const cloud = requireUniCloudClient() as unknown as {
    uploadFile: (options: {
      filePath: File
      cloudPath: string
      fileType: string
    }) => Promise<{ fileID: string }>
  }
  const result = await cloud.uploadFile({
    filePath: upload,
    cloudPath,
    fileType: 'image',
  })

  return {
    url: result.fileID,
    fileID: result.fileID,
    key: cloudPath,
    filename: `${baseName}.${extension}`,
  }
})

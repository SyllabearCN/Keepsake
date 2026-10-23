export function cmsThumbnail(url: string | undefined, width = 480) {
  if (!url || !/^https?:\/\//i.test(url) || url.includes('x-oss-process='))
    return url || ''

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('.cdn.bspapp.com'))
      return url
  }
  catch {
    return url
  }

  const safeWidth = Math.min(1600, Math.max(64, Math.round(width)))
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}x-oss-process=image/format,webp/resize,w_${safeWidth}`
}

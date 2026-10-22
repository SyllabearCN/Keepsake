import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const dbInitPath = join(root, 'uniCloud-aliyun', 'database', 'db_init.json')
const manifest = JSON.parse(
  await readFile(join(root, '.generated', 'unicloud', 'upload-manifest.json'), 'utf8'),
)
const state = JSON.parse(
  await readFile(join(root, '.generated', 'unicloud', 'upload-state.json'), 'utf8'),
)
const dbInit = JSON.parse(await readFile(dbInitPath, 'utf8'))

const keyByUrl = new Map(
  manifest.entries.map(entry => [
    `${manifest.cdnBase}/${entry.key.split('/').map(encodeURIComponent).join('/')}`,
    entry.key,
  ]),
)

let missing = 0
function uploadedUrl(originalUrl) {
  const key = keyByUrl.get(originalUrl)
  const uploaded = key ? state.files[key]?.url : null
  if (!uploaded)
    missing++
  return uploaded || originalUrl
}

for (const album of dbInit.keepsake_albums.data) {
  album.cover = uploadedUrl(album.cover)
  album.list = album.list.map(uploadedUrl)
  album.photos = album.photos.map(photo => ({
    ...photo,
    url: uploadedUrl(photo.url),
  }))
}

for (const banner of dbInit.keepsake_banners.data) {
  banner.image_url = uploadedUrl(banner.image_url)
}

for (const video of dbInit.keepsake_videos.data)
  video.cover_url = uploadedUrl(video.cover_url)

for (const story of dbInit.keepsake_stories.data)
  story.cover_url = uploadedUrl(story.cover_url)

if (missing)
  throw new Error(`有 ${missing} 个数据库图片字段还没有上传结果，请先完成上传。`)

await writeFile(dbInitPath, `${JSON.stringify(dbInit, null, 2)}\n`, 'utf8')
console.log(`已将 ${manifest.entries.length} 个文件的实际 CDN 地址写回数据库种子。`)

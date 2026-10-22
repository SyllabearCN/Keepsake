import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dbInit = JSON.parse(
  await readFile(join(process.cwd(), 'uniCloud-aliyun', 'database', 'db_init.json'), 'utf8'),
)

const snapshot = {
  generatedAt: new Date().toISOString(),
  albums: dbInit.keepsake_albums.data,
  videos: dbInit.keepsake_videos.data,
  stories: dbInit.keepsake_stories.data,
  banners: dbInit.keepsake_banners.data,
}

await mkdir(join(process.cwd(), 'server', 'data'), { recursive: true })
await writeFile(
  join(process.cwd(), 'server', 'data', 'unicloud-snapshot.json'),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  'utf8',
)

console.log(JSON.stringify({
  albums: snapshot.albums.length,
  videos: snapshot.videos.length,
  stories: snapshot.stories.length,
  banners: snapshot.banners.length,
}))

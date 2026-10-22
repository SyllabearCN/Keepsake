import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import sharp from 'sharp'

const manifest = JSON.parse(
  await readFile(join(process.cwd(), '.generated', 'unicloud', 'upload-manifest.json'), 'utf8'),
)
const outputRoot = join(process.cwd(), '.generated', 'unicloud', 'web')
const concurrency = Math.max(1, Math.min(6, Number(process.env.KEEPSAKE_IMAGE_CONCURRENCY) || 4))
let cursor = 0
let completed = 0
let skipped = 0
const outputEntries = []

async function worker() {
  while (true) {
    const index = cursor++
    if (index >= manifest.entries.length)
      return

    const entry = manifest.entries[index]
    const key = entry.key.replace(/\.[^.]+$/, '.webp')
    const sourcePath = join(outputRoot, ...key.split('/'))
    await mkdir(dirname(sourcePath), { recursive: true })

    try {
      const sourceStat = await stat(entry.sourcePath)
      let outputStat
      try {
        outputStat = await stat(sourcePath)
      }
      catch {
        // Generate the derivative when it does not exist yet.
      }
      if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
        skipped++
      }
      else {
        await sharp(entry.sourcePath)
          .rotate()
          .resize({
            width: 2000,
            height: 2000,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toFile(sourcePath)
      }
      const outputStatAfter = await stat(sourcePath)
      outputEntries.push({
        sourcePath,
        key,
        originalKey: entry.key,
        size: outputStatAfter.size,
      })
      completed++
    }
    catch (error) {
      console.error(`转换失败 ${entry.key}: ${error?.message || error}`)
    }

    if (completed % 25 === 0 || completed === manifest.entries.length)
      console.log(`图片优化 ${completed}/${manifest.entries.length}，已存在 ${skipped}`)
  }
}

await Promise.all(Array.from({ length: concurrency }, worker))

outputEntries.sort((left, right) => left.key.localeCompare(right.key))
const outputManifest = {
  generatedAt: new Date().toISOString(),
  baseManifest: relative(process.cwd(), join(process.cwd(), '.generated', 'unicloud', 'upload-manifest.json')).replaceAll('\\', '/'),
  entries: outputEntries,
}
await writeFile(
  join(process.cwd(), '.generated', 'unicloud', 'web-upload-manifest.json'),
  `${JSON.stringify(outputManifest, null, 2)}\n`,
  'utf8',
)

if (outputEntries.length !== manifest.entries.length)
  throw new Error(`只生成了 ${outputEntries.length}/${manifest.entries.length} 个网页版图片`)

console.log(`图片优化完成：${outputEntries.length} 个。`)

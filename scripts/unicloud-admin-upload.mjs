import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const spaceId = 'mp-174d4239-a43e-4e0a-9fdc-92547241a10b'
const cdnBase = 'https://mp-174d4239-a43e-4e0a-9fdc-92547241a10b.cdn.bspapp.com'
const manifestName = process.env.UNICLOUD_UPLOAD_MANIFEST || 'upload-manifest.json'
const stateName = process.env.UNICLOUD_UPLOAD_STATE || 'upload-state.json'
const manifestPath = join(process.cwd(), '.generated', 'unicloud', manifestName)
const statePath = join(process.cwd(), '.generated', 'unicloud', stateName)
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const requestedLimit = Math.max(0, Number(process.env.UNICLOUD_UPLOAD_LIMIT) || 0)
const requestedPrefix = process.env.UNICLOUD_UPLOAD_PREFIX || ''
const filteredEntries = requestedPrefix
  ? manifest.entries.filter(entry => entry.key.startsWith(requestedPrefix))
  : manifest.entries
const entries = requestedLimit ? filteredEntries.slice(0, requestedLimit) : filteredEntries
const concurrency = Math.max(1, Math.min(4, Number(process.env.UNICLOUD_UPLOAD_CONCURRENCY) || 2))
const maxRetries = Math.max(1, Math.min(5, Number(process.env.UNICLOUD_UPLOAD_RETRIES) || 3))

let state = { files: {} }
try {
  state = JSON.parse(await readFile(statePath, 'utf8'))
}
catch {
  state = { files: {} }
}

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  userDataDir: join(process.cwd(), '.generated', 'chrome-session'),
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--disable-background-networking'],
})

let cursor = 0
let completed = 0
let failed = 0

async function saveState() {
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

try {
  const page = await browser.newPage()
  await page.goto(
    `https://unicloud.dcloud.net.cn/pages/overview/overview?pageid=${spaceId}`,
    { waitUntil: 'networkidle2', timeout: 90_000 },
  )
  await new Promise(resolve => setTimeout(resolve, 1800))

  async function uploadEntry(entry) {
    let lastError
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const uploadInfoResponse = await page.evaluate(async ({ spaceId, entry }) => {
          const token = localStorage.getItem('uni_id_token')
          return window.uniCloud.callFunction({
            name: 'uni-cloud-kernel',
            data: {
              action: 'proxy/invoke',
              data: {
                method: 'get',
                token,
                action: 'file/upload-info',
                params: {
                  provider: 'aliyun',
                  spaceId,
                  name: entry.name,
                  size: entry.size,
                  folder: entry.folder,
                },
              },
            },
          })
        }, {
          spaceId,
          entry: {
            name: basename(entry.key),
            size: entry.size,
            folder: `${dirname(entry.key).replaceAll('\\', '/')}/`,
          },
        })

        const payload = uploadInfoResponse?.result?.data
        if (payload?.ret !== 0 || !payload?.data?.SignUrl)
          throw new Error(`获取上传签名失败：${payload?.desc || payload?.ret || 'unknown'}`)

        const info = payload.data
        if (info.Overwrite)
          throw new Error('云端已存在同名文件，脚本已停止以避免覆盖')

        const callback = {
          callbackUrl: info.OssCallbackUrl,
          callbackBody: JSON.stringify({ fileId: info.Id, spaceId }),
          callbackBodyType: 'application/json',
        }
        const response = await fetch(info.SignUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-oss-callback': Buffer.from(JSON.stringify(callback)).toString('base64'),
          },
          body: await readFile(entry.sourcePath),
        })
        if (response.status >= 400)
          throw new Error(`OSS 上传失败：HTTP ${response.status}`)

        const finalUrl = `${cdnBase}/${entry.key.split('/').map(encodeURIComponent).join('/')}`
        state.files[entry.key] = {
          sourcePath: entry.sourcePath,
          size: entry.size,
          url: finalUrl,
          fileId: info.Id,
          uploadedAt: new Date().toISOString(),
        }
        await saveState()
        return
      }
      catch (error) {
        lastError = error
        if (attempt < maxRetries)
          await new Promise(resolve => setTimeout(resolve, attempt * 1200))
      }
    }
    throw lastError
  }

  async function worker() {
    while (true) {
      const index = cursor++
      if (index >= entries.length)
        return
      const entry = entries[index]
      if (state.files[entry.key]?.size === entry.size) {
        completed++
        continue
      }

      try {
        await uploadEntry(entry)
        completed++
      }
      catch (error) {
        failed++
        console.error(`上传失败 ${entry.key}: ${error?.message || error}`)
      }

      if ((completed + failed) % 10 === 0 || completed + failed === entries.length)
        console.log(`进度 ${completed + failed}/${entries.length}，成功 ${completed}，失败 ${failed}`)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  await saveState()
}
finally {
  await browser.close()
}

if (failed)
  throw new Error(`有 ${failed} 个文件上传失败，重新执行可续传`)

console.log(`上传完成：${completed} 个文件。`)

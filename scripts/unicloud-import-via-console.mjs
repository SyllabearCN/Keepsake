import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const spaceId = 'mp-174d4239-a43e-4e0a-9fdc-92547241a10b'
const dbInit = JSON.parse(
  await readFile(join(process.cwd(), 'uniCloud-aliyun', 'database', 'db_init.json'), 'utf8'),
)
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  userDataDir: join(process.cwd(), '.generated', 'chrome-session'),
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--disable-background-networking'],
})

try {
  const page = await browser.newPage()
  await page.goto(
    `https://unicloud.dcloud.net.cn/pages/overview/overview?pageid=${spaceId}`,
    { waitUntil: 'networkidle2', timeout: 90_000 },
  )
  await new Promise(resolve => setTimeout(resolve, 1800))

  const result = await page.evaluate(async ({ spaceId, dbInit }) => {
    const token = localStorage.getItem('uni_id_token')

    async function invoke(action, params) {
      const response = await window.uniCloud.callFunction({
        name: 'uni-cloud-kernel',
        data: {
          action: 'proxy/invoke',
          data: {
            method: 'post',
            token,
            action,
            params,
          },
        },
      })
      const payload = response?.result?.data
      if (payload?.ret !== 0)
        throw new Error(`${action}: ${payload?.desc || 'unknown error'}`)
      return payload.data
    }

    const output = []
    for (const [collection, definition] of Object.entries(dbInit)) {
      const existing = await invoke('database/find', {
        provider: 'aliyun',
        spaceId,
        collection,
        filter: '',
        pageSize: 1000,
        page: 1,
        apiTimeout: 30000,
      })
      const ids = new Set((existing?.data || []).map(document => document._id))
      let inserted = 0
      for (const document of definition.data) {
        if (ids.has(document._id))
          continue
        await invoke('database/insert', {
          provider: 'aliyun',
          spaceId,
          collection,
          doc: JSON.stringify(document),
        })
        inserted++
      }

      const verified = await invoke('database/find', {
        provider: 'aliyun',
        spaceId,
        collection,
        filter: '',
        pageSize: 1000,
        page: 1,
        apiTimeout: 30000,
      })
      output.push({
        collection,
        expected: definition.data.length,
        inserted,
        actual: verified?.data?.length || 0,
      })
    }
    return output
  }, { spaceId, dbInit })

  console.log(JSON.stringify(result, null, 2))
  if (result.some(item => item.actual !== item.expected))
    throw new Error('数据库记录数量校验失败')
}
finally {
  await browser.close()
}

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const spaceId = 'mp-174d4239-a43e-4e0a-9fdc-92547241a10b'
const manifest = JSON.parse(
  await readFile(join(process.cwd(), '.generated', 'unicloud', 'upload-manifest.json'), 'utf8'),
)
const directories = [...new Set(
  manifest.entries
    .map(entry => `${dirname(entry.key).replaceAll('\\', '/')}/`)
    .filter(folder => folder.startsWith('keepsake/') && folder !== 'keepsake/'),
)].sort((left, right) => left.split('/').length - right.split('/').length || left.localeCompare(right))

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

  const results = await page.evaluate(async ({ spaceId, directories }) => {
    const token = localStorage.getItem('uni_id_token')
    const output = []
    for (const folder of directories) {
      const response = await window.uniCloud.callFunction({
        name: 'uni-cloud-kernel',
        data: {
          action: 'proxy/invoke',
          data: {
            method: 'post',
            token,
            action: 'file/create-directory',
            params: {
              provider: 'aliyun',
              spaceId,
              folder: folder.replace(/\/$/, ''),
              acl: '',
            },
          },
        },
      })
      output.push({
        folder,
        ret: response?.result?.data?.ret,
        desc: response?.result?.data?.desc,
      })
    }
    return output
  }, { spaceId, directories })

  console.log(JSON.stringify(results, null, 2))
  if (results.some(result => result.ret !== 0 && !/exist|存在/i.test(result.desc || '')))
    throw new Error('部分目录创建失败')
}
finally {
  await browser.close()
}

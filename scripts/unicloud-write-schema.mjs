import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const table = process.argv[2]
if (!table)
  throw new Error('Usage: node scripts/unicloud-write-schema.mjs <table>')

const schema = await readFile(
  join(process.cwd(), 'uniCloud-aliyun', 'database', `${table}.schema.json`),
  'utf8',
)
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  userDataDir: join(process.cwd(), '.generated', 'chrome-session'),
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--disable-background-networking'],
})

async function clickLeafText(page, text) {
  const elements = await page.$$('a,button,span,div')
  for (const element of elements.reverse()) {
    const matches = await element.evaluate((node, expected) => (
      node.childElementCount === 0 && node.textContent?.trim() === expected
    ), text).catch(() => false)
    if (matches) {
      await element.click()
      return true
    }
  }
  return false
}

async function openDatabase(page) {
  await page.goto('https://unicloud.dcloud.net.cn/', {
    waitUntil: 'networkidle2',
    timeout: 90_000,
  })
  await page.waitForFunction(() => document.body.innerText.includes('albums'), { timeout: 30_000 })
  if (!await clickLeafText(page, 'albums'))
    throw new Error('未找到 albums 服务空间入口')
  await page.waitForFunction(() => document.body.innerText.includes('基本信息（albums）'), { timeout: 30_000 })

  for (const element of await page.$$('.uni-sub-menu__title')) {
    const text = await element.evaluate(node => node.textContent?.trim()).catch(() => '')
    if (text.includes('云数据库')) {
      await element.click()
      break
    }
  }
  await new Promise(resolve => setTimeout(resolve, 800))

  for (const element of await page.$$('.uni-menu-item')) {
    const text = await element.evaluate(node => node.textContent?.trim()).catch(() => '')
    if (text === '云数据库') {
      await element.click()
      break
    }
  }
  await page.waitForFunction(() => document.body.innerText.includes('数据表（'), { timeout: 30_000 })
}

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
  await openDatabase(page)

  let selected = false
  for (const element of await page.$$('*')) {
    const matches = await element.evaluate((node, expected) => (
      node.childElementCount === 0 && node.textContent?.trim() === expected
    ), table).catch(() => false)
    if (matches) {
      const parent = await element.evaluateHandle(node => node.closest('.uni-menu-item') || node.parentElement)
      await parent.asElement().click()
      selected = true
      break
    }
  }
  if (!selected)
    throw new Error(`未找到数据表 ${table}`)
  await new Promise(resolve => setTimeout(resolve, 1500))

  for (const element of await page.$$('.el-tabs__item')) {
    const text = await element.evaluate(node => node.textContent?.trim()).catch(() => '')
    if (text === '表结构') {
      await element.click()
      break
    }
  }
  await new Promise(resolve => setTimeout(resolve, 1000))
  await page.mouse.click(550, 151)
  await new Promise(resolve => setTimeout(resolve, 600))
  const modelUpdated = await page.evaluate((nextSchema) => {
    const model = window.monaco?.editor?.getModels?.().find(candidate => (
      candidate.getValue().includes('"bsonType"')
    ))
    if (!model)
      return false
    model.setValue(nextSchema.trim())
    return true
  }, schema)
  if (!modelUpdated)
    throw new Error('未找到可编辑的 Schema 区域')
  await new Promise(resolve => setTimeout(resolve, 800))
  const pageText = await page.evaluate(() => document.body.innerText)
  if (pageText.includes('您输入的JSON格式有误'))
    throw new Error('Schema 编辑器仍报告 JSON 格式错误，已停止保存')
  await page.mouse.click(550, 151)
  await new Promise(resolve => setTimeout(resolve, 1800))

  const state = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 2500),
    dialogs: [...document.querySelectorAll('[role="dialog"],.el-dialog')]
      .map(node => node.textContent?.trim())
      .filter(Boolean),
  }))
  await page.screenshot({
    path: join(process.cwd(), '.generated', 'unicloud', `schema-${table}.png`),
    fullPage: false,
  })
  console.log(JSON.stringify(state, null, 2))
}
finally {
  await browser.close()
}

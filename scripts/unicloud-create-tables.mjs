import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

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

  const submenuTitles = await page.$$('.uni-sub-menu__title')
  for (const element of submenuTitles) {
    const text = await element.evaluate(node => node.textContent?.trim()).catch(() => '')
    if (text.includes('云数据库')) {
      await element.click()
      break
    }
  }
  await new Promise(resolve => setTimeout(resolve, 800))

  const menuItems = await page.$$('.uni-menu-item')
  for (const element of menuItems) {
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
  await page.mouse.click(434, 101)
  await new Promise(resolve => setTimeout(resolve, 1000))

  const state = await page.evaluate(() => ({
    text: document.body.innerText.slice(0, 5000),
    inputs: [...document.querySelectorAll('input')].map(input => ({
      placeholder: input.placeholder,
      value: input.value,
      type: input.type,
    })),
    buttons: [...document.querySelectorAll('button')]
      .map(button => button.innerText.trim())
      .filter(Boolean),
  }))
  await page.screenshot({
    path: join(process.cwd(), '.generated', 'unicloud', 'db-add-dialog.png'),
    fullPage: false,
  })
  console.log(JSON.stringify(state, null, 2))
}
finally {
  await browser.close()
}

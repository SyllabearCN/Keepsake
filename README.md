# Keepsake · 我们仨

一个面向一家三口的家庭记忆站模板。首页、相册、Bilibili 旅行 Vlog、文章和关于页面都已完成，并带有移动端导航、亮暗主题、中英切换和 PWA 支持。

## 开始运行

项目需要 Node.js 24 LTS 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

常用命令：

```bash
npm run dev        # 本地开发
npm run generate   # 导出纯静态网站到 .output/public
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查
npm run typecheck  # Vue/TypeScript 类型检查
npm test           # 内容数据测试
```

## 怎么替换内容

### 相册

1. 在 `public/albums` 下新建旅行或年份文件夹，例如 `public/albums/2027-spring`。
2. 把照片放进去。
3. 在 `app/data/albums.ts` 的 `gallery` 数组中登记照片路径、标题和说明。
4. 如果新增了筛选分类，同时在 `albums` 数组里添加相册名称。

详细字段示例见 `public/albums/README.txt`。

### Bilibili 视频

打开 `app/data/journeys.ts`，把示例中的 `bvid` 换成真实视频编号。例如视频链接是：

```text
https://www.bilibili.com/video/BV1xxxxxxxxx
```

那么只填写 `BV1xxxxxxxxx`。封面图需要放在本地，并在 `cover` 字段中填写路径。

### 文章

在 `content/stories` 新建 Markdown 文件。文件名会成为文章地址：

```text
content/stories/summer-2027.md -> /stories/summer-2027
```

文章开头需要保留 frontmatter：

```yaml
---
title: 文章标题
description: 列表页显示的摘要
date: "2027-07-18"
category: 旅行手记
cover: /albums/2027-spring/cover.jpg
location: 杭州
readingTime: 4
---
```

正文直接使用 Markdown 编写。

### 文案与语言

界面文案位于：

- `i18n/locales/zh-CN.json`
- `i18n/locales/en.json`

相册和视频名称使用 `{ zh: "...", en: "..." }` 的格式。文章目前作为家庭中文记录保存，不经过自动翻译。

### 颜色与主题

全局颜色、字体、卡片、暗色模式和正文排版集中在 `app/assets/css/main.css`。主要颜色使用 CSS 变量，修改 `:root` 和 `[data-theme="dark"]` 即可整体换肤。

## 目录结构

```text
app/
├─ assets/css/        主题变量与全局样式
├─ components/        页面组件和交互组件
├─ data/              相册与视频索引
├─ pages/             首页、相册、影像、文章、关于
├─ plugins/           主题与收藏初始化
├─ stores/            Pinia 偏好设置
└─ types/             数据类型
content/stories/      Markdown 文章
i18n/locales/         中英文界面文案
public/albums/        本地相册图片
public/icons/         PWA 与站点图标
```

## 技术栈

- Nuxt 4 + Vue 3 Composition API + TypeScript
- Tailwind CSS 4 + CSS 变量
- Reka UI：无障碍移动菜单与弹窗
- Motion for Vue：首页进场动画
- Nuxt Content：Markdown 文章
- Nuxt i18n：中英切换
- Pinia：主题、筛选和收藏状态
- Nuxt Image：响应式图片
- Vite PWA：离线缓存与安装支持

## 部署

不需要购买服务器。运行：

```bash
npm run generate
```

把 `.output/public` 整个目录上传到任意静态托管即可，例如 Cloudflare Pages、Netlify 或 GitHub Pages。图片、文章与视频索引都会被静态导出。

如果使用 GitHub Pages 的项目子路径，需要额外设置 Nuxt 的 `app.baseURL`；使用自定义根域名或 Cloudflare Pages、Netlify 时通常不用改。

## 演示素材说明

当前封面是用于排版演示的 Unsplash 图片，不是真实家庭照片。正式发布前请替换为你的照片，并检查你选择的图片授权。页面版式参考了用户提供的网站风格，但品牌、文案、组件与视觉均由本项目独立实现。

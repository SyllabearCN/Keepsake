# Keepsake · 我们仨

Keepsake 是一个面向一家三口的家庭记忆网站模板，用来长期保存旅行照片、生活视频、文章和那些值得被记住的普通日子。

项目采用 **Nuxt 4 + Vue 3 + TypeScript** 构建，内容以本地文件和 Markdown 为主，不需要数据库即可运行。网站最终可以导出为纯静态资源，部署到 EdgeOne Pages、Vercel、Cloudflare Pages 或其他静态托管平台。

> 当前相册、文章和视频均为演示内容。正式使用时，请替换为你的家庭照片、Bilibili 视频和原创文字。

## 项目特点

- 完整的家庭内容结构：首页、相册、旅行影像、文章和关于页面
- 以照片和旅行记录为核心的品牌化视觉设计
- 适配桌面、平板和手机的响应式布局
- 相册按旅行或年份分类，支持灯箱预览和本地收藏
- Bilibili Vlog 使用官方播放器内嵌，不需要自行存储视频
- 文章使用 Markdown 管理，自动生成列表页和详情页
- 中文和英文界面切换
- 亮色与暗色主题，并记住用户偏好
- PWA 支持，可安装到桌面并缓存静态资源
- 本地图片资源，不依赖外部图床
- 内容、数据和页面组件分离，便于持续修改

## 页面与应用结构

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 品牌主视觉、相册精选、旅行视频和最新文章 |
| 相册 | `/gallery` | 按旅行分类浏览照片、查看灯箱和收藏照片 |
| 旅行影像 | `/journeys` | Bilibili Vlog 列表和视频播放弹窗 |
| 文字记录 | `/stories` | Markdown 文章列表 |
| 文章详情 | `/stories/[slug]` | 根据 Markdown 文件名生成详情页 |
| 关于我们 | `/about` | 家庭介绍、时间线和项目说明 |

网站当前是“前端静态内容站”：

- 主题、筛选和收藏等在浏览器本地运行
- 不包含用户登录、后台管理或在线照片上传
- 不依赖数据库和业务服务器
- 内容更新后重新构建并部署即可

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Nuxt 4 | 页面路由、SSR/静态生成、SEO 和构建流程 |
| Vue 3 | Composition API 和 `<script setup>` |
| TypeScript | 内容类型、组件数据与构建期校验 |
| Tailwind CSS 4 | 页面布局、响应式工具和视觉样式 |
| CSS Variables | 亮暗主题、语义化颜色和品牌视觉 |
| Reka UI | 无障碍移动菜单、相册灯箱和视频弹窗 |
| Motion for Vue | 首页标题和视觉区域的进场动画 |
| Nuxt Content | Markdown 文章解析与静态内容查询 |
| Nuxt i18n | 中英文界面切换 |
| Pinia | 主题、相册筛选和收藏状态 |
| Nuxt Image | 本地图片加载、尺寸控制和静态图片优化 |
| Vite PWA | Service Worker、离线缓存和安装支持 |
| Vitest | 内容数据完整性测试 |
| ESLint + vue-tsc | 代码规范和 TypeScript 类型检查 |

## 环境要求

推荐使用 **Node.js 22.21.1**。项目在 `.nvmrc` 和 `package.json` 中限制了兼容版本，避免部署平台自动切换到不兼容的 Node.js。

```text
Node.js >= 22
npm >= 10
```

如果使用 nvm、fnm 或其他版本管理器：

```bash
nvm use
```

## 本地开发

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

项目默认不需要任何环境变量。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建 Nuxt 生产版本 |
| `npm run generate` | 导出纯静态网站到 `.output/public` |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 执行 ESLint 检查 |
| `npm run typecheck` | 执行 Vue/TypeScript 类型检查 |
| `npm test` | 运行内容索引测试 |

推荐提交前执行：

```bash
npm run lint
npm run typecheck
npm test
npm run generate
```

## 目录结构

```text
Keepsake/
├─ app/
│  ├─ assets/css/
│  │  └─ main.css              # 主题变量、全局样式和正文排版
│  ├─ components/              # 页面组件与交互组件
│  ├─ composables/
│  │  └─ useLocalizedText.ts   # 中英文字段读取
│  ├─ data/
│  │  ├─ albums.ts             # 相册分类与照片索引
│  │  └─ journeys.ts           # Bilibili 视频索引
│  ├─ pages/                   # 首页、相册、视频、文章和关于页面
│  ├─ plugins/                 # 客户端偏好设置初始化
│  ├─ stores/                  # Pinia 状态
│  ├─ types/                   # 内容类型定义
│  ├─ app.vue                  # 全局页面框架
│  └─ error.vue                # 自定义错误页
├─ content/
│  └─ stories/                 # Markdown 文章
├─ content.config.ts           # Nuxt Content 集合与字段校验
├─ i18n/locales/               # 中英文界面文案
├─ public/
│  ├─ albums/                  # 本地相册图片
│  └─ icons/                   # 站点图标与 PWA 图标
├─ tests/                      # 内容数据测试
├─ nuxt.config.ts              # Nuxt、i18n、图片和 PWA 配置
├─ package.json
└─ package-lock.json
```

## 维护相册

### 添加照片

1. 在 `public/albums` 下新建旅行或年份目录，例如：

```text
public/albums/2027-spring/
```

2. 将照片放入目录。
3. 在 `app/data/albums.ts` 的 `gallery` 数组中添加记录。

示例：

```ts
{
  id: 'spring-rain',
  src: '/albums/2027-spring/spring-rain.webp',
  alt: '雨后的山间小路',
  title: {
    zh: '春天下过雨',
    en: 'After the rain',
  },
  caption: {
    zh: '雨停以后，我们沿着山路走得很慢。',
    en: 'After the rain stopped, we took the mountain path slowly.',
  },
  date: '2027-04-08',
  location: {
    zh: '杭州',
    en: 'Hangzhou',
  },
  album: '2027-spring',
  width: 1600,
  height: 1200,
}
```

### 添加相册分类

在 `app/data/albums.ts` 的 `albums` 数组中添加分类：

```ts
{
  id: '2027-spring',
  label: {
    zh: '2027 春日',
    en: 'Spring 2027',
  },
  description: {
    zh: '春天里的一些小事。',
    en: 'A few small moments from spring.',
  },
}
```

`photo.album` 必须与某个 `album.id` 对应，否则测试会失败。

### 图片建议

为了兼顾移动网络和清晰度，建议：

- 使用 WebP 或 AVIF 格式
- 首页大图约 `1920 × 1280`
- 横向照片约 `2000 × 1333` 或 `1600 × 1200`
- 纵向照片约 `1200 × 1600`
- 单张图片尽量控制在 `200–500 KB`
- 文件名使用英文、数字和连字符
- `width` 和 `height` 必须填写图片的真实比例

如果希望保留原始高清照片，可以将其放在项目外的备份目录，只把优化后的 WebP 图片放入 `public/albums`。浏览器端网站无法直接读取项目外的任意本地文件夹。

## 添加 Bilibili 视频

编辑 `app/data/journeys.ts`。

Bilibili 视频链接通常类似：

```text
https://www.bilibili.com/video/BV1xxxxxxxxx
```

在数据中只填写 BV 号：

```ts
{
  id: 'summer-2027',
  bvid: 'BV1xxxxxxxxx',
  title: {
    zh: '去山里住两天',
    en: 'Two days in the mountains',
  },
  description: {
    zh: '一次很慢的周末旅行。',
    en: 'A very slow weekend trip.',
  },
  location: {
    zh: '安吉',
    en: 'Anji',
  },
  date: '2027-05-18',
  duration: '08:42',
  cover: '/albums/2027-spring/mountain.webp',
  featured: true,
}
```

说明：

- `cover` 需要是本地图片路径
- `featured: true` 会让视频出现在首页精选区
- 播放依赖 Bilibili 官方 iframe，可能受网络或企业访问策略影响
- 当前示例 BV 号只是占位值，正式发布前必须替换

## 发布文章

在 `content/stories` 中新建 Markdown 文件：

```text
content/stories/summer-2027.md
```

文件地址会自动对应：

```text
/stories/summer-2027
```

文章开头必须包含 frontmatter：

```yaml
---
title: 把夏天开到海边
description: 一次没有排满行程的旅行。
date: "2027-07-18"
category: 旅行手记
cover: /albums/2027-spring/summer.webp
location: 厦门
readingTime: 5
---
```

正文使用 Markdown：

```md
## 第一天

我们从清晨出发。

> 旅行里最值得留下的，往往是一起度过的普通时刻。
```

字段要求：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `description` | 是 | 列表页摘要和 SEO 描述 |
| `date` | 是 | 建议使用 `YYYY-MM-DD` |
| `category` | 是 | 文章分类 |
| `cover` | 是 | 本地封面图路径 |
| `location` | 否 | 旅行地点 |
| `readingTime` | 否 | 预计阅读分钟数 |

## 修改界面文案和语言

界面文案位于：

```text
i18n/locales/zh-CN.json
i18n/locales/en.json
```

相册和视频内容使用双语字段：

```ts
title: {
  zh: '中文标题',
  en: 'English title',
}
```

目前文章正文只保留家庭原始语言，不进行自动翻译。这样可以避免翻译破坏语气和私人表达。

## 自定义视觉

主题变量集中在：

```text
app/assets/css/main.css
```

主要修改位置：

- `:root`：亮色主题
- `[data-theme="dark"]`：暗色主题
- `.display`：标题字体
- `.prose-keepsake`：文章正文排版
- `.page-shell`：页面最大宽度
- `.surface-card`、`.glass`：卡片和玻璃效果

站点名称、描述、PWA 配置和 SEO 信息位于 `nuxt.config.ts`。

## 部署到 EdgeOne Pages

推荐将项目作为纯静态网站部署。

EdgeOne 项目设置：

```text
Repository: SyllabearCN/Keepsake
Branch: main
Node.js Version: 22.21.1
Install Command: npm ci
Build Command: npm run generate
Output Directory: .output/public
```

部署流程：

1. 将最新代码推送到 GitHub `main` 分支。
2. EdgeOne 拉取仓库并执行 `npm ci`。
3. 执行 `npm run generate`。
4. 将 `.output/public` 发布到边缘节点。

### EdgeOne 常见问题

如果出现：

```text
Switching error: Failed to switch to Node.js ...
```

先检查项目根目录的 `.nvmrc`。项目现在固定为：

```text
22.21.1
```

同时在 EdgeOne 项目设置中选择 `Node.js Version: 22.21.1`。

如果只看到依赖安装失败，应确认它发生在 Node 版本切换成功之后。版本切换失败时，安装命令根本没有开始执行。

## 部署到 Vercel

Vercel 可以直接识别 Nuxt 项目：

```text
Install Command: npm ci
Build Command: nuxt build
Output Directory: 自动识别
```

Vercel 的默认部署保护可能要求访问者登录 Vercel。要让家人直接访问，可以选择：

- 关闭 SSO Deployment Protection，使站点公开
- 邀请家人的 Vercel 账号加入项目
- 改用支持免费访问控制的平台

不要通过公开链接中的随机字符串来保护私人照片。

## 部署到 Cloudflare Pages

也可以使用纯静态导出：

```bash
npm run generate
```

上传 `.output/public` 或连接 GitHub 仓库进行构建。

如果需要家庭私有访问，可在 Cloudflare Access 中限制允许访问的邮箱。Cloudflare Pages 的 `pages.dev` 域名也可以配置 Access，但必须确认正式域名和预览域名都已有对应策略。

## 隐私与访问控制

家庭照片属于私人内容。部署前应明确以下几点：

- 默认部署是公开站点
- 隐藏链接不等于访问控制
- 搜索引擎可能收录公开页面
- PWA 在浏览器启用 Service Worker 后会缓存部分静态资源
- Bilibili iframe 是第三方服务，不使用站点自己的访问控制

如果网站需要真正私有：

- 使用 Cloudflare Access 做邮箱验证
- 或使用 Tailscale 让网站只在私人网络内可访问
- 共用电脑上建议关闭 PWA 缓存，避免离线副本残留

本项目当前不包含登录系统。不要将私人后台管理功能直接建立在前端密码校验上。

## 性能与质量

项目已具备：

- 路由级代码拆分
- 图片懒加载和大图预加载
- 本地响应式图片
- 语义化 HTML
- 键盘可用的弹窗和移动菜单
- `prefers-reduced-motion` 动效降级
- PWA 静态资源缓存
- 内容索引数据测试
- ESLint 和 TypeScript 检查

继续增加大量照片时，建议优先压缩图片，不要把原始相机文件直接放进 `public`。

## 当前限制

- 不包含后台管理和在线内容编辑器
- 不支持访客登录、评论或点赞
- 相册收藏只保存在当前浏览器
- 文章暂不自动翻译
- 视频依赖 Bilibili 外链
- 部署平台可能缓存旧版本，需要重新部署或刷新站点数据

后续可以按实际需要增加：

- 私有访问控制
- Supabase 或 PocketBase 数据库
- 家庭登录和后台管理
- 评论、收藏同步和照片上传
- 自动图片压缩与缩略图工作流

## 素材与版权

当前演示照片来自 Unsplash，仅用于展示版式，不是真实家庭照片。正式发布前请替换为自己的素材，并确认第三方图片、Bilibili 视频和游戏相关内容的使用许可。

页面的视觉表达和组件实现为 Keepsake 项目独立完成。第三方依赖分别遵循其自身开源许可证。

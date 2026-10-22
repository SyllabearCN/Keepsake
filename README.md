# Keepsake · 我们仨

Keepsake 是一个面向一家三口的家庭记忆站，用于长期保存旅行照片、Bilibili 视频、生活文章和家庭日常。

项目以安静的阅读体验、响应式相册和 uniCloud 云端媒体为核心，目前同时支持卡片与时间轴两种浏览方式。

## 核心能力

- 首页展示相册数量、精选相册、旅行影像和最新文章
- 相册采用“全部显示封面、进入后显示照片”的两级浏览
- 相册与文章支持卡片、时间轴两种布局
- 照片与封面由 uniCloud 云存储和 CDN 提供
- Bilibili 官方播放器嵌入，不在项目中存储视频文件
- Markdown 文章系统与中英文界面
- 亮暗主题、移动端导航、PWA 安装和离线缓存
- 相册收藏与浏览偏好保存在浏览器本地

## 架构

```text
Browser
  ↓
Nuxt pages + media API
  ↓
uniCloud database
  ├─ keepsake_albums
  ├─ keepsake_videos
  ├─ keepsake_stories
  └─ keepsake_banners
  ↓
uniCloud cloud storage + CDN
```

前端通过 Nuxt 服务端接口读取云数据库。照片和封面 URL 全部指向 uniCloud CDN；仓库同时保留一份云 URL 快照，数据库短暂不可用时页面也不会退回本地磁盘。

部署时需要在服务端环境变量中配置 `NUXT_UNICLOUD_SPACE_ID`、`NUXT_UNICLOUD_CLIENT_SECRET` 和 `NUXT_UNICLOUD_ENDPOINT`。

## 技术栈

| 技术 | 职责 |
| --- | --- |
| Nuxt 4 | 路由、服务端接口、SSR 和生产构建 |
| Vue 3 | 页面组件与交互状态 |
| TypeScript | 数据类型和编译期检查 |
| Tailwind CSS 4 | 响应式布局与视觉系统 |
| Nuxt Content | Markdown 文章解析 |
| Nuxt i18n | 中文和英文界面切换 |
| Pinia | 主题、收藏和视图偏好 |
| uniCloud | 云数据库、云存储和 CDN |
| Reka UI | 无障碍菜单、灯箱和视频弹窗 |
| Motion for Vue | 首页进场动画 |
| Vite PWA | PWA 安装和资源缓存 |
| Vitest | 媒体规则与内容测试 |

## 媒体与内容模型

- 每本相册有独立的 `keepsake/albums/<slug>/` 云存储目录
- 相册、照片列表、文章、视频索引和 Banner 分别保存在四张 `keepsake_*` 集合
- 首页横幅、视频封面和文章封面使用独立的云存储对象
- Bilibili 视频只保存 BV 编号，视频封面保存在 uniCloud

## 环境

```text
Node.js ^24.15.0
npm >= 10
```

推荐使用 Node.js `24.18.0`。

## 开发

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:3000
```

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vue/TypeScript 检查 |
| `npm test` | 自动化测试 |

## 部署

Nuxt 服务端负责查询 uniCloud 数据库并返回页面数据，云存储提供图片和 CDN 访问。将以下变量配置到部署平台：

```text
NUXT_UNICLOUD_SPACE_ID
NUXT_UNICLOUD_CLIENT_SECRET
NUXT_UNICLOUD_ENDPOINT
```

不要把 ClientSecret 提交进 Git。仓库内的 `.env.local` 已被忽略。

## 安全要求

- 不通过隐藏链接保护家庭照片
- 数据库与对象存储密钥不得进入浏览器
- 媒体访问必须经过服务端鉴权或短时效签名
- ClientSecret 仅保存在部署平台的服务端环境变量中
- 共用设备上谨慎使用 PWA 离线缓存
- 原图、数据库和配置需要独立备份

## 质量状态

已配置并通过：

- ESLint
- Vue 与 TypeScript 类型检查
- 相册命名规则测试
- Bilibili 视频信息检查
- Nuxt 生产构建

## 演进重点

下一阶段优先建设稳定数据层和媒体服务，而不是继续增加页面数量。核心目标是让照片、文章、视频和访问权限具备长期、可迁移、可维护的数据基础。

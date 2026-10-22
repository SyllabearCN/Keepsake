# Keepsake uniCloud 数据结构

数据库集合统一使用 `keepsake_` 前缀：

| 集合 | 用途 | 关键字段 |
| --- | --- | --- |
| `keepsake_albums` | 相册及照片 URL | `title`、`date`、`cover`、`list`、`photos` |
| `keepsake_videos` | Bilibili 影像索引 | `bvid`、`cover_url`、`title`、`date` |
| `keepsake_stories` | Markdown 文本故事 | `slug`、`title`、`content_markdown`、`cover_url` |
| `keepsake_banners` | 首页横幅和关于页固定图片 | `usage`、`image_url`、`storage_key` |

`list` 保存完整的云存储 CDN 地址数组，网页可以直接按相册读取，不需要再拼接本地文件路径。

照片对象键遵循以下规则：

```text
keepsake/albums/<album-slug>/<001>.jpg
keepsake/banners/<hero-file>.jpg
keepsake/about/<001>.jpg
keepsake/journeys/<cover-01>.jpg
keepsake/stories/<YYYY-MM-DD>.jpg
```

生成数据：

```bash
node scripts/generate-unicloud-content.mjs
```

生成结果：

- `uniCloud-aliyun/database/db_init.json`
- `.generated/unicloud/upload-manifest.json`

Schema 默认公开读取，写入权限关闭。图片、文章和相册数据应通过管理端或服务端密钥维护。

运行时会优先读取这四张云数据库集合。部署环境没有配置
`NUXT_UNICLOUD_SPACE_ID` / `NUXT_UNICLOUD_CLIENT_SECRET`，或数据库暂时不可用时，
Nuxt 会使用 `server/data/unicloud-snapshot.json` 中已提交的云 URL 快照，因此不会退回本地图片目录。

更新云数据库内容后，请重新生成快照并一起提交：

```bash
npm run unicloud:snapshot
```

照片和所有封面均来自 `cdn.bspapp.com/keepsake/...`。视频正文仍使用 Bilibili 的 `bvid`，
uniCloud 保存其封面和视频索引信息。

---
title: 项目建议：用 MySQL 管好照片、文章和视频
description: 从本地媒体服务升级到数据库驱动的家庭内容系统，包含数据模型、接口、安全与分阶段方案。
date: "2026-10-20"
category: 项目建议
readingTime: 10
---

Keepsake 目前采用轻量方案：照片留在本地，服务端在运行时扫描目录并返回媒体信息，文字内容由代码和 Markdown 维护。

这套方案适合验证产品，但当相册数量、文章数量和访问设备不断增长时，会逐渐遇到新问题：

- 文件夹名称承担了过多业务含义
- 查询和筛选依赖目录扫描
- 文章、相册、视频之间无法建立正式关系
- 访问权限难以细化到相册或家庭成员
- 后台管理、搜索和操作日志缺少数据基础

因此，建议在下一阶段引入 MySQL。重点不是“把文件塞进数据库”，而是把结构化的信息和真实的媒体文件分开管理。

## 核心原则

### 图片文件不直接存入 MySQL

不要把大图保存成数据库中的二进制大字段。数据库更适合保存标题、日期、相册关系、对象存储路径、尺寸、权限和排序信息。

推荐结构：

```text
MySQL：照片元数据 + 业务关系
对象存储 / NAS：照片文件与缩略图
应用服务：鉴权、查询、上传、转换和签名访问
```

数据库中的媒体记录只保存对象键，例如：

```text
albums/2026-hong-kong/001.webp
```

以后从家庭 NAS 迁移到 uniCloud、腾讯云 COS 或阿里云 OSS，不需要修改相册业务数据。

## 建议的数据表

### albums

保存相册本身：

- id
- title
- slug
- taken_at
- published_at
- cover_photo_id
- description
- visibility
- sort_order
- created_at
- updated_at

### photos

保存每张照片的信息：

- id
- album_id
- storage_key
- thumbnail_key
- filename
- width
- height
- mime_type
- file_size
- caption
- taken_at
- sort_order
- checksum
- created_at

`checksum` 可以帮助发现重复文件，也方便迁移和备份校验。

### media_assets

如果视频封面、首页横幅和文章封面也需要统一管理，可以使用通用媒体表：

- id
- owner_type
- owner_id
- usage
- storage_key
- width
- height
- alt_text
- sort_order

### articles

文章可以从 Markdown 文件迁移到数据库：

- id
- slug
- title
- summary
- content_markdown
- cover_asset_id
- status
- published_at
- updated_at

如果仍然希望保留版本管理，可以继续把正文保存为 Markdown 文件，只把索引和分类放入 MySQL。

### videos

旅行视频只需保存索引，不需要保存视频文件：

- id
- provider
- provider_video_id
- title
- description
- cover_asset_id
- published_at
- sort_order
- visibility

### users 与 album_access

如果只允许家庭成员访问，建议至少包含：

- users：账号、邮箱、状态
- roles：管理员、家庭成员、访客
- album_access：用户与相册的访问关系

权限应服务端判断，不能依赖前端隐藏按钮。

## 推荐的服务接口

```text
GET    /api/albums
GET    /api/albums/:id
GET    /api/albums/:id/photos
GET    /api/articles
GET    /api/articles/:slug
GET    /api/videos
POST   /api/admin/albums
POST   /api/admin/photos
PATCH  /api/admin/photos/:id
DELETE /api/admin/photos/:id
```

媒体访问建议通过短时效签名 URL，或由服务端完成权限校验后代理返回。不要把数据库账号、对象存储密钥或永久私有地址暴露给浏览器。

## 推荐的上传流程

1. 家庭管理员上传原图。
2. 服务端计算校验值，避免重复文件。
3. 自动读取 EXIF 拍摄时间并校正方向。
4. 生成网页版 WebP 和缩略图。
5. 原图与网页图分别写入存储。
6. MySQL 保存相册关系、尺寸、顺序和对象键。
7. 页面只请求业务接口和受控媒体地址。

## 数据库带来的收益

- 相册、照片、文章和视频可以通过外键稳定关联
- 支持按日期、地点、标签和成员筛选
- 支持真正的分页，而不是一次扫描全部目录
- 支持后台编辑、软删除和操作记录
- 支持多设备和多用户同步
- 更容易接入全文搜索、备份和监控

## 需要接受的成本

MySQL 不是零成本升级。需要承担：

- 数据库服务运行和维护
- 账号、权限和备份策略
- 数据迁移与字段升级
- API 安全、限流和日志
- 图片存储和带宽费用
- 家庭服务器或云服务的持续在线要求

如果仍然只在一台电脑上浏览，当前目录扫描方案已经足够。只有当“远程稳定访问、统一管理、多用户、后台编辑”成为真实需求时，MySQL 才值得引入。

## 分阶段实施方案

### 第一阶段：迁移元数据

先只把相册、照片、文章和视频的结构化信息迁移到 MySQL，图片文件仍然放在原有目录或 NAS。

### 第二阶段：统一媒体服务

将图片转换、权限校验、缩略图和签名访问集中到一个媒体服务，页面不再依赖物理目录。

### 第三阶段：后台管理

增加管理员登录、上传、排序、封面选择、文章编辑和软删除。

### 第四阶段：云端或混合存储

根据访问量和隐私要求，将网页图片同步到对象存储。原图可以继续保留在家庭 NAS，只把适合浏览的 WebP 放上云。

## 最终建议

推荐采用“MySQL + 对象存储/NAS + 独立媒体 API”的混合结构：

- MySQL 负责结构和关系
- NAS 或对象存储负责大文件
- 应用服务负责权限与媒体转换
- Vue 前端只负责浏览和管理交互

这样既能保留家庭照片的私密性，也能获得稳定的远程访问和长期可维护性。

<script setup lang="ts">
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PictureOutlined,
  StarFilled,
  UploadOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { AlbumPhoto } from '#shared/cms'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

const photos = defineModel<AlbumPhoto[]>({ required: true })
const cover = defineModel<string>('cover', { default: '' })
const props = withDefaults(defineProps<{
  albumSlug?: string
}>(), {
  albumSlug: '',
})
const newUrl = ref('')
const uploading = ref(0)
const nextPhotoIndex = ref(1)
const { request, errorMessage } = useCmsApi()

interface CustomUploadOptions {
  file: File
  onSuccess?: (body?: unknown) => void
  onError?: (error: Error) => void
}

const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function refreshNextPhotoIndex() {
  const prefix = `keepsake/albums/${props.albumSlug}/`
  const highest = photos.value.reduce((max, photo) => {
    const key = photo.key || ''
    if (!key.startsWith(prefix))
      return max
    const match = key.slice(prefix.length).match(/^(\d{3})\./)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  nextPhotoIndex.value = highest + 1
}

watch(
  () => [props.albumSlug, photos.value.map(photo => photo.key || '').join('|')],
  refreshNextPhotoIndex,
  { immediate: true },
)

async function upload({ file, onSuccess, onError }: CustomUploadOptions) {
  uploading.value += 1
  try {
    const extension = extensionByType[file.type]
      || file.name.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg')
      || 'jpg'
    const index = nextPhotoIndex.value++
    const cloudPath = `keepsake/albums/${props.albumSlug}/${String(index).padStart(3, '0')}.${extension}`
    const body = new FormData()
    body.append('file', file)
    const result = await request<{
      url: string
      key: string
      filename: string
    }>('/api/cms/upload', {
      method: 'POST',
      query: { usage: 'albums', cloudPath },
      body,
    })
    photos.value = [...photos.value, {
      id: `photo-${Date.now()}-${photos.value.length}`,
      url: result.url,
      key: result.key,
      filename: result.filename,
    }]
    if (!cover.value) {
      cover.value = result.url
    }
    onSuccess?.(result)
    message.success(`${file.name} 已加入相册`)
  }
  catch (cause) {
    const error = new Error(errorMessage(cause))
    onError?.(error)
    message.error(error.message)
  }
  finally {
    uploading.value = Math.max(0, uploading.value - 1)
  }
}

function addUrl() {
  const url = newUrl.value.trim()
  if (!url) {
    return
  }
  photos.value = [...photos.value, {
    id: `photo-${Date.now()}`,
    url,
    filename: url.split('/').pop(),
  }]
  if (!cover.value) {
    cover.value = url
  }
  newUrl.value = ''
}

function remove(index: number) {
  const removed = photos.value[index]
  const next = photos.value.filter((_, photoIndex) => photoIndex !== index)
  photos.value = next
  if (removed?.url === cover.value) {
    cover.value = next[0]?.url ?? ''
  }
}

function move(index: number, offset: number) {
  const target = index + offset
  if (target < 0 || target >= photos.value.length) {
    return
  }
  const next = [...photos.value]
  const [photo] = next.splice(index, 1)
  if (photo) {
    next.splice(target, 0, photo)
    photos.value = next
  }
}
</script>

<template>
  <div class="photo-manager">
    <div class="photo-manager__header">
      <div>
        <strong>相册照片</strong>
        <p>已添加 {{ photos.length }} 张，第一张默认作为封面。</p>
      </div>
      <a-upload
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        :show-upload-list="false"
        :custom-request="upload"
      >
        <a-button
          type="primary"
          :loading="uploading > 0"
        >
          <UploadOutlined />
          上传照片
        </a-button>
      </a-upload>
    </div>

    <div class="photo-manager__url">
      <a-input
        v-model:value="newUrl"
        placeholder="粘贴 uniCloud CDN 图片地址"
        @press-enter="addUrl"
      />
      <a-button
        :disabled="!newUrl.trim()"
        @click="addUrl"
      >
        添加
      </a-button>
    </div>

    <div
      v-if="photos.length"
      class="photo-manager__grid"
    >
      <article
        v-for="(photo, index) in photos"
        :key="photo.id || photo.url"
        class="photo-tile"
        :class="{ 'photo-tile--cover': cover === photo.url }"
      >
        <img
          :src="cmsThumbnail(photo.url, 480)"
          :alt="photo.filename || `照片 ${index + 1}`"
          loading="lazy"
          decoding="async"
        >
        <span class="photo-tile__index">{{ String(index + 1).padStart(2, '0') }}</span>
        <button
          type="button"
          class="photo-tile__cover"
          :title="cover === photo.url ? '当前封面' : '设为封面'"
          @click="cover = photo.url"
        >
          <StarFilled />
          {{ cover === photo.url ? '封面' : '设为封面' }}
        </button>
        <div class="photo-tile__actions">
          <button
            type="button"
            :disabled="index === 0"
            title="向前移动"
            @click="move(index, -1)"
          >
            <ArrowLeftOutlined />
          </button>
          <button
            type="button"
            :disabled="index === photos.length - 1"
            title="向后移动"
            @click="move(index, 1)"
          >
            <ArrowRightOutlined />
          </button>
          <button
            type="button"
            class="photo-tile__delete"
            title="删除照片"
            @click="remove(index)"
          >
            <DeleteOutlined />
          </button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="photo-manager__empty"
    >
      <PictureOutlined />
      <p>还没有照片。上传文件或粘贴图片地址开始整理。</p>
    </div>
  </div>
</template>

<style scoped>
.photo-manager {
  display: grid;
  gap: 0.85rem;
  border: 1px solid var(--cms-line);
  border-radius: 1rem;
  padding: 1rem;
  background: var(--cms-surface-soft);
}

.photo-manager__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.photo-manager__header strong {
  color: var(--cms-ink);
  font-size: 0.82rem;
}

.photo-manager__header p {
  margin: 0.28rem 0 0;
  color: var(--cms-muted);
  font-size: 0.68rem;
}

.photo-manager__url {
  display: flex;
  gap: 0.5rem;
}

.photo-manager__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 0.65rem;
}

.photo-tile {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 0.8rem;
  background: #e6e4dd;
}

.photo-tile--cover {
  border-color: var(--cms-sun);
}

.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-tile::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 45%, rgba(7, 23, 19, 0.75));
  pointer-events: none;
  content: "";
}

.photo-tile__index {
  position: absolute;
  z-index: 2;
  top: 0.45rem;
  left: 0.45rem;
  border-radius: 999px;
  padding: 0.15rem 0.35rem;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.55rem;
  backdrop-filter: blur(5px);
}

.photo-tile__cover {
  position: absolute;
  z-index: 2;
  top: 0.42rem;
  right: 0.42rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border: 0;
  border-radius: 999px;
  padding: 0.25rem 0.4rem;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(0, 0, 0, 0.42);
  font-size: 0.54rem;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.photo-tile--cover .photo-tile__cover {
  color: #2b4732;
  background: var(--cms-sun);
}

.photo-tile__actions {
  position: absolute;
  z-index: 2;
  right: 0.4rem;
  bottom: 0.4rem;
  display: flex;
  gap: 0.2rem;
}

.photo-tile__actions button {
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  border: 0;
  border-radius: 0.38rem;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.65rem;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.photo-tile__actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.photo-tile__actions .photo-tile__delete {
  color: #ffd4c9;
}

.photo-manager__empty {
  display: grid;
  min-height: 9rem;
  place-items: center;
  border: 1px dashed #d9d5ca;
  border-radius: 0.8rem;
  color: #9ca7a1;
  text-align: center;
}

.photo-manager__empty > :first-child {
  margin-bottom: -2rem;
  font-size: 1.6rem;
}

.photo-manager__empty p {
  max-width: 19rem;
  margin: 0.6rem 0 0;
  font-size: 0.7rem;
}

@media (max-width: 540px) {
  .photo-manager__header {
    flex-direction: column;
  }

  .photo-manager__header :deep(.ant-btn) {
    width: 100%;
  }

  .photo-manager__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

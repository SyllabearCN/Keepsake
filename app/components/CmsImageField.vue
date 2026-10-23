<script setup lang="ts">
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

const props = withDefaults(defineProps<{
  label?: string
  usage?: 'stories' | 'videos' | 'banners' | 'about'
}>(), {
  label: '图片地址',
  usage: 'stories',
})

const model = defineModel<string>({ default: '' })
const uploadUrl = ref('')
const uploading = ref(false)
const { request, errorMessage } = useCmsApi()

interface CustomUploadOptions {
  file: File
  onSuccess?: (body?: unknown) => void
  onError?: (error: Error) => void
}

function addUrl() {
  const next = uploadUrl.value.trim()
  if (next) {
    model.value = next
    uploadUrl.value = ''
  }
}

async function upload({ file, onSuccess, onError }: CustomUploadOptions) {
  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const result = await request<{ url: string }>('/api/cms/upload', {
      method: 'POST',
      query: { usage: props.usage },
      body,
    })
    model.value = result.url
    onSuccess?.(result)
    message.success('图片上传成功')
  }
  catch (cause) {
    const error = new Error(errorMessage(cause))
    onError?.(error)
    message.error(error.message)
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="image-field">
    <label class="image-field__label">{{ label }}</label>
    <div class="image-field__row">
      <a-input
        v-model:value="model"
        placeholder="https://..."
        allow-clear
      >
        <template #prefix>
          <PictureOutlined />
        </template>
      </a-input>
      <a-upload
        accept="image/jpeg,image/png,image/webp,image/gif"
        :show-upload-list="false"
        :custom-request="upload"
      >
        <a-button :loading="uploading">
          <UploadOutlined />
          上传
        </a-button>
      </a-upload>
      <a-button
        v-if="model"
        danger
        aria-label="清空图片"
        @click="model = ''"
      >
        <DeleteOutlined />
      </a-button>
    </div>
    <div class="image-field__url">
      <a-input
        v-model:value="uploadUrl"
        placeholder="也可以直接粘贴已有 CDN 地址"
        @press-enter="addUrl"
      />
      <a-button
        :disabled="!uploadUrl.trim()"
        @click="addUrl"
      >
        使用
      </a-button>
    </div>
    <div
      v-if="model"
      class="image-field__preview"
    >
      <img
        :src="cmsThumbnail(model, 640)"
        alt="图片预览"
        loading="lazy"
        decoding="async"
      >
    </div>
  </div>
</template>

<style scoped>
.image-field {
  display: grid;
  gap: 0.5rem;
}

.image-field__label {
  color: var(--cms-ink);
  font-size: 0.76rem;
  font-weight: 650;
}

.image-field__row,
.image-field__url {
  display: flex;
  gap: 0.5rem;
}

.image-field__row :deep(.ant-input-affix-wrapper),
.image-field__url :deep(.ant-input) {
  min-width: 0;
}

.image-field__preview {
  height: 10rem;
  overflow: hidden;
  border: 1px solid var(--cms-line);
  border-radius: 0.85rem;
  background: var(--cms-surface-soft);
}

.image-field__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 540px) {
  .image-field__row {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .image-field__row :deep(.ant-input-affix-wrapper) {
    flex-basis: 100%;
  }
}
</style>

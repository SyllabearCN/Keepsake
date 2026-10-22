<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { AlbumPhoto, AlbumRecord } from '#shared/cms'
import { statusOptions } from '#shared/cms'

const props = defineProps<{
  open: boolean
  record?: AlbumRecord | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { request, errorMessage } = useCmsApi()
const formRef = ref()
const saving = ref(false)
const photos = ref<AlbumPhoto[]>([])
const cover = ref('')
const form = reactive({
  title: '',
  slug: '',
  date: '',
  description: '',
  sort_order: 0,
  status: 'published' as AlbumRecord['status'],
})

function reset() {
  const record = props.record
  form.title = record?.title ?? ''
  form.slug = record?.slug ?? ''
  form.date = record?.date ?? new Date().toISOString().slice(0, 10)
  form.description = record?.description ?? ''
  form.sort_order = record?.sort_order ?? 0
  form.status = record?.status ?? 'published'
  photos.value = record?.photos?.map(photo => ({ ...photo })) ?? []
  cover.value = record?.cover ?? photos.value[0]?.url ?? ''
  formRef.value?.clearValidate()
}

watch(() => props.open, (open) => {
  if (open) {
    reset()
  }
})

async function save() {
  await formRef.value?.validate()
  if (!photos.value.length) {
    message.warning('请至少添加一张照片')
    return
  }

  saving.value = true
  try {
    const body = {
      ...form,
      cover: cover.value || photos.value[0]?.url,
      photos: photos.value,
      list: photos.value.map(photo => photo.url),
    }
    await request(
      props.record
        ? `/api/cms/resources/albums/${props.record._id}`
        : '/api/cms/resources/albums',
      {
        method: props.record ? 'PUT' : 'POST',
        body,
      },
    )
    message.success(props.record ? '相册已更新' : '相册已创建')
    emit('update:open', false)
    emit('saved')
  }
  catch (cause) {
    message.error(errorMessage(cause))
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <a-drawer
    :open="open"
    :title="record ? '编辑相册' : '新建相册'"
    width="min(940px, 100vw)"
    root-class-name="cms-editor-drawer"
    :destroy-on-close="true"
    @close="emit('update:open', false)"
  >
    <a-form
      ref="formRef"
      :model="form"
      layout="vertical"
      required-mark="optional"
    >
      <div class="form-grid">
        <a-form-item
          label="相册名称"
          name="title"
          :rules="[{ required: true, message: '请输入相册名称' }]"
        >
          <a-input
            v-model:value="form.title"
            placeholder="例如：海边周末"
          />
        </a-form-item>
        <a-form-item
          label="稳定标识（Slug）"
          name="slug"
        >
          <a-input
            v-model:value="form.slug"
            placeholder="留空会根据名称和日期生成"
          />
        </a-form-item>
        <a-form-item
          label="拍摄日期"
          name="date"
          :rules="[{ required: true, message: '请选择日期' }]"
        >
          <a-input
            v-model:value="form.date"
            type="date"
          />
        </a-form-item>
        <a-form-item
          label="发布状态"
          name="status"
        >
          <a-select
            v-model:value="form.status"
            :options="[...statusOptions]"
          />
        </a-form-item>
      </div>

      <a-form-item label="相册说明">
        <a-textarea
          v-model:value="form.description"
          :rows="3"
          placeholder="写下这次记录的一句话说明"
          show-count
          :maxlength="240"
        />
      </a-form-item>

      <a-form-item label="排序">
        <a-input-number
          v-model:value="form.sort_order"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>

      <CmsPhotoManager
        v-model="photos"
        v-model:cover="cover"
      />
    </a-form>

    <template #footer>
      <div class="cms-editor-footer">
        <a-button @click="emit('update:open', false)">
          取消
        </a-button>
        <a-button
          type="primary"
          :loading="saving"
          @click="save"
        >
          {{ record ? '保存修改' : '创建相册' }}
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 1rem;
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

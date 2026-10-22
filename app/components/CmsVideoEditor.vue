<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { VideoRecord } from '../../shared/cms'
import { statusOptions } from '../../shared/cms'

const props = defineProps<{
  open: boolean
  record?: VideoRecord | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { request, errorMessage } = useCmsApi()
const formRef = ref()
const saving = ref(false)
const form = reactive({
  title: '',
  title_en: '',
  description: '',
  description_en: '',
  location: '',
  location_en: '',
  bvid: '',
  cover_url: '',
  date: '',
  duration: '',
  featured: false,
  sort_order: 0,
  status: 'published' as VideoRecord['status'],
})

function reset() {
  const record = props.record
  form.title = record?.title ?? ''
  form.title_en = record?.title_en ?? ''
  form.description = record?.description ?? ''
  form.description_en = record?.description_en ?? ''
  form.location = record?.location ?? ''
  form.location_en = record?.location_en ?? ''
  form.bvid = record?.bvid ?? ''
  form.cover_url = record?.cover_url ?? ''
  form.date = record?.date ?? new Date().toISOString().slice(0, 10)
  form.duration = record?.duration ?? ''
  form.featured = record?.featured ?? false
  form.sort_order = record?.sort_order ?? 0
  form.status = record?.status ?? 'published'
  formRef.value?.clearValidate()
}

watch(() => props.open, (open) => {
  if (open) {
    reset()
  }
})

async function save() {
  await formRef.value?.validate()
  saving.value = true
  try {
    await request(
      props.record
        ? `/api/cms/resources/videos/${props.record._id}`
        : '/api/cms/resources/videos',
      {
        method: props.record ? 'PUT' : 'POST',
        body: form,
      },
    )
    message.success(props.record ? '影像已更新' : '影像已创建')
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
    :title="record ? '编辑旅行影像' : '添加旅行影像'"
    width="min(860px, 100vw)"
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
      <div class="video-form-grid">
        <a-form-item
          label="中文标题"
          name="title"
          :rules="[{ required: true, message: '请输入中文标题' }]"
        >
          <a-input v-model:value="form.title" />
        </a-form-item>
        <a-form-item label="英文标题">
          <a-input v-model:value="form.title_en" />
        </a-form-item>
        <a-form-item
          label="Bilibili BV 编号"
          name="bvid"
          :rules="[
            { required: true, message: '请输入 BV 编号' },
            { pattern: /^BV[a-zA-Z0-9]+$/, message: '格式应以 BV 开头' },
          ]"
        >
          <a-input
            v-model:value="form.bvid"
            placeholder="BV1..."
          />
        </a-form-item>
        <a-form-item
          label="发布日期"
          name="date"
          :rules="[{ required: true, message: '请选择发布日期' }]"
        >
          <a-input
            v-model:value="form.date"
            type="date"
          />
        </a-form-item>
        <a-form-item
          label="时长"
          name="duration"
          :rules="[{ required: true, message: '请输入视频时长' }]"
        >
          <a-input
            v-model:value="form.duration"
            placeholder="03:17"
          />
        </a-form-item>
        <a-form-item label="中文地点">
          <a-input v-model:value="form.location" />
        </a-form-item>
        <a-form-item label="英文地点">
          <a-input v-model:value="form.location_en" />
        </a-form-item>
        <a-form-item label="发布状态">
          <a-select
            v-model:value="form.status"
            :options="[...statusOptions]"
          />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number
            v-model:value="form.sort_order"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="中文说明">
          <a-textarea
            v-model:value="form.description"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="英文说明">
          <a-textarea
            v-model:value="form.description_en"
            :rows="3"
          />
        </a-form-item>
        <div class="video-form-grid__wide video-form-grid__cover">
          <CmsImageField
            v-model="form.cover_url"
            label="视频封面"
            usage="videos"
          />
        </div>
        <a-form-item
          label="首页推荐"
          class="video-form-grid__wide"
        >
          <a-switch
            v-model:checked="form.featured"
            checked-children="推荐"
            un-checked-children="普通"
          />
        </a-form-item>
      </div>
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
          {{ record ? '保存修改' : '添加影像' }}
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<style scoped>
.video-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 1rem;
}

.video-form-grid__wide {
  grid-column: 1 / -1;
}

.video-form-grid__cover {
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .video-form-grid {
    grid-template-columns: 1fr;
  }

  .video-form-grid__wide {
    grid-column: auto;
  }
}
</style>

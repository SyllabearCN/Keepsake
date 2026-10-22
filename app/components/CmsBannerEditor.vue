<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { BannerRecord } from '#shared/cms'
import { bannerUsageOptions } from '#shared/cms'

const props = defineProps<{
  open: boolean
  record?: BannerRecord | null
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
  image_url: '',
  storage_key: '',
  usage: 'hero' as BannerRecord['usage'],
  alt: '',
  width: 0,
  height: 0,
  sort_order: 0,
  active: true,
})

function reset() {
  const record = props.record
  form.title = record?.title ?? ''
  form.image_url = record?.image_url ?? ''
  form.storage_key = record?.storage_key ?? ''
  form.usage = record?.usage ?? 'hero'
  form.alt = record?.alt ?? ''
  form.width = record?.width ?? 0
  form.height = record?.height ?? 0
  form.sort_order = record?.sort_order ?? 0
  form.active = record?.active ?? true
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
        ? `/api/cms/resources/banners/${props.record._id}`
        : '/api/cms/resources/banners',
      {
        method: props.record ? 'PUT' : 'POST',
        body: form,
      },
    )
    message.success(props.record ? '横图已更新' : '横图已添加')
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
    :title="record ? '编辑页面横图' : '添加页面横图'"
    width="min(780px, 100vw)"
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
      <CmsImageField
        v-model="form.image_url"
        label="横图"
        :usage="form.usage === 'about' ? 'about' : 'banners'"
      />

      <div class="banner-form-grid">
        <a-form-item
          label="标题"
          name="title"
          :rules="[{ required: true, message: '请输入标题' }]"
        >
          <a-input v-model:value="form.title" />
        </a-form-item>
        <a-form-item label="使用位置">
          <a-select
            v-model:value="form.usage"
            :options="[...bannerUsageOptions]"
          />
        </a-form-item>
        <a-form-item label="无障碍说明">
          <a-input v-model:value="form.alt" />
        </a-form-item>
        <a-form-item label="云存储对象键">
          <a-input
            v-model:value="form.storage_key"
            placeholder="keepsake/..."
          />
        </a-form-item>
        <a-form-item label="原始宽度">
          <a-input-number
            v-model:value="form.width"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="原始高度">
          <a-input-number
            v-model:value="form.height"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number
            v-model:value="form.sort_order"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch
            v-model:checked="form.active"
            checked-children="启用"
            un-checked-children="停用"
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
          {{ record ? '保存修改' : '添加横图' }}
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<style scoped>
.banner-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 1rem;
  margin-top: 1.2rem;
}

@media (max-width: 620px) {
  .banner-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

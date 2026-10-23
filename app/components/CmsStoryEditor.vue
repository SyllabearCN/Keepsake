<script setup lang="ts">
import { message } from 'ant-design-vue'
import { marked } from 'marked'
import type { StoryRecord } from '#shared/cms'

const props = defineProps<{
  open: boolean
  record?: StoryRecord | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { request, errorMessage } = useCmsApi()
const formRef = ref()
const saving = ref(false)
const activeTab = ref('write')
const form = reactive({
  title: '',
  slug: '',
  description: '',
  date: '',
  category: '',
  location: '',
  reading_time: 4,
  cover_url: '',
  content_markdown: '',
  sort_order: 0,
  enabled: true,
})

const renderedMarkdown = computed(() => marked.parse(
  form.content_markdown || '*还没有正文，切换到写作标签开始记录。*',
  { async: false },
) as string)

function reset() {
  const record = props.record
  form.title = record?.title ?? ''
  form.slug = record?.slug ?? ''
  form.description = record?.description ?? ''
  form.date = record?.date ?? new Date().toISOString().slice(0, 10)
  form.category = record?.category ?? ''
  form.location = record?.location ?? ''
  form.reading_time = record?.reading_time ?? 4
  form.cover_url = record?.cover_url ?? ''
  form.content_markdown = record?.content_markdown ?? ''
  form.sort_order = record?.sort_order ?? 0
  form.enabled = record?.enabled ?? true
  activeTab.value = 'write'
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
        ? `/api/cms/resources/stories/${props.record._id}`
        : '/api/cms/resources/stories',
      {
        method: props.record ? 'PUT' : 'POST',
        body: form,
      },
    )
    message.success(props.record ? '文章已更新' : '文章已创建')
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
    :title="record ? '编辑文字记录' : '新建文字记录'"
    width="min(1080px, 100vw)"
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
      <div class="story-form-grid">
        <a-form-item
          class="story-form-grid__wide"
          label="文章标题"
          name="title"
          :rules="[{ required: true, message: '请输入文章标题' }]"
        >
          <a-input
            v-model:value="form.title"
            size="large"
            placeholder="今天想记住什么？"
          />
        </a-form-item>
        <a-form-item
          label="文章摘要"
          name="description"
          :rules="[{ required: true, message: '请填写文章摘要' }]"
        >
          <a-textarea
            v-model:value="form.description"
            :rows="3"
            :maxlength="240"
            show-count
          />
        </a-form-item>
        <div class="story-form-grid__cover">
          <CmsImageField
            v-model="form.cover_url"
            label="文章封面"
            usage="stories"
          />
        </div>
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
          label="分类"
          name="category"
          :rules="[{ required: true, message: '请填写分类' }]"
        >
          <a-input
            v-model:value="form.category"
            placeholder="例如：成长记录"
          />
        </a-form-item>
        <a-form-item label="地点">
          <a-input
            v-model:value="form.location"
            placeholder="可选"
          />
        </a-form-item>
        <a-form-item label="阅读分钟">
          <a-input-number
            v-model:value="form.reading_time"
            :min="1"
            :max="120"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="稳定标识（Slug）">
          <a-input
            v-model:value="form.slug"
            placeholder="留空自动生成"
          />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch
            v-model:checked="form.enabled"
          />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number
            v-model:value="form.sort_order"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
      </div>

      <a-form-item
        label="正文"
        name="content_markdown"
        :rules="[{ required: true, message: '请填写 Markdown 正文' }]"
      >
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane
            key="write"
            tab="Markdown 写作"
          >
            <a-textarea
              v-model:value="form.content_markdown"
              class="markdown-input"
              :rows="18"
              placeholder="# 标题&#10;&#10;从这里开始写下今天的故事……"
            />
          </a-tab-pane>
          <a-tab-pane
            key="preview"
            tab="预览效果"
          >
            <div
              class="markdown-preview"
              v-html="renderedMarkdown"
            />
          </a-tab-pane>
        </a-tabs>
      </a-form-item>
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
          {{ record ? '保存修改' : '发布文章' }}
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<style scoped>
.story-form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(15rem, 0.85fr);
  gap: 0 1rem;
}

.story-form-grid__wide,
.story-form-grid__cover {
  grid-column: 1 / -1;
}

.markdown-input :deep(textarea) {
  font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.8;
}

.markdown-preview {
  min-height: 26rem;
  max-height: 52vh;
  overflow: auto;
  border: 1px solid var(--cms-line);
  border-radius: 0.9rem;
  padding: 1.2rem 1.5rem;
  color: var(--cms-ink);
  background: var(--cms-surface);
  font-family: "Songti SC", "STSong", var(--font-display);
  font-size: 1rem;
  line-height: 1.9;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  line-height: 1.3;
}

.markdown-preview :deep(blockquote) {
  margin-inline: 0;
  border-left: 3px solid var(--cms-accent);
  padding-left: 1rem;
  color: var(--cms-muted);
}

.markdown-preview :deep(img) {
  max-width: 100%;
  border-radius: 0.8rem;
}

@media (max-width: 700px) {
  .story-form-grid {
    grid-template-columns: 1fr;
  }

  .story-form-grid__wide,
  .story-form-grid__cover {
    grid-column: auto;
  }
}
</style>

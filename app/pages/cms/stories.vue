<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { StoryRecord } from '#shared/cms'
import { enabledOptions } from '#shared/cms'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

definePageMeta({
  layout: 'cms',
  middleware: 'cms-auth',
})

useHead({ title: '文字记录' })

const route = useRoute()
const { request, errorMessage } = useCmsApi()
const {
  items,
  total,
  page,
  pageSize,
  search,
  enabled,
  loading,
  error,
  load,
  applyFilters,
  changePage,
} = useCmsResourceList<StoryRecord>('stories', 8)

const editorOpen = ref(false)
const current = ref<StoryRecord | null>(null)
const columns = [
  { title: '文章', key: 'story', width: 360 },
  { title: '分类', dataIndex: 'category', width: 130 },
  { title: '日期', dataIndex: 'date', width: 130 },
  { title: '阅读', key: 'reading_time', width: 90 },
  { title: '是否启用', key: 'enabled', width: 110 },
  { title: '操作', key: 'actions', width: 150, align: 'right' as const },
]

function openEditor(record: StoryRecord | null = null) {
  current.value = record
  editorOpen.value = true
}

function preview(record: StoryRecord) {
  window.open(`/stories/${record.slug || record._id}`, '_blank', 'noopener')
}

async function remove(record: StoryRecord) {
  Modal.confirm({
    title: `删除「${record.title}」？`,
    content: '文章会从 uniCloud 删除，并从 Keepsake 网站下线。',
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        await request(`/api/cms/resources/stories/${record._id}`, { method: 'DELETE' })
        message.success('文章已删除')
        await load()
      }
      catch (cause) {
        message.error(errorMessage(cause))
      }
    },
  })
}

onMounted(() => {
  if (route.query.create === '1') {
    openEditor()
  }
})
</script>

<template>
  <div>
    <CmsPageHeader
      eyebrow="WRITTEN MEMORIES"
      title="文字记录"
      description="用 Markdown 维护旅行手记、成长记录和项目文档，支持实时预览。"
    >
      <template #actions>
        <a-button
          class="cms-add-button"
          type="primary"
          @click="openEditor()"
        >
          <PlusOutlined />
          新建文章
        </a-button>
      </template>
    </CmsPageHeader>

    <a-alert
      v-if="error"
      class="page-alert"
      type="error"
      show-icon
      :message="error"
    >
      <template #action>
        <a-button
          size="small"
          @click="load"
        >
          重试
        </a-button>
      </template>
    </a-alert>

    <section class="cms-card cms-panel">
      <div class="cms-toolbar">
        <div class="cms-toolbar__filters">
          <a-input
            v-model:value="search"
            allow-clear
            placeholder="搜索标题、分类或摘要"
            @press-enter="applyFilters"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-select
            v-model:value="enabled"
            :options="[...enabledOptions]"
          />
        </div>
        <a-button @click="applyFilters">
          应用筛选
        </a-button>
      </div>

      <div class="cms-card cms-table-card">
        <a-table
          :columns="columns"
          :data-source="items"
          :loading="loading"
          row-key="_id"
          :pagination="false"
          :scroll="{ x: 900 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'story'">
              <div class="cms-resource-title">
                <img
                  class="cms-resource-title__image"
                  :src="cmsThumbnail(record.cover_url, 160) || '/media-placeholder.svg'"
                  :alt="record.title"
                  loading="lazy"
                  decoding="async"
                >
                <div class="cms-resource-title__copy">
                  <strong>{{ record.title }}</strong>
                  <small>{{ record.description }}</small>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'enabled'">
              <CmsEnabledSwitch
                resource="stories"
                :record="record"
              />
            </template>
            <template v-else-if="column.key === 'reading_time'">
              <span class="subtle-value">{{ record.reading_time }} 分钟</span>
            </template>
            <template v-else-if="column.key === 'actions'">
              <div class="cms-row-actions">
                <button
                  type="button"
                  class="cms-action-link"
                  @click="preview(record)"
                >
                  查看
                </button>
                <button
                  type="button"
                  class="cms-action-link"
                  @click="openEditor(record)"
                >
                  <EditOutlined />
                </button>
                <button
                  type="button"
                  class="cms-action-link cms-action-link--danger"
                  @click="remove(record)"
                >
                  <DeleteOutlined />
                </button>
              </div>
            </template>
          </template>
          <template #emptyText>
            <div class="cms-empty">
              <div>
                <div class="cms-empty__orb">
                  文
                </div>
                <h3>还没有文字记录</h3>
                <p>写下一篇旅行手记，或记录孩子成长的某个瞬间。</p>
              </div>
            </div>
          </template>
        </a-table>
        <div class="cms-pagination">
          <a-pagination
            :current="page"
            :page-size="pageSize"
            :total="total"
            :show-size-changer="true"
            :show-total="(count: number) => `共 ${count} 篇文章`"
            @change="changePage"
          />
        </div>
      </div>
    </section>

    <CmsStoryEditor
      v-model:open="editorOpen"
      :record="current"
      @saved="load"
    />
  </div>
</template>

<style scoped>
.page-alert {
  margin-bottom: 1rem;
}

.subtle-value {
  color: var(--cms-muted);
  font-size: 0.72rem;
}
</style>

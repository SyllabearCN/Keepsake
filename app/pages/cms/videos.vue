<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { VideoRecord } from '#shared/cms'
import { enabledOptions } from '#shared/cms'

definePageMeta({
  layout: 'cms',
  middleware: 'cms-auth',
})

useHead({ title: '旅行影像' })

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
} = useCmsResourceList<VideoRecord>('videos', 8)

const editorOpen = ref(false)
const current = ref<VideoRecord | null>(null)
const columns = [
  { title: '影像', key: 'video', width: 360 },
  { title: 'BV 编号', dataIndex: 'bvid', width: 150 },
  { title: '日期', dataIndex: 'date', width: 125 },
  { title: '时长', dataIndex: 'duration', width: 90 },
  { title: '是否启用', key: 'enabled', width: 110 },
  { title: '操作', key: 'actions', width: 150, align: 'right' as const },
]

function openEditor(record: VideoRecord | null = null) {
  current.value = record
  editorOpen.value = true
}

function preview(record: VideoRecord) {
  window.open(`https://www.bilibili.com/video/${record.bvid}`, '_blank', 'noopener')
}

async function remove(record: VideoRecord) {
  Modal.confirm({
    title: `删除「${record.title}」？`,
    content: '只会删除 Keepsake 中的视频索引，不会删除 Bilibili 原始视频。',
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        await request(`/api/cms/resources/videos/${record._id}`, { method: 'DELETE' })
        message.success('影像已删除')
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
      eyebrow="TRAVEL FOOTAGE"
      title="旅行影像"
      description="维护 Bilibili 视频索引、封面和双语信息，视频文件仍保留在 Bilibili。"
    >
      <template #actions>
        <a-button
          class="cms-add-button"
          type="primary"
          @click="openEditor()"
        >
          <PlusOutlined />
          添加影像
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
            placeholder="搜索标题、BV 编号或地点"
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
          :scroll="{ x: 980 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'video'">
              <div class="cms-resource-title">
                <img
                  class="cms-resource-title__image"
                  :src="record.cover_url || '/icons/media-placeholder.svg'"
                  :alt="record.title"
                  loading="lazy"
                >
                <div class="cms-resource-title__copy">
                  <strong>{{ record.title }}</strong>
                  <small>{{ record.location || record.title_en || '旅行影像' }}</small>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'enabled'">
              <CmsEnabledSwitch
                resource="videos"
                :record="record"
              />
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
                  ▶
                </div>
                <h3>还没有旅行影像</h3>
                <p>粘贴 Bilibili BV 编号和封面地址，就能建立影像索引。</p>
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
            :show-total="(count: number) => `共 ${count} 条影像`"
            @change="changePage"
          />
        </div>
      </div>
    </section>

    <CmsVideoEditor
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

</style>

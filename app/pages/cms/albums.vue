<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { AlbumRecord } from '#shared/cms'
import { enabledOptions } from '#shared/cms'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

definePageMeta({
  layout: 'cms',
  middleware: 'cms-auth',
})

useHead({ title: '家庭相册' })

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
} = useCmsResourceList<AlbumRecord>('albums', 8)

const editorOpen = ref(false)
const current = ref<AlbumRecord | null>(null)

const columns = [
  { title: '相册', key: 'album', width: 330 },
  { title: '日期', dataIndex: 'date', width: 130 },
  { title: '照片', key: 'photos', width: 100 },
  { title: '是否启用', key: 'enabled', width: 110 },
  { title: '排序', dataIndex: 'sort_order', width: 90 },
  { title: '操作', key: 'actions', width: 150, align: 'right' as const },
]

function openEditor(record: AlbumRecord | null = null) {
  current.value = record
  editorOpen.value = true
}

async function remove(record: AlbumRecord) {
  Modal.confirm({
    title: `删除「${record.title}」？`,
    content: '相册记录会从 uniCloud 删除，已上传到云存储的图片文件不会被自动清理。',
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        await request(`/api/cms/resources/albums/${record._id}`, { method: 'DELETE' })
        message.success('相册已删除')
        await load()
      }
      catch (cause) {
        message.error(errorMessage(cause))
      }
    },
  })
}

function preview() {
  window.open('/gallery', '_blank', 'noopener')
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
      eyebrow="PHOTO ALBUMS"
      title="家庭相册"
      description="整理照片顺序、封面与启用状态，保存后会同步到 Keepsake 相册页面。"
    >
      <template #actions>
        <a-button
          class="cms-add-button"
          type="primary"
          @click="openEditor()"
        >
          <PlusOutlined />
          新建相册
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
            placeholder="搜索相册名称或标识"
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
          :scroll="{ x: 920 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'album'">
              <div class="cms-resource-title">
                <img
                  class="cms-resource-title__image"
                  :src="cmsThumbnail(record.cover, 160)"
                  :alt="record.title"
                  loading="lazy"
                  decoding="async"
                >
                <div class="cms-resource-title__copy">
                  <strong>{{ record.title }}</strong>
                  <small>{{ record.description || record.slug }}</small>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'photos'">
              <span class="photo-count">{{ record.photos.length }} 张</span>
            </template>
            <template v-else-if="column.key === 'enabled'">
              <CmsEnabledSwitch
                resource="albums"
                :record="record"
              />
            </template>
            <template v-else-if="column.key === 'actions'">
              <div class="cms-row-actions">
                <button
                  type="button"
                  class="cms-action-link"
                  title="查看相册"
                  @click="preview"
                >
                  查看
                </button>
                <button
                  type="button"
                  class="cms-action-link"
                  title="编辑相册"
                  @click="openEditor(record)"
                >
                  <EditOutlined />
                </button>
                <button
                  type="button"
                  class="cms-action-link cms-action-link--danger"
                  title="删除相册"
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
                  ◌
                </div>
                <h3>没有找到相册</h3>
                <p>换个搜索词，或创建一本新的家庭相册。</p>
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
            :show-total="(count: number) => `共 ${count} 本相册`"
            @change="changePage"
          />
        </div>
      </div>
    </section>

    <CmsAlbumEditor
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

.photo-count {
  color: var(--cms-muted);
  font-size: 0.73rem;
}
</style>

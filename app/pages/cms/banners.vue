<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { BannerRecord } from '#shared/cms'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

definePageMeta({
  layout: 'cms',
  middleware: 'cms-auth',
})

useHead({ title: '页面横图' })

const route = useRoute()
const { request, errorMessage } = useCmsApi()
const {
  items,
  total,
  page,
  pageSize,
  search,
  loading,
  error,
  load,
  applyFilters,
  changePage,
} = useCmsResourceList<BannerRecord>('banners', 8)

const editorOpen = ref(false)
const current = ref<BannerRecord | null>(null)
const togglingId = ref('')
const columns = [
  { title: '图片', key: 'banner', width: 390 },
  { title: '使用位置', dataIndex: 'usage', width: 140 },
  { title: '尺寸', key: 'dimensions', width: 140 },
  { title: '启用', key: 'active', width: 100 },
  { title: '排序', dataIndex: 'sort_order', width: 90 },
  { title: '操作', key: 'actions', width: 150, align: 'right' as const },
]

function openEditor(record: BannerRecord | null = null) {
  current.value = record
  editorOpen.value = true
}

async function toggleActive(record: BannerRecord) {
  togglingId.value = record._id
  try {
    await request(`/api/cms/resources/banners/${record._id}`, {
      method: 'PUT',
      body: { ...record, active: !record.active },
    })
    message.success(record.active ? '横图已停用' : '横图已启用')
    await load()
  }
  catch (cause) {
    message.error(errorMessage(cause))
  }
  finally {
    togglingId.value = ''
  }
}

async function remove(record: BannerRecord) {
  Modal.confirm({
    title: `删除「${record.title}」？`,
    content: '横图记录会从 uniCloud 删除。已上传到云存储的文件需要另行清理。',
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        await request(`/api/cms/resources/banners/${record._id}`, { method: 'DELETE' })
        message.success('横图已删除')
        await load()
      }
      catch (cause) {
        message.error(errorMessage(cause))
      }
    },
  })
}

function preview() {
  window.open('/', '_blank', 'noopener')
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
      eyebrow="PAGE IMAGERY"
      title="页面横图"
      description="管理首页主视觉和关于页成员照片，启用状态会直接影响 Keepsake 网站。"
    >
      <template #actions>
        <a-button
          class="cms-add-button"
          type="primary"
          @click="openEditor()"
        >
          <PlusOutlined />
          添加横图
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
            placeholder="搜索标题或无障碍说明"
            @press-enter="applyFilters"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
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
            <template v-if="column.key === 'banner'">
              <div class="cms-resource-title">
                <img
                  class="cms-resource-title__image banner-image"
                  :src="cmsThumbnail(record.image_url, 160)"
                  :alt="record.alt || record.title"
                  loading="lazy"
                  decoding="async"
                >
                <div class="cms-resource-title__copy">
                  <strong>{{ record.title }}</strong>
                  <small>{{ record.alt || record.storage_key || record.image_url }}</small>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'usage'">
              <a-tag :color="record.usage === 'hero' ? 'green' : 'orange'">
                {{ record.usage === 'hero' ? '首页横图' : '关于页成员照' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'dimensions'">
              <span class="subtle-value">
                {{ record.width || '—' }} × {{ record.height || '—' }}
              </span>
            </template>
            <template v-else-if="column.key === 'active'">
              <a-switch
                :checked="record.active"
                :loading="togglingId === record._id"
                size="small"
                @change="toggleActive(record)"
              />
            </template>
            <template v-else-if="column.key === 'actions'">
              <div class="cms-row-actions">
                <button
                  type="button"
                  class="cms-action-link"
                  @click="preview"
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
                  ▧
                </div>
                <h3>还没有页面横图</h3>
                <p>上传一张照片，为 Keepsake 首页或成员介绍换一种气氛。</p>
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
            :show-total="(count: number) => `共 ${count} 张图片`"
            @change="changePage"
          />
        </div>
      </div>
    </section>

    <CmsBannerEditor
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

.banner-image {
  width: 4.4rem;
  height: 2.7rem;
}

.subtle-value {
  color: var(--cms-muted);
  font-size: 0.72rem;
}
</style>

<script setup lang="ts">
import {
  ArrowRightOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue'
import type { DashboardResponse } from '#shared/cms'
import { cmsThumbnail } from '~/utils/cmsThumbnail'

definePageMeta({
  layout: 'cms',
  middleware: 'cms-auth',
})

useHead({ title: '内容概览' })

const router = useRouter()
const { request, errorMessage } = useCmsApi()
const dashboard = ref<DashboardResponse | null>(null)
const loading = ref(true)
const error = ref('')

const today = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  timeZone: 'Asia/Taipei',
}).format(new Date())

const statCards = computed(() => {
  const counts = dashboard.value?.counts
  return [
    { label: '相册', value: counts?.albums ?? 0, meta: `${counts?.photos ?? 0} 张照片`, tone: 'forest', icon: PictureOutlined },
    { label: '文字记录', value: counts?.stories ?? 0, meta: 'Markdown 内容', tone: 'sun', icon: FileTextOutlined },
    { label: '旅行影像', value: counts?.videos ?? 0, meta: 'Bilibili 索引', tone: 'coral', icon: VideoCameraOutlined },
  ]
})

const totalContent = computed(() => {
  const counts = dashboard.value?.counts
  return Math.max(1, (counts?.albums ?? 0) + (counts?.stories ?? 0) + (counts?.videos ?? 0))
})

const enabledRatio = computed(() => {
  const enabled = dashboard.value?.counts.enabled ?? 0
  return totalContent.value ? Math.round((enabled / totalContent.value) * 100) : 0
})

const contentCategories = computed(() => {
  const counts = dashboard.value?.counts
  return [
    {
      label: '家庭相册',
      value: counts?.albums ?? 0,
      unit: '本',
      to: '/cms/albums',
      tone: 'forest',
    },
    {
      label: '照片',
      value: counts?.photos ?? 0,
      unit: '张',
      to: '/cms/albums',
      tone: 'sage',
    },
    {
      label: '文字记录',
      value: counts?.stories ?? 0,
      unit: '篇',
      to: '/cms/stories',
      tone: 'sun',
    },
    {
      label: '旅行影像',
      value: counts?.videos ?? 0,
      unit: '条',
      to: '/cms/videos',
      tone: 'coral',
    },
  ]
})

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    dashboard.value = await request<DashboardResponse>('/api/cms/dashboard')
  }
  catch (cause) {
    error.value = errorMessage(cause)
  }
  finally {
    loading.value = false
  }
}

function create(path: string) {
  void router.push(`${path}?create=1`)
}

onMounted(loadDashboard)
</script>

<template>
  <div>
    <CmsPageHeader
      eyebrow="DASHBOARD"
      title="今天想记录什么？"
      :description="`${today} · 所有内容与 Keepsake 网站实时同步`"
    >
      <template #actions>
        <a-button
          class="cms-add-button"
          type="primary"
          @click="create('/cms/albums')"
        >
          <PlusOutlined />
          新建相册
        </a-button>
      </template>
    </CmsPageHeader>

    <a-alert
      v-if="error"
      class="dashboard-alert"
      type="error"
      show-icon
      :message="error"
    >
      <template #action>
        <a-button
          size="small"
          @click="loadDashboard"
        >
          重试
        </a-button>
      </template>
    </a-alert>

    <div class="dashboard-grid">
      <section class="welcome-card">
        <div class="welcome-card__content">
          <span class="welcome-card__badge">KEEPSAKE FAMILY</span>
          <h2>普通的日子，<br>也值得被好好保存。</h2>
          <p>
            后台已经连接 uniCloud。你可以整理家庭照片、补充旅行故事，
            或为网站换一张新的横图。
          </p>
          <div class="welcome-card__actions">
            <a-button
              type="primary"
              ghost
              @click="create('/cms/stories')"
            >
              写一篇记录
              <ArrowRightOutlined />
            </a-button>
            <a-button
              type="text"
              @click="router.push('/cms/albums')"
            >
              管理相册
            </a-button>
          </div>
        </div>
        <div
          class="welcome-card__art"
          aria-hidden="true"
        >
          <div class="welcome-card__sun" />
          <div class="welcome-card__hill welcome-card__hill--back" />
          <div class="welcome-card__hill welcome-card__hill--front" />
          <svg viewBox="0 0 430 230">
            <path
              d="M58 167c66-28 119-40 171-34 53 6 97 27 148 56"
              stroke="#9fbda9"
              stroke-width="2"
              fill="none"
            />
            <path
              d="M176 158c0-20 25-34 48-17 8-25 47-26 58-2 10-16 39-20 53 2 8 13 10 28 9 45"
              stroke="#f4d18d"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
            />
            <circle
              cx="167"
              cy="132"
              r="15"
              fill="#edc173"
            />
            <circle
              cx="287"
              cy="116"
              r="13"
              fill="#ef9a7e"
            />
            <circle
              cx="235"
              cy="143"
              r="9"
              fill="#9bc2ad"
            />
          </svg>
        </div>
      </section>

      <section class="content-health cms-card">
        <div class="content-health__heading">
          <div>
            <p>CONTENT HEALTH</p>
            <h2>内容状态</h2>
          </div>
          <span
            class="content-health__signal"
            :class="{ 'content-health__signal--off': dashboard && !dashboard.cloudConnected }"
          >
            {{ dashboard?.cloudConnected ? '云端在线' : '未连接' }}
          </span>
        </div>

        <a-skeleton
          v-if="loading"
          active
          :paragraph="{ rows: 4 }"
        />
        <template v-else>
          <div class="health-summary">
            <div class="health-summary__ratio">
              <span>启用覆盖</span>
              <strong>{{ enabledRatio }}<small>%</small></strong>
            </div>
            <div class="health-summary__status">
              <span>
                <i class="health-dot health-dot--success" />
                已启用
                <strong>{{ dashboard?.counts.enabled ?? 0 }}</strong>
              </span>
              <span>
                <i class="health-dot health-dot--disabled" />
                已停用
                <strong>{{ dashboard?.counts.disabled ?? 0 }}</strong>
              </span>
            </div>
            <div class="health-summary__track">
              <i :style="{ width: `${enabledRatio}%` }" />
            </div>
          </div>

          <div class="health-breakdown">
            <NuxtLink
              v-for="category in contentCategories"
              :key="category.label"
              :to="category.to"
              class="health-breakdown__item"
              :class="`health-breakdown__item--${category.tone}`"
            >
              <span class="health-breakdown__label">
                <i />
                {{ category.label }}
              </span>
              <span class="health-breakdown__value">
                <strong>{{ category.value }}</strong>
                <small>{{ category.unit }}</small>
                <ArrowRightOutlined />
              </span>
            </NuxtLink>
          </div>
        </template>
      </section>
    </div>

    <section class="stats-grid">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="stat-card cms-card"
        :class="`stat-card--${card.tone}`"
      >
        <a-skeleton
          v-if="loading"
          active
          :title="false"
          :paragraph="{ rows: 1, width: '70%' }"
        />
        <template v-else>
          <div class="stat-card__top">
            <span class="stat-card__icon">
              <component :is="card.icon" />
            </span>
            <span class="stat-card__meta">{{ card.meta }}</span>
          </div>
          <strong>{{ card.value }}</strong>
          <p>{{ card.label }}</p>
        </template>
      </article>
    </section>

    <div class="dashboard-lower">
      <section class="cms-card recent-albums">
        <div class="section-heading">
          <div>
            <p>RECENT ALBUMS</p>
            <h2>最近整理的相册</h2>
          </div>
          <NuxtLink to="/cms/albums">
            查看全部
            <ArrowRightOutlined />
          </NuxtLink>
        </div>

        <div
          v-if="loading"
          class="recent-albums__loading"
        >
          <a-skeleton
            v-for="index in 3"
            :key="index"
            active
            avatar
            :title="false"
            :paragraph="{ rows: 1 }"
          />
        </div>
        <div
          v-else-if="dashboard?.recent.albums.length"
          class="recent-albums__grid"
        >
          <button
            v-for="album in dashboard.recent.albums"
            :key="album._id"
            type="button"
            class="recent-album"
            @click="router.push('/cms/albums')"
          >
            <img
              :src="cmsThumbnail(album.cover, 480)"
              :alt="album.title"
              loading="lazy"
              decoding="async"
            >
            <span class="recent-album__shade" />
            <span class="recent-album__meta">
              <strong>{{ album.title }}</strong>
              <small>{{ album.photos.length }} 张照片 · {{ album.date }}</small>
            </span>
          </button>
        </div>
        <div
          v-else
          class="cms-empty"
        >
          <div>
            <div class="cms-empty__orb">
              <PictureOutlined />
            </div>
            <h3>还没有相册</h3>
            <p>创建第一本家庭相册，照片就会出现在 Keepsake 网站。</p>
            <a-button
              class="cms-add-button"
              type="primary"
              @click="create('/cms/albums')"
            >
              新建相册
            </a-button>
          </div>
        </div>
      </section>

      <section class="cms-card quick-panel">
        <div class="section-heading">
          <div>
            <p>QUICK CREATE</p>
            <h2>快速开始</h2>
          </div>
        </div>
        <button
          type="button"
          @click="create('/cms/albums')"
        >
          <span class="quick-panel__icon quick-panel__icon--green"><PictureOutlined /></span>
          <span>
            <strong>整理一本相册</strong>
            <small>上传照片并选择封面</small>
          </span>
          <ArrowRightOutlined />
        </button>
        <button
          type="button"
          @click="create('/cms/stories')"
        >
          <span class="quick-panel__icon quick-panel__icon--sun"><FileTextOutlined /></span>
          <span>
            <strong>写下新的记录</strong>
            <small>用 Markdown 留住故事</small>
          </span>
          <ArrowRightOutlined />
        </button>
        <button
          type="button"
          @click="create('/cms/videos')"
        >
          <span class="quick-panel__icon quick-panel__icon--coral"><VideoCameraOutlined /></span>
          <span>
            <strong>添加旅行影像</strong>
            <small>维护 Bilibili 视频索引</small>
          </span>
          <ArrowRightOutlined />
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-alert {
  margin-bottom: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(17rem, 0.75fr);
  gap: 1rem;
}

.welcome-card {
  position: relative;
  min-height: 19rem;
  overflow: hidden;
  border-radius: 1.4rem;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  color: #fffaf0;
  background:
    radial-gradient(circle at 83% 28%, rgba(233, 183, 91, 0.3), transparent 15rem),
    linear-gradient(125deg, #12372e, #1b5544);
}

.welcome-card__content {
  position: relative;
  z-index: 2;
  max-width: 31rem;
}

.welcome-card__badge {
  color: #f1c879;
  font-size: 0.58rem;
  font-weight: 780;
  letter-spacing: 0.18em;
}

.welcome-card h2 {
  margin: 1rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.45rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.welcome-card p {
  max-width: 29rem;
  margin: 1rem 0 0;
  color: rgba(255, 250, 240, 0.62);
  font-size: 0.8rem;
  line-height: 1.8;
}

.welcome-card__actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.4rem;
}

.welcome-card__actions :deep(.ant-btn-primary.ant-btn-background-ghost) {
  border-color: rgba(255, 250, 240, 0.32);
  color: #fffaf0;
}

.welcome-card__actions :deep(.ant-btn-text) {
  color: rgba(255, 250, 240, 0.68);
}

.welcome-card__art {
  position: absolute;
  right: -3rem;
  bottom: -2.5rem;
  width: 52%;
  height: 82%;
  opacity: 0.92;
}

.welcome-card__sun {
  position: absolute;
  top: 2.5rem;
  right: 4rem;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: #edc173;
  box-shadow: 0 0 80px rgba(237, 193, 115, 0.23);
}

.welcome-card__hill {
  position: absolute;
  right: -3rem;
  bottom: -8rem;
  width: 32rem;
  height: 18rem;
  border-radius: 50%;
}

.welcome-card__hill--back {
  background: #2b6654;
  transform: rotate(-9deg);
}

.welcome-card__hill--front {
  right: -7rem;
  bottom: -11rem;
  background: #1b4b3d;
  transform: rotate(8deg);
}

.welcome-card__art svg {
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 1rem;
  width: 100%;
}

.content-health {
  padding: 1.35rem;
}

.content-health__heading,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.content-health__heading p,
.section-heading p {
  margin: 0 0 0.35rem;
  color: var(--cms-muted);
  font-size: 0.57rem;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.content-health__heading h2,
.section-heading h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.content-health__signal {
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  color: #276d51;
  background: #e6f2e9;
  font-size: 0.62rem;
  font-weight: 650;
}

.content-health__signal--off {
  color: #9a681d;
  background: #fbf0d8;
}

.health-summary {
  margin-top: 1.25rem;
  border: 1px solid #e8ebe4;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background:
    radial-gradient(circle at 100% 0%, rgba(232, 182, 91, 0.12), transparent 9rem),
    #f8f9f4;
}

.health-summary__ratio {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.health-summary__ratio > span {
  color: var(--cms-muted);
  font-size: 0.62rem;
  font-weight: 650;
}

.health-summary__ratio strong {
  color: var(--cms-ink);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
  line-height: 0.9;
}

.health-summary__ratio small {
  margin-left: 0.1rem;
  color: var(--cms-muted);
  font-family: sans-serif;
  font-size: 0.62rem;
}

.health-summary__status {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 0.8rem;
  color: var(--cms-muted);
  font-size: 0.62rem;
}

.health-summary__status span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.health-summary__status strong {
  color: var(--cms-ink);
  font-size: 0.64rem;
}

.health-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
}

.health-dot--success {
  background: #4a8e70;
}

.health-dot--disabled {
  background: #d26952;
}

.health-summary__track {
  height: 0.42rem;
  overflow: hidden;
  margin-top: 0.75rem;
  border-radius: 999px;
  background: #e5e9e2;
}

.health-summary__track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2f7259, #79ac91);
}

.health-breakdown {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.health-breakdown__item {
  --health-color: #2f7259;
  display: flex;
  min-height: 2.35rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: 0.72rem;
  padding: 0.5rem 0.65rem;
  color: var(--cms-ink);
  background: color-mix(in srgb, var(--health-color) 7%, transparent);
  text-decoration: none;
  transition:
    background 180ms ease,
    transform 180ms ease;
}

.health-breakdown__item:hover {
  background: color-mix(in srgb, var(--health-color) 12%, transparent);
  transform: translateX(2px);
}

.health-breakdown__item--sage {
  --health-color: #72a58b;
}

.health-breakdown__item--sun {
  --health-color: #d5a047;
}

.health-breakdown__item--coral {
  --health-color: #d87259;
}

.health-breakdown__item--teal {
  --health-color: #4f8d87;
}

.health-breakdown__label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cms-muted);
  font-size: 0.68rem;
  font-weight: 620;
}

.health-breakdown__label i {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--health-color);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--health-color) 13%, transparent);
}

.health-breakdown__value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.22rem;
}

.health-breakdown__value strong {
  color: var(--cms-ink);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 550;
  line-height: 1;
}

.health-breakdown__value small {
  color: var(--cms-muted);
  font-size: 0.56rem;
}

.health-breakdown__value :deep(.anticon) {
  margin-left: 0.18rem;
  color: var(--health-color);
  font-size: 0.62rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  min-height: 9.6rem;
  padding: 1.15rem;
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card__icon {
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border-radius: 0.8rem;
}

.stat-card--forest .stat-card__icon {
  color: #276d51;
  background: #e5f1e9;
}

.stat-card--sun .stat-card__icon {
  color: #9a681d;
  background: #fbefd6;
}

.stat-card--coral .stat-card__icon {
  color: #b35340;
  background: #fce9e3;
}

.stat-card--sage .stat-card__icon {
  color: #3a7668;
  background: #e7f2ef;
}

.stat-card__meta {
  color: var(--cms-muted);
  font-size: 0.62rem;
}

.stat-card > strong {
  display: block;
  margin-top: 1.15rem;
  color: var(--cms-ink);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
  line-height: 1;
}

.stat-card > p {
  margin: 0.35rem 0 0;
  color: var(--cms-muted);
  font-size: 0.72rem;
}

.dashboard-lower {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 0.7fr);
  gap: 1rem;
  margin-top: 1rem;
}

.recent-albums,
.quick-panel {
  padding: 1.35rem;
}

.section-heading a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--cms-brand);
  font-size: 0.7rem;
  font-weight: 650;
  text-decoration: none;
}

.recent-albums__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.15rem;
}

.recent-album {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 0;
  border-radius: 0.9rem;
  padding: 0;
  background: #e6e5df;
  cursor: pointer;
}

.recent-album img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 450ms ease;
}

.recent-album:hover img {
  transform: scale(1.04);
}

.recent-album__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 30%, rgba(6, 24, 19, 0.8));
}

.recent-album__meta {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 0.9rem;
  color: white;
  text-align: left;
}

.recent-album__meta strong {
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 500;
}

.recent-album__meta small {
  margin-top: 0.18rem;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.58rem;
}

.recent-albums__loading {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.quick-panel {
  display: flex;
  flex-direction: column;
}

.quick-panel > button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  border: 0;
  border-top: 1px solid var(--cms-line);
  padding: 1rem 0;
  color: var(--cms-muted);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.quick-panel > button:first-of-type {
  margin-top: 0.8rem;
}

.quick-panel > button:hover strong {
  color: var(--cms-brand);
}

.quick-panel > button > span:nth-child(2) {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.quick-panel > button strong {
  color: var(--cms-ink);
  font-size: 0.76rem;
  transition: color 180ms ease;
}

.quick-panel > button small {
  margin-top: 0.18rem;
  color: var(--cms-muted);
  font-size: 0.62rem;
}

.quick-panel__icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 0.7rem;
}

.quick-panel__icon--green {
  color: #276d51;
  background: #e5f1e9;
}

.quick-panel__icon--sun {
  color: #9a681d;
  background: #fbefd6;
}

.quick-panel__icon--coral {
  color: #b35340;
  background: #fce9e3;
}

@media (max-width: 1180px) {
  .dashboard-grid,
  .dashboard-lower {
    grid-template-columns: 1fr;
  }

  .content-health {
    display: grid;
    grid-template-columns: minmax(10rem, 0.45fr) minmax(0, 1fr);
    align-items: center;
    gap: 1rem;
  }

  .content-health__heading {
    grid-column: 1 / -1;
  }

  .health-summary,
  .health-breakdown {
    margin-top: 0;
  }
}

@media (max-width: 820px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .welcome-card__art {
    width: 55%;
    opacity: 0.48;
  }
}

@media (max-width: 640px) {
  .dashboard-grid,
  .dashboard-lower {
    gap: 0.75rem;
  }

  .welcome-card {
    min-height: 20rem;
  }

  .welcome-card__art {
    right: -1.5rem;
    bottom: 1rem;
    width: 72%;
    height: 42%;
    opacity: 0.32;
  }

  .welcome-card__sun {
    width: 5.5rem;
    height: 5.5rem;
  }

  .content-health {
    display: block;
  }

  .stats-grid {
    gap: 0.75rem;
  }

  .stat-card {
    min-height: 8.8rem;
    padding: 0.95rem;
  }

  .recent-albums__grid {
    grid-template-columns: 1fr;
  }

  .recent-album {
    aspect-ratio: 16 / 9;
  }
}
</style>

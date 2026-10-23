<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { ensureCmsAntd } from '~/utils/ensureCmsAntd'
import {
  ExportOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

await ensureCmsAntd()

const cmsTheme = {
  token: {
    colorPrimary: '#17644f',
    colorInfo: '#17644f',
    colorSuccess: '#2f7d5c',
    colorWarning: '#d49735',
    colorError: '#d55d49',
    colorText: '#1d2f29',
    colorTextSecondary: '#68766f',
    colorBorder: '#e8e4da',
    colorBgContainer: '#fffdf8',
    colorBgLayout: '#f5f1e8',
    borderRadius: 12,
    borderRadiusLG: 18,
    fontFamily: '"Avenir Next", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
}

const route = useRoute()
const router = useRouter()
const { request } = useCmsApi()
const collapsed = ref(false)
const mobileOpen = ref(false)
const username = ref('admin')
const refreshing = ref(false)

const pageTitles: Record<string, string> = {
  '/': '内容概览',
  '/albums': '家庭相册',
  '/stories': '文字记录',
  '/videos': '旅行影像',
  '/banners': '页面横图',
}

pageTitles['/cms'] = '内容概览'
pageTitles['/cms/albums'] = '家庭相册'
pageTitles['/cms/stories'] = '文字记录'
pageTitles['/cms/videos'] = '旅行影像'
pageTitles['/cms/banners'] = '页面横图'

const currentTitle = computed(() => pageTitles[route.path] ?? 'Keepsake CMS')

useHead({
  titleTemplate: '%s · Keepsake CMS',
})

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})

onMounted(async () => {
  try {
    const session = await request<{ username: string | null }>('/api/cms/auth/session')
    username.value = session.username || 'admin'
  }
  catch {
    // The global middleware handles expired sessions.
  }
})

function refreshPage() {
  refreshing.value = true
  window.location.reload()
}

async function logout() {
  try {
    await request('/api/cms/auth/logout', { method: 'POST' })
  }
  finally {
    await router.push('/cms/login')
  }
}

async function handleUserMenu({ key }: { key: string }) {
  if (key === 'logout') {
    await logout()
  }
}
</script>

<template>
  <ClientOnly>
    <AConfigProvider
      :locale="zhCN"
      :theme="cmsTheme"
    >
      <div
        class="cms-frame"
        :class="{ 'cms-frame--collapsed': collapsed }"
      >
        <aside class="cms-sidebar">
          <div class="cms-sidebar__brand">
            <CmsBrandMark
              :compact="collapsed"
              light
            />
          </div>

          <CmsNavigation :collapsed="collapsed" />

          <div class="cms-sidebar__foot">
            <div class="cms-sidebar__signal">
              <span />
              <div v-if="!collapsed">
                <strong>uniCloud</strong>
                <small>云函数安全连接</small>
              </div>
            </div>
            <button
              type="button"
              class="cms-sidebar__collapsed-toggle"
              :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
              @click="collapsed = !collapsed"
            >
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </button>
          </div>
        </aside>

        <div class="cms-main">
          <header class="cms-header">
            <div class="cms-header__title">
              <button
                type="button"
                class="cms-mobile-menu"
                aria-label="打开导航"
                @click="mobileOpen = true"
              >
                <MenuOutlined />
              </button>
              <div>
                <p>Keepsake CMS</p>
                <strong>{{ currentTitle }}</strong>
              </div>
            </div>

            <div class="cms-header__actions">
              <a-tooltip title="刷新页面">
                <button
                  type="button"
                  class="cms-icon-button cms-header__desktop-action"
                  :disabled="refreshing"
                  @click="refreshPage"
                >
                  <ReloadOutlined :spin="refreshing" />
                </button>
              </a-tooltip>
              <a
                href="/"
                class="cms-site-link cms-header__desktop-action"
              >
                展厅
                <ExportOutlined />
              </a>
              <a-dropdown :trigger="['click']">
                <button
                  type="button"
                  class="cms-user-pill"
                >
                  <span class="cms-user-pill__avatar">
                    <UserOutlined />
                  </span>
                  <span class="cms-user-pill__copy">
                    <strong>{{ username }}</strong>
                    <small>Administrator</small>
                  </span>
                </button>
                <template #overlay>
                  <a-menu @click="handleUserMenu">
                    <a-menu-item key="logout">
                      <LogoutOutlined />
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </header>

          <main class="cms-content">
            <slot />
          </main>
        </div>

        <a-drawer
          v-model:open="mobileOpen"
          placement="left"
          :width="286"
          :closable="false"
          :body-style="{ padding: 0, background: '#153c32' }"
        >
          <div class="cms-mobile-drawer">
            <div class="cms-mobile-drawer__brand">
              <CmsBrandMark light />
            </div>
            <CmsNavigation @navigate="mobileOpen = false" />
            <div class="cms-mobile-drawer__foot">
              <span class="cms-sidebar__signal-icon" />
              已连接 Keepsake 云端内容
            </div>
          </div>
        </a-drawer>
      </div>
    </AConfigProvider>
  </ClientOnly>
</template>

<style src="~/assets/css/cms.css"></style>

<style scoped>
.cms-frame {
  min-height: 100vh;
  padding-left: 15.5rem;
  transition: padding-left 220ms ease;
}

.cms-frame--collapsed {
  padding-left: 5.25rem;
}

.cms-sidebar {
  position: fixed;
  z-index: 30;
  inset: 0 auto 0 0;
  display: flex;
  width: 15.5rem;
  flex-direction: column;
  padding: 1.2rem 1rem 1rem;
  color: #fffaf0;
  background:
    radial-gradient(circle at 18% 0%, rgba(232, 182, 91, 0.14), transparent 16rem),
    #153c32;
  transition: width 220ms ease;
}

.cms-frame--collapsed .cms-sidebar {
  width: 5.25rem;
}

.cms-sidebar__brand {
  display: flex;
  height: 4rem;
  align-items: center;
  padding-inline: 0.55rem;
}

.cms-frame--collapsed .cms-sidebar__brand {
  justify-content: center;
  padding-inline: 0;
}

.cms-sidebar__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  padding: 1rem 0.25rem 0.15rem;
}

.cms-sidebar__signal {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
  padding-left: 0.55rem;
}

.cms-sidebar__signal > span,
.cms-sidebar__signal-icon {
  width: 0.46rem;
  height: 0.46rem;
  flex: none;
  border-radius: 50%;
  background: #86c89c;
  box-shadow: 0 0 0 5px rgba(134, 200, 156, 0.1);
}

.cms-sidebar__signal div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.cms-sidebar__signal strong {
  color: #dbe8e2;
  font-size: 0.7rem;
}

.cms-sidebar__signal small {
  margin-top: 0.15rem;
  color: #819e93;
  font-size: 0.58rem;
}

.cms-sidebar__collapsed-toggle,
.cms-mobile-menu,
.cms-icon-button {
  display: grid;
  flex: none;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.cms-sidebar__collapsed-toggle {
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  color: #91a89f;
}

.cms-sidebar__collapsed-toggle:hover {
  color: #fffaf0;
  background: rgba(255, 255, 255, 0.08);
}

.cms-main {
  min-width: 0;
}

.cms-header {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  height: 5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--cms-line);
  padding-inline: clamp(1rem, 2.5vw, 2.2rem);
  background: rgba(245, 241, 232, 0.88);
  backdrop-filter: blur(18px);
}

.cms-header__title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.cms-header__title div {
  display: flex;
  flex-direction: column;
}

.cms-header__title p {
  margin: 0 0 0.15rem;
  color: var(--cms-muted);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cms-header__title strong {
  color: var(--cms-ink);
  font-size: 0.92rem;
}

.cms-header__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.cms-mobile-menu {
  display: none;
  width: 2.55rem;
  height: 2.55rem;
  border: 1px solid var(--cms-line);
  border-radius: 0.75rem;
  color: var(--cms-ink);
  background: var(--cms-surface);
}

.cms-icon-button {
  width: 2.55rem;
  height: 2.55rem;
  border: 1px solid var(--cms-line);
  border-radius: 0.8rem;
  color: var(--cms-muted);
  background: var(--cms-surface);
}

.cms-site-link {
  display: inline-flex;
  height: 2.55rem;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--cms-line);
  border-radius: 0.8rem;
  padding-inline: 0.9rem;
  color: var(--cms-ink);
  background: var(--cms-surface);
  font-size: 0.74rem;
  font-weight: 650;
  text-decoration: none;
}

.cms-user-pill {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.cms-user-pill__avatar {
  display: grid;
  width: 2.55rem;
  height: 2.55rem;
  place-items: center;
  border-radius: 50%;
  color: #fffaf0;
  background: var(--cms-brand);
}

.cms-user-pill__copy {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.cms-user-pill__copy strong {
  color: var(--cms-ink);
  font-size: 0.76rem;
}

.cms-user-pill__copy small {
  color: var(--cms-muted);
  font-size: 0.58rem;
}

.cms-content {
  padding: clamp(1.2rem, 2.5vw, 2.2rem);
}

.cms-mobile-drawer {
  min-height: 100%;
  padding: 1.35rem 1.1rem;
}

.cms-mobile-drawer__brand {
  margin-bottom: 1.25rem;
  padding: 0 0.45rem;
}

.cms-mobile-drawer__foot {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0.45rem;
  color: #8fa99f;
  font-size: 0.68rem;
}

@media (max-width: 1024px) {
  .cms-frame,
  .cms-frame--collapsed {
    padding-left: 0;
  }

  .cms-sidebar {
    display: none;
  }

  .cms-mobile-menu {
    display: grid;
  }
}

@media (max-width: 640px) {
  .cms-header {
    height: 4.25rem;
    padding-inline: 0.85rem;
  }

  .cms-header__desktop-action,
  .cms-user-pill__copy {
    display: none;
  }

  .cms-content {
    padding: 1rem 0.75rem 2rem;
  }
}
</style>

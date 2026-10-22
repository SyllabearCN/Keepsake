<script setup lang="ts">
import {
  AppstoreOutlined,
  FileTextOutlined,
  HomeOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue'

withDefaults(defineProps<{
  collapsed?: boolean
}>(), {
  collapsed: false,
})

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()

const items = [
  { path: '/cms', label: '内容概览', icon: HomeOutlined },
  { path: '/cms/albums', label: '家庭相册', icon: PictureOutlined },
  { path: '/cms/stories', label: '文字记录', icon: FileTextOutlined },
  { path: '/cms/videos', label: '旅行影像', icon: VideoCameraOutlined },
  { path: '/cms/banners', label: '页面横图', icon: AppstoreOutlined },
]

function active(path: string) {
  if (path === '/cms') {
    return route.path === '/cms'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav
    class="admin-navigation"
    aria-label="后台主导航"
  >
    <p
      v-if="!collapsed"
      class="admin-navigation__label"
    >
      CONTENT
    </p>
    <NuxtLink
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      class="admin-navigation__item"
      :class="{ 'admin-navigation__item--active': active(item.path) }"
      :title="collapsed ? item.label : undefined"
      @click="emit('navigate')"
    >
      <component
        :is="item.icon"
        class="admin-navigation__icon"
      />
      <span v-if="!collapsed">{{ item.label }}</span>
    </NuxtLink>

    <p
      v-if="!collapsed"
      class="admin-navigation__label admin-navigation__label--secondary"
    >
      QUICK LINK
    </p>
    <NuxtLink
      v-if="!collapsed"
      to="/"
      class="admin-navigation__item admin-navigation__item--soft"
    >
      <span class="admin-navigation__site-dot" />
      <span>展厅</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.admin-navigation {
  display: grid;
  gap: 0.35rem;
}

.admin-navigation__label {
  margin: 0.85rem 0.85rem 0.35rem;
  color: #aab8b1;
  font-size: 0.56rem;
  font-weight: 750;
  letter-spacing: 0.16em;
}

.admin-navigation__label--secondary {
  margin-top: 1.5rem;
}

.admin-navigation__item {
  display: flex;
  min-height: 2.85rem;
  align-items: center;
  gap: 0.8rem;
  border-radius: 0.75rem;
  padding: 0.65rem 0.85rem;
  color: #c2d0ca;
  font-size: 0.84rem;
  font-weight: 560;
  text-decoration: none;
  transition: color 180ms ease, background 180ms ease, transform 180ms ease;
}

.admin-navigation__item:hover {
  color: #fffaf0;
  background: rgba(255, 255, 255, 0.065);
  transform: translateX(2px);
}

.admin-navigation__item--active {
  color: #163d32;
  background: #f0c878;
  box-shadow: 0 8px 22px rgba(237, 183, 90, 0.13);
}

.admin-navigation__item--active:hover {
  color: #163d32;
  background: #f4d28c;
}

.admin-navigation__icon {
  width: 1rem;
  height: 1rem;
  flex: none;
}

.admin-navigation__item--soft {
  margin-top: 0.35rem;
  color: #9fb3aa;
}

.admin-navigation__site-dot {
  width: 0.42rem;
  height: 0.42rem;
  flex: none;
  border-radius: 50%;
  background: #ef8d70;
  box-shadow: 0 0 0 4px rgba(239, 141, 112, 0.1);
}
</style>

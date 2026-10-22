<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const links = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/gallery', label: t('nav.gallery') },
  { to: '/journeys', label: t('nav.journeys') },
  { to: '/stories', label: t('nav.stories') },
  { to: '/about', label: t('nav.about') },
])

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
    <div class="page-shell glass flex h-[4.35rem] items-center rounded-full px-4 sm:px-5">
      <FamilyMark />

      <nav class="ml-auto hidden items-center gap-1 lg:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="app-nav-link"
          :class="{ 'app-nav-link--active': isActive(link.to) }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2 lg:ml-4">
        <NuxtLink
          to="/cms"
          class="inline-flex h-10 items-center rounded-full border border-[var(--line)] px-3.5 text-[0.72rem] font-semibold text-muted transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
        >
          管理系统
        </NuxtLink>
        <ThemeToggle class="hidden sm:grid" />
        <LocaleSwitcher class="hidden sm:grid" />
        <MobileNav />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-nav-link {
  border-radius: 999px;
  padding: 0.5rem 1rem;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.app-nav-link:hover {
  color: var(--text);
  background: var(--surface-strong);
}

.app-nav-link--active,
.app-nav-link--active:hover {
  color: var(--nav-active-text) !important;
  background: var(--nav-active-bg) !important;
  box-shadow: inset 0 0 0 1px rgba(219, 233, 223, 0.14);
}
</style>

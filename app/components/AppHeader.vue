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
          class="rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-colors"
          :class="isActive(link.to)
            ? 'bg-[var(--brand)] text-[var(--page)]'
            : 'text-muted hover:bg-[var(--surface-strong)] hover:text-[var(--text)]'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2 lg:ml-4">
        <ThemeToggle class="hidden sm:grid" />
        <LocaleSwitcher class="hidden sm:grid" />
        <MobileNav />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({
  bodyAttrs: {
    class: 'antialiased',
  },
})

useSeoMeta({
  ogSiteName: 'Keepsake · 我们仨',
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      key: 'keepsake-structured-data',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Keepsake · 我们仨',
        'description': t('home.intro'),
        'inLanguage': 'zh-CN',
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen">
    <NuxtLoadingIndicator color="var(--accent)" />
    <AppHeader />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

useHead({
  bodyAttrs: {
    class: 'antialiased',
  },
})

useSeoMeta({
  ogSiteName: computed(() => t('brand.name')),
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  titleTemplate: `%s · ${t('brand.name')}`,
  htmlAttrs: {
    lang: locale.value,
  },
  script: [
    {
      key: 'keepsake-structured-data',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': t('brand.name'),
        'description': t('home.intro'),
        'inLanguage': locale.value,
      }),
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

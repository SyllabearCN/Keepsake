<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
  }
}>()

const { t } = useI18n()

useSeoMeta({
  title: `404 · ${props.error.statusMessage ?? 'Not found'}`,
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="page-shell grid min-h-[82svh] place-items-center pt-32 text-center">
      <div>
        <p class="display text-[clamp(7rem,25vw,18rem)] leading-[0.7] text-[var(--brand)] opacity-15">
          {{ error.statusCode }}
        </p>
        <p class="display -mt-2 text-4xl">
          {{ error.statusMessage ?? 'Page not found' }}
        </p>
        <NuxtLink
          to="/"
          class="pill-button mt-8 bg-[var(--brand)] text-[var(--page)]"
        >
          {{ t('common.backHome') }}
          <Icon
            name="lucide:arrow-right"
            class="size-4"
          />
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { StorySummary } from '~/types/content'

defineProps<{
  story: StorySummary
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink
    :to="story.path"
    class="group surface-card flex h-full min-h-0 flex-col overflow-hidden rounded-[1.2rem] transition-transform duration-300 hover:-translate-y-1"
  >
    <div class="image-reveal aspect-[16/8] bg-[var(--surface-strong)]">
      <img
        :src="story.cover"
        :alt="story.title"
        width="1600"
        height="1000"
        loading="lazy"
        class="h-full w-full object-cover"
      >
    </div>

    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p class="text-[0.59rem] font-bold uppercase tracking-[0.14em] text-muted">
        {{ story.category }} · {{ story.date }}
      </p>
      <h3 class="display mt-3 text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.12]">
        {{ story.title }}
      </h3>
      <p class="mt-2 line-clamp-2 text-xs leading-5 text-muted">
        {{ story.description }}
      </p>
      <span class="mt-auto inline-flex items-center gap-2 pt-5 text-[0.68rem] font-semibold">
        {{ story.readingTime ?? 4 }} {{ t('stories.minuteRead') }}
        <Icon
          name="lucide:arrow-right"
          class="size-3.5 text-[var(--accent)] transition-transform group-hover:translate-x-1"
        />
      </span>
    </div>
  </NuxtLink>
</template>

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
    class="group relative block aspect-[16/9] overflow-hidden rounded-[1.35rem] bg-[var(--surface-strong)]"
  >
    <img
      :src="story.cover"
      :alt="story.title"
      width="1600"
      height="1000"
      loading="eager"
      class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
    >
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
    <span class="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
      {{ story.category }}
    </span>

    <div class="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
      <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-white/58">
        {{ story.date }} · {{ story.readingTime ?? 4 }} {{ t('stories.minuteRead') }}
      </p>
      <h2 class="display mt-3 text-[clamp(1.8rem,3.2vw,2.7rem)] leading-[1.06]">
        {{ story.title }}
      </h2>
      <p class="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-white/68">
        {{ story.description }}
      </p>
    </div>
  </NuxtLink>
</template>

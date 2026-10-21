<script setup lang="ts">
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const route = useRoute()
const { t } = useI18n()
const { media } = await useMediaLibrary()

const { data: story } = await useAsyncData(`story-${route.path}`, () => {
  return queryCollection('stories').path(route.path).first()
})

const { data: allStories } = await useAsyncData('story-cover-order', () => {
  return queryCollection('stories').order('date', 'DESC').all()
})

if (!story.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('stories.notFound'),
  })
}

const storyIndex = computed(() => {
  return (allStories.value ?? []).findIndex(item => item.path === route.path)
})
const storyCover = computed(() => {
  return media.value.storyCovers[storyIndex.value]?.src ?? '/icons/media-placeholder.svg'
})

useSeoMeta({
  title: story.value.title,
  description: story.value.description,
  ogImage: storyCover.value,
  ogType: 'article',
})
</script>

<template>
  <article v-if="story">
    <header class="page-shell pt-36 sm:pt-44">
      <NuxtLink
        to="/stories"
        class="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-[var(--text)]"
      >
        <Icon
          name="lucide:arrow-left"
          class="size-4"
        />
        {{ t('nav.stories') }}
      </NuxtLink>

      <div class="mx-auto mt-10 max-w-5xl text-center">
        <p class="text-[0.64rem] font-bold uppercase tracking-[0.17em] text-[var(--accent)]">
          {{ story.category }} · {{ story.date.replaceAll('-', '.') }}
        </p>
        <h1 class="display mx-auto mt-6 max-w-4xl text-[clamp(2.35rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.04em]">
          {{ story.title }}
        </h1>
        <p class="mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
          {{ story.description }}
        </p>
      </div>

      <div class="mt-12 overflow-hidden rounded-[1.8rem] bg-[var(--surface-strong)] sm:mt-16">
        <img
          :src="storyCover"
          :alt="story.title"
          width="2000"
          height="1200"
          class="max-h-[72svh] w-full object-cover"
          loading="eager"
        >
      </div>
    </header>

    <section class="page-shell pb-20 pt-14 sm:pt-20">
      <ContentRenderer
        :value="story"
        class="prose-keepsake"
      />

      <div class="mx-auto mt-16 flex max-w-[46rem] items-center justify-between border-t border-[var(--line)] pt-7">
        <NuxtLink
          to="/stories"
          class="pill-button border border-[var(--line)]"
        >
          <Icon
            name="lucide:arrow-left"
            class="size-4"
          />
          {{ t('nav.stories') }}
        </NuxtLink>
        <span class="text-xs text-muted">{{ story.date }}</span>
      </div>
    </section>
  </article>
</template>

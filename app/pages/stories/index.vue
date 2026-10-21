<script setup lang="ts">
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const { media } = await useMediaLibrary()

useSeoMeta({
  title: t('stories.title'),
  description: t('stories.intro'),
})

const { data: stories } = await useAsyncData('all-stories', () => {
  return queryCollection('stories').order('date', 'DESC').all()
})

const storiesWithCovers = computed(() => (stories.value ?? []).map((story, index) => ({
  ...story,
  cover: media.value.storyCovers[index]?.src ?? '/icons/media-placeholder.svg',
})))
const featuredStory = computed(() => storiesWithCovers.value[0])
const remainingStories = computed(() => storiesWithCovers.value.slice(1))
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('stories.eyebrow')"
      :title="t('stories.title')"
      :intro="t('stories.intro')"
    />

    <section class="page-shell py-10 sm:py-16">
      <StoryCard
        v-if="featuredStory"
        :story="featuredStory"
        featured
        class="mb-10"
      />

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StoryCard
          v-for="story in remainingStories"
          :key="story.path"
          :story="story"
        />
      </div>

      <div class="mt-16 flex items-start gap-4 rounded-[1.5rem] border border-dashed border-[var(--line)] p-6 sm:p-8">
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-strong)]">
          <Icon
            name="lucide:file-plus-2"
            class="size-4"
          />
        </span>
        <div>
          <p class="text-sm font-bold">
            {{ t('stories.newArticle') }}
          </p>
          <p class="mt-1 text-sm leading-6 text-muted">
            {{ t('stories.newArticleText') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

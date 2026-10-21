<script setup lang="ts">
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const { media } = await useMediaLibrary()
const preferences = usePreferencesStore()

const storyView = computed({
  get: () => preferences.storyView,
  set: value => preferences.setStoryView(value),
})

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
const compactStories = computed(() => storiesWithCovers.value.slice(1, 3))
const remainingStories = computed(() => storiesWithCovers.value.slice(3))
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('stories.eyebrow')"
      :title="t('stories.title')"
      :intro="t('stories.intro')"
    />

    <section class="page-shell pb-16 pt-4 sm:pb-20 sm:pt-6">
      <div class="mb-8 flex justify-end">
        <ViewModeToggle v-model="storyView" />
      </div>

      <div
        v-if="storyView === 'grid'"
        class="mx-auto max-w-6xl"
      >
        <p class="eyebrow">
          {{ t('stories.featured') }}
        </p>

        <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)]">
          <FeaturedStoryCard
            v-if="featuredStory"
            :story="featuredStory"
          />
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StoryCompactCard
              v-for="story in compactStories"
              :key="story.path"
              :story="story"
            />
          </div>
        </div>

        <template v-if="remainingStories.length">
          <p class="eyebrow mt-12">
            {{ t('stories.allArticles') }}
          </p>
          <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StoryCard
              v-for="story in remainingStories"
              :key="story.path"
              :story="story"
            />
          </div>
        </template>
      </div>

      <div
        v-else
        class="story-timeline mx-auto max-w-6xl"
      >
        <StoryTimelineItem
          v-for="(story, index) in storiesWithCovers"
          :key="story.path"
          :story="story"
          :index="index"
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

<style scoped>
.story-timeline {
  position: relative;
  display: grid;
  gap: 2rem;
}

.story-timeline::before {
  position: absolute;
  top: 0.75rem;
  bottom: 1rem;
  left: 0.55rem;
  width: 1px;
  background: linear-gradient(var(--sun), var(--line) 20%, var(--line) 80%, transparent);
  content: "";
}

@media (min-width: 768px) {
  .story-timeline::before {
    left: 9.57rem;
  }
}
</style>

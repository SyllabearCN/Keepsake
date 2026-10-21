<script setup lang="ts">
import type { Journey } from '~/types/content'
import { journeys } from '~/data/journeys'
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const { media } = await useMediaLibrary()
const preferences = usePreferencesStore()

const journeyView = computed({
  get: () => preferences.journeyView,
  set: value => preferences.setJourneyView(value),
})

const journeyCards = computed(() => journeys.map((journey, index) => ({
  ...journey,
  cover: media.value.journeyCovers[index]?.src ?? '/icons/media-placeholder.svg',
})))

useSeoMeta({
  title: t('journeys.title'),
  description: t('journeys.intro'),
})

const activeJourney = ref<Journey | null>(null)
const videoOpen = ref(false)

function openJourney(journey: Journey) {
  activeJourney.value = journey
  videoOpen.value = true
}
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('journeys.eyebrow')"
      :title="t('journeys.title')"
      :intro="t('journeys.intro')"
      compact
    />

    <section class="page-shell pb-16 pt-4 sm:pb-20 sm:pt-6">
      <div class="mx-auto max-w-6xl">
        <div class="mb-8 flex justify-end">
          <ViewModeToggle v-model="journeyView" />
        </div>

        <div
          v-if="journeyView === 'grid'"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <JourneyGridItem
            v-for="journey in journeyCards"
            :key="journey.id"
            :journey="journey"
            :cover="journey.cover"
            @open="openJourney"
          />
        </div>

        <div
          v-else
          class="timeline"
        >
          <JourneyTimelineItem
            v-for="(journey, index) in journeyCards"
            :key="journey.id"
            :journey="journey"
            :cover="journey.cover"
            :index="index"
            @open="openJourney"
          />
        </div>
      </div>
    </section>

    <VideoDialog
      v-model:open="videoOpen"
      :journey="activeJourney"
    />
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  gap: 2rem;
}

.timeline::before {
  position: absolute;
  top: 0.75rem;
  bottom: 1rem;
  left: 0.55rem;
  width: 1px;
  background: linear-gradient(var(--accent), var(--line) 18%, var(--line) 82%, transparent);
  content: "";
}

@media (min-width: 768px) {
  .timeline::before {
    left: 9.57rem;
  }
}
</style>

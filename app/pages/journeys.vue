<script setup lang="ts">
import type { Journey } from '~/types/content'
import { journeys } from '~/data/journeys'

const { t } = useI18n()

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
    />

    <section class="page-shell py-10 sm:py-16">
      <div class="grid gap-10 lg:grid-cols-2">
        <JourneyCard
          v-for="(journey, index) in journeys"
          :key="journey.id"
          :journey="journey"
          :large="index === 0"
          :class="index === 0 ? 'lg:col-span-2' : ''"
          @open="openJourney"
        />
      </div>

      <div class="mt-16 flex flex-col gap-5 rounded-[1.5rem] border border-[var(--line)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div class="flex items-start gap-4">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)]">
            <Icon
              name="lucide:code-xml"
              class="size-4"
            />
          </span>
          <div>
            <p class="text-sm font-bold">
              Bilibili
            </p>
            <p class="mt-1 text-sm leading-6 text-muted">
              {{ t('journeys.replaceHint') }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="https://www.bilibili.com"
          target="_blank"
          rel="noopener noreferrer"
          class="pill-button shrink-0 border border-[var(--line)]"
        >
          {{ t('journeys.watchOnBilibili') }}
          <Icon
            name="lucide:arrow-up-right"
            class="size-4"
          />
        </NuxtLink>
      </div>
    </section>

    <VideoDialog
      v-model:open="videoOpen"
      :journey="activeJourney"
    />
  </div>
</template>

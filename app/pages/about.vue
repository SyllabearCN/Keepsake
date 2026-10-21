<script setup lang="ts">
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const { media } = await useMediaLibrary()

useSeoMeta({
  title: t('about.title'),
  description: t('about.intro'),
})

const members = computed(() => [
  {
    number: '01',
    role: 'PAPA',
    text: t('about.memberOne'),
    color: '#e8b65b',
    photo: media.value.aboutPhotos[0],
  },
  {
    number: '02',
    role: 'MAMA',
    text: t('about.memberTwo'),
    color: '#ef795c',
    photo: media.value.aboutPhotos[1],
  },
  {
    number: '03',
    role: 'KIDDO',
    text: t('about.memberThree'),
    color: '#8db9a5',
    photo: media.value.aboutPhotos[2],
  },
])

const timeline = computed(() => [
  {
    year: '2023',
    title: t('about.timelineOneTitle'),
    text: t('about.timelineOneText'),
  },
  {
    year: '2026',
    title: t('about.timelineTwoTitle'),
    text: t('about.timelineTwoText'),
  },
  {
    year: '2026',
    title: t('about.timelineThreeTitle'),
    text: t('about.timelineThreeText'),
  },
])
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('about.eyebrow')"
      :title="t('about.title')"
      :intro="t('about.intro')"
    />

    <section class="page-shell py-12 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-32">
          <p class="eyebrow">
            OUR STORY
          </p>
          <h2 class="display mt-6 text-[clamp(2.15rem,4.5vw,3.25rem)] leading-[1.04]">
            {{ t('about.storyTitle') }}
          </h2>
          <div class="mt-7 space-y-5 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            <p>{{ t('about.storyOne') }}</p>
            <p>{{ t('about.storyTwo') }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div
            v-for="member in members"
            :key="member.number"
            class="surface-card overflow-hidden rounded-[1.5rem]"
          >
            <div class="image-reveal relative aspect-[4/5] overflow-hidden bg-[var(--surface-strong)]">
              <img
                :src="member.photo?.src ?? '/icons/media-placeholder.svg'"
                :alt="member.role"
                :width="member.photo?.width"
                :height="member.photo?.height"
                loading="lazy"
                class="h-full w-full object-cover"
              >
              <span class="absolute left-5 top-5 grid size-9 place-items-center rounded-full border border-white/25 bg-black/35 text-[0.62rem] font-bold tracking-[0.12em] text-white backdrop-blur-sm">
                {{ member.number }}
              </span>
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex items-center gap-3">
                <span
                  class="block size-3 rounded-full"
                  :style="{ backgroundColor: member.color }"
                />
                <p class="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted">
                  {{ member.role }}
                </p>
              </div>
              <p class="mt-4 text-sm leading-6">
                {{ member.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface-strong)] py-20 sm:py-28">
      <div class="page-shell">
        <div class="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="eyebrow">
              TIMELINE
            </p>
            <h2 class="display mt-6 text-[clamp(2.15rem,4.5vw,3.25rem)] leading-[1.04]">
              {{ t('about.timelineTitle') }}
            </h2>
          </div>
          <p class="max-w-md text-sm leading-7 text-muted">
            {{ t('home.quoteNote') }}
          </p>
        </div>

        <div class="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] bg-[var(--line)] md:grid-cols-3">
          <div
            v-for="item in timeline"
            :key="item.year"
            class="bg-[var(--surface-solid)] p-6 sm:p-8"
          >
            <p class="display text-4xl text-[var(--accent)] sm:text-5xl">
              {{ item.year }}
            </p>
            <h3 class="mt-12 text-lg font-bold">
              {{ item.title }}
            </h3>
            <p class="mt-3 text-sm leading-7 text-muted">
              {{ item.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell py-20 sm:py-28">
      <SectionHeading
        eyebrow="UNDER THE HOOD"
        :title="t('about.techTitle')"
        align="center"
      />

      <div class="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        <div
          v-for="(item, index) in [t('about.techOne'), t('about.techTwo'), t('about.techThree')]"
          :key="item"
          class="surface-card rounded-[1.3rem] p-6"
        >
          <span class="text-[0.62rem] font-bold tracking-[0.15em] text-muted">0{{ index + 1 }}</span>
          <p class="mt-10 text-sm leading-7">
            {{ item }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

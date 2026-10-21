<script setup lang="ts">
import { motion } from 'motion-v'
import type { Journey } from '~/types/content'
import { journeys } from '~/data/journeys'
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const { media } = await useMediaLibrary()
const router = useRouter()
const preferences = usePreferencesStore()

useSeoMeta({
  title: '我们仨的家庭记忆簿',
  description: t('home.intro'),
})

const { data: stories } = await useAsyncData('home-stories', () => {
  return queryCollection('stories').order('date', 'DESC').all()
})

const albumCountLabel = computed(() => String(media.value.albums.length).padStart(2, '0'))
const featuredAlbums = computed(() => media.value.albums.slice(0, 3).flatMap((album) => {
  const photos = media.value.gallery.filter(photo => photo.album === album.id)
  return photos[0]
    ? [{ album, cover: photos[0]!, photoCount: photos.length }]
    : []
}))
const journeyCards = computed(() => journeys.map((journey, index) => ({
  ...journey,
  cover: media.value.journeyCovers[index]?.src ?? '/icons/media-placeholder.svg',
})))
const latestStories = computed(() => (stories.value ?? []).slice(0, 3).map((story, index) => ({
  ...story,
  cover: media.value.storyCovers[index]?.src ?? '/icons/media-placeholder.svg',
})))
const featuredJourneys = computed(() => journeyCards.value.filter(journey => journey.featured))
const heroBanner = computed(() => media.value.banners[0])
const heroBannerSrc = computed(() => heroBanner.value?.src ?? '/icons/media-placeholder.svg')

const activeJourney = ref<Journey | null>(null)
const videoOpen = ref(false)

async function openAlbum(albumId: string) {
  preferences.galleryAlbum = albumId
  await router.push('/gallery')
}

function openJourney(journey: Journey) {
  activeJourney.value = journey
  videoOpen.value = true
}
</script>

<template>
  <div>
    <section class="relative min-h-[48rem] overflow-hidden bg-[#102c26] text-white sm:min-h-[54rem] lg:min-h-[100svh]">
      <img
        :src="heroBannerSrc"
        alt="山谷与暮色中的风景"
        :width="heroBanner?.width ?? 1600"
        :height="heroBanner?.height ?? 1000"
        loading="eager"
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover"
      >
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,23,19,.24)_0%,rgba(6,23,19,.1)_35%,rgba(6,23,19,.88)_100%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(232,182,91,.16),transparent_24rem)]" />

      <div class="page-shell relative flex min-h-[48rem] flex-col pb-8 pt-32 sm:min-h-[54rem] sm:pt-36 lg:min-h-[100svh]">
        <motion.div
          :initial="{ opacity: 0, y: 24 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }"
          class="mt-auto max-w-6xl"
        >
          <p class="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/72">
            <span class="h-px w-8 bg-[#e8b65b]" />
            {{ t('home.eyebrow') }}
          </p>

          <h1 class="display mt-7 whitespace-pre-line text-[clamp(2.25rem,6vw,3.25rem)] leading-[1.06] tracking-[-0.045em] text-[#fffaf0]">
            {{ t('home.heroTitle') }}
          </h1>

          <div class="mt-9 grid gap-7 sm:grid-cols-[minmax(0,39rem)_auto] sm:items-end">
            <p class="max-w-2xl text-sm leading-7 text-white/70 sm:text-[0.98rem] sm:leading-8">
              {{ t('home.intro') }}
            </p>
            <div class="flex flex-wrap gap-3 sm:justify-end">
              <NuxtLink
                to="/gallery"
                class="pill-button bg-[#f5efe2] text-[#173b33] hover:bg-white"
              >
                {{ t('home.primaryCta') }}
                <Icon
                  name="lucide:images"
                  class="size-4"
                />
              </NuxtLink>
              <NuxtLink
                to="/journeys"
                class="pill-button border border-white/25 bg-white/8 text-white backdrop-blur-sm hover:bg-white/15"
              >
                {{ t('home.secondaryCta') }}
                <Icon
                  name="lucide:play"
                  class="size-4"
                />
              </NuxtLink>
            </div>
          </div>
        </motion.div>

        <div class="mt-12 flex items-end justify-between gap-4 border-t border-white/16 pt-5 sm:mt-16">
          <div class="flex items-center gap-3 text-white/55">
            <span class="grid size-8 place-items-center rounded-full border border-white/20">
              <Icon
                name="lucide:arrow-down"
                class="size-3.5"
              />
            </span>
            <span class="text-[0.61rem] font-bold uppercase tracking-[0.18em]">
              {{ t('home.scroll') }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-[var(--line)]">
      <div class="page-shell grid grid-cols-3 divide-x divide-[var(--line)] py-7 sm:py-9">
        <div class="pr-3 text-center">
          <p class="display text-3xl sm:text-5xl">
            {{ albumCountLabel }}
          </p>
          <p class="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.65rem]">
            {{ t('home.statsAlbums') }}
          </p>
        </div>
        <div class="px-3 text-center">
          <p class="display text-3xl sm:text-5xl">
            {{ String(journeyCards.length).padStart(2, '0') }}
          </p>
          <p class="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.65rem]">
            {{ t('home.statsTrips') }}
          </p>
        </div>
        <div class="pl-3 text-center">
          <p class="display text-3xl sm:text-5xl">
            {{ String(latestStories.length).padStart(2, '0') }}
          </p>
          <p class="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.65rem]">
            {{ t('home.statsStories') }}
          </p>
        </div>
      </div>
    </section>

    <section class="page-shell py-20 sm:py-28">
      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          :eyebrow="t('home.albumEyebrow')"
          :title="t('home.albumTitle')"
          :intro="t('home.albumIntro')"
        />
        <NuxtLink
          to="/gallery"
          class="pill-button self-start border border-[var(--line)] md:self-auto"
        >
          {{ t('common.viewAll') }}
          <Icon
            name="lucide:arrow-up-right"
            class="size-4"
          />
        </NuxtLink>
      </div>

      <div
        v-if="featuredAlbums.length"
        class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <AlbumCard
          v-for="card in featuredAlbums"
          :key="card.album.id"
          :album="card.album"
          :cover="card.cover"
          :photo-count="card.photoCount"
          @select="openAlbum"
        />
      </div>
      <p
        v-else
        class="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-muted"
      >
        {{ t('gallery.noAlbums') }}
      </p>
    </section>

    <section class="overflow-hidden bg-[var(--surface-strong)] py-20 sm:py-28">
      <div class="page-shell">
        <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            :eyebrow="t('home.journeyEyebrow')"
            :title="t('home.journeyTitle')"
            :intro="t('home.journeyIntro')"
          />
          <NuxtLink
            to="/journeys"
            class="pill-button self-start border border-[var(--line)] md:self-auto"
          >
            {{ t('common.viewAll') }}
            <Icon
              name="lucide:arrow-up-right"
              class="size-4"
            />
          </NuxtLink>
        </div>

        <div class="mt-12 grid gap-8 lg:grid-cols-2">
          <JourneyCard
            v-for="journey in featuredJourneys"
            :key="journey.id"
            :journey="journey"
            :cover="journey.cover"
            large
            @open="openJourney"
          />
        </div>
      </div>
    </section>

    <section class="page-shell py-20 sm:py-28">
      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          :eyebrow="t('home.storiesEyebrow')"
          :title="t('home.storiesTitle')"
          :intro="t('home.storyIntro')"
        />
        <NuxtLink
          to="/stories"
          class="pill-button self-start border border-[var(--line)] md:self-auto"
        >
          {{ t('common.viewAll') }}
          <Icon
            name="lucide:arrow-up-right"
            class="size-4"
          />
        </NuxtLink>
      </div>

      <div class="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StoryCard
          v-for="story in latestStories"
          :key="story.path"
          :story="story"
        />
      </div>
    </section>

    <section class="page-shell pb-4">
      <div class="relative overflow-hidden rounded-[2rem] bg-[var(--brand)] px-6 py-20 text-center text-[var(--page)] sm:px-12 sm:py-28">
        <div class="absolute -left-16 -top-20 size-72 rounded-full border border-current/10" />
        <div class="absolute -bottom-36 -right-20 size-96 rounded-full border border-current/10" />
        <div class="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
        <div class="relative">
          <p class="eyebrow justify-center !text-current/55">
            {{ t('home.since') }}
          </p>
          <p class="display mx-auto mt-8 max-w-4xl whitespace-pre-line text-[clamp(2.1rem,5vw,3.25rem)] leading-[1.08]">
            {{ t('home.quote') }}
          </p>
          <p class="mt-7 text-sm text-current/55">
            {{ t('home.quoteNote') }}
          </p>
        </div>
      </div>
    </section>

    <VideoDialog
      v-model:open="videoOpen"
      :journey="activeJourney"
    />
  </div>
</template>

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

const technologyStack = computed(() => [
  {
    number: '01',
    title: t('about.stackFrontendTitle'),
    text: t('about.stackFrontendText'),
    href: 'https://nuxt.com',
  },
  {
    number: '02',
    title: t('about.stackDesignTitle'),
    text: t('about.stackDesignText'),
    href: 'https://tailwindcss.com',
  },
  {
    number: '03',
    title: t('about.stackCloudTitle'),
    text: t('about.stackCloudText'),
    href: 'https://unicloud.dcloud.net.cn',
  },
  {
    number: '04',
    title: t('about.stackContentTitle'),
    text: t('about.stackContentText'),
    href: 'https://content.nuxt.com',
  },
  {
    number: '05',
    title: t('about.stackInteractionTitle'),
    text: t('about.stackInteractionText'),
    href: 'https://pinia.vuejs.org',
  },
  {
    number: '06',
    title: t('about.stackDeliveryTitle'),
    text: t('about.stackDeliveryText'),
    href: 'https://vercel.com',
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
              <DeferredImage
                :src="member.photo?.src ?? '/icons/media-placeholder.svg'"
                :alt="member.role"
                :width="member.photo?.width"
                :height="member.photo?.height"
                class="h-full w-full object-cover"
              />
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
        <SectionHeading
          eyebrow="TECH STACK & OPEN SOURCE"
          :title="t('about.stackTitle')"
          :intro="t('about.stackIntro')"
        />

        <div class="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-3">
          <a
            v-for="item in technologyStack"
            :key="item.number"
            :href="item.href"
            target="_blank"
            rel="noreferrer"
            class="group bg-[var(--surface-solid)] p-6 transition-colors hover:bg-[var(--page)] sm:p-8"
          >
            <div class="flex items-start justify-between gap-5">
              <span class="text-[0.62rem] font-bold tracking-[0.15em] text-muted">
                {{ item.number }}
              </span>
              <Icon
                name="lucide:arrow-up-right"
                class="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
              />
            </div>
            <h3 class="display mt-10 text-[clamp(1.4rem,2.3vw,1.9rem)] leading-[1.08]">
              {{ item.title }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-muted">
              {{ item.text }}
            </p>
          </a>
        </div>

        <div class="mt-14 grid gap-7 border-t border-[var(--line)] pt-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <div>
            <p class="eyebrow">
              OPEN SOURCE CREDITS
            </p>
            <h3 class="display mt-5 text-3xl leading-[1.08]">
              {{ t('about.creditsTitle') }}
            </h3>
          </div>
          <div class="space-y-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            <p>{{ t('about.creditsText') }}</p>
            <p>{{ t('about.creditsNote') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell py-20 sm:py-28">
      <SectionHeading
        eyebrow="WHAT'S NEXT"
        :title="t('about.nextTitle')"
        :intro="t('about.nextIntro')"
      />

      <article class="surface-card mt-12 overflow-hidden rounded-[1.5rem]">
        <div class="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div class="p-7 sm:p-10 lg:p-12">
            <p class="eyebrow">
              {{ t('about.nextPlanLabel') }}
            </p>
            <h3 class="display mt-6 text-[clamp(2rem,4vw,3rem)] leading-[1.04]">
              {{ t('about.nextPlanTitle') }}
            </h3>
          </div>
          <div class="border-t border-[var(--line)] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <p class="max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {{ t('about.nextPlanText') }}
            </p>
          </div>
        </div>
      </article>

      <div class="mt-8">
        <div class="flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <h3 class="display text-[clamp(1.7rem,3vw,2.4rem)]">
            {{ t('about.otherProjectsTitle') }}
          </h3>
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">
            WORK IN PROGRESS
          </p>
        </div>
        <div
          class="mt-5 min-h-32 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface-strong)]/45"
          aria-hidden="true"
        />
      </div>
    </section>
  </div>
</template>

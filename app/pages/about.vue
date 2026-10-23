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

const anniversaryFrames = computed(() => [
  {
    id: '2024',
    kind: 'photo',
    label: t('about.anniversaryOneLabel'),
    year: '2024',
    note: t('about.anniversaryOneNote'),
    image: '/images/anniversaries/anniversary-1-2024-1200.webp',
    srcset: '/images/anniversaries/anniversary-1-2024-720.webp 720w, /images/anniversaries/anniversary-1-2024-1200.webp 1200w',
    position: 'center 55%',
    rotation: '-2.4deg',
    mark: '',
  },
  {
    id: '2025',
    kind: 'photo',
    label: t('about.anniversaryTwoLabel'),
    year: '2025',
    note: t('about.anniversaryTwoNote'),
    image: '/images/anniversaries/anniversary-2-2025-1200.webp',
    srcset: '/images/anniversaries/anniversary-2-2025-720.webp 720w, /images/anniversaries/anniversary-2-2025-1200.webp 1200w',
    position: 'center 34%',
    rotation: '2.2deg',
    mark: '',
  },
  {
    id: '2026',
    kind: 'empty',
    label: t('about.anniversaryThreeLabel'),
    year: '2026',
    note: t('about.anniversaryThreeNote'),
    image: '',
    srcset: '',
    position: 'center',
    rotation: '-1.4deg',
    mark: '26',
  },
  {
    id: 'forever',
    kind: 'empty',
    label: t('about.anniversaryFutureLabel'),
    year: t('about.anniversaryFutureYear'),
    note: t('about.anniversaryFutureNote'),
    image: '',
    srcset: '',
    position: 'center',
    rotation: '1.8deg',
    mark: '∞',
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
      <div class="anniversary-wall relative overflow-hidden rounded-[2rem] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div
          class="pointer-events-none absolute -left-20 top-8 size-64 rounded-full bg-[#d9b26f]/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -right-16 bottom-16 size-56 rounded-full bg-[#9bbba9]/25 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative z-10">
          <div class="mx-auto max-w-3xl text-center">
            <p class="eyebrow justify-center">
              {{ t('about.anniversaryEyebrow') }}
            </p>
            <h3 class="display mt-5 text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.02] tracking-[-0.04em] text-[#26362f]">
              {{ t('about.anniversaryTitle') }}
            </h3>
            <p class="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#677168] sm:text-base sm:leading-8">
              {{ t('about.anniversaryIntro') }}
            </p>
          </div>

          <div class="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-7 lg:grid-cols-4 lg:gap-x-6 lg:pt-5">
            <figure
              v-for="(frame, index) in anniversaryFrames"
              :key="frame.id"
              class="anniversary-card group"
              :class="{ 'lg:mt-10': index === 1 || index === 3 }"
              :style="{ '--card-rotate': frame.rotation }"
            >
              <span
                class="anniversary-tape absolute left-1/2 top-0 z-20 h-5 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-3 bg-[#d6b66e]/55 shadow-sm backdrop-blur-[1px]"
                aria-hidden="true"
              />

              <div class="relative aspect-[3/4] overflow-hidden rounded-[0.35rem] bg-[#e7decf]">
                <img
                  v-if="frame.kind === 'photo'"
                  :src="frame.image"
                  :srcset="frame.srcset"
                  sizes="(min-width: 1024px) 23vw, 44vw"
                  :alt="`${frame.label} ${frame.year}`"
                  :style="{ objectPosition: frame.position }"
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                >
                <div
                  v-else
                  class="anniversary-empty flex h-full flex-col items-center justify-center px-4 text-center"
                >
                  <span class="display text-[clamp(2.8rem,7vw,4.7rem)] leading-none text-[#aa7c3e]/20">
                    {{ frame.mark }}
                  </span>
                  <Icon
                    name="lucide:heart"
                    class="mt-5 size-4 text-[#aa7c3e]/45"
                  />
                </div>
              </div>

              <figcaption class="px-1 pb-1 pt-5 text-center">
                <p class="display text-[1.15rem] leading-tight text-[#26362f] sm:text-[1.35rem]">
                  {{ frame.label }}
                </p>
                <p class="mt-2 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#9f7334]">
                  {{ frame.year }}
                </p>
                <p class="mt-2 text-[0.68rem] leading-5 text-[#7b817b]">
                  {{ frame.note }}
                </p>
              </figcaption>
            </figure>
          </div>

          <div class="mx-auto mt-12 flex max-w-3xl flex-col items-center border-t border-[#7f6c4e]/15 pt-8 text-center">
            <Icon
              name="lucide:heart"
              class="size-4 text-[#b88945]"
            />
            <p class="display mt-4 text-[clamp(1.3rem,2.8vw,2rem)] leading-[1.3] text-[#34423b]">
              {{ t('about.anniversaryQuote') }}
            </p>
            <p class="mt-4 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[#9a8b75]">
              2023 — FOREVER
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.anniversary-wall {
  background:
    radial-gradient(circle at 16% 8%, rgba(222, 184, 116, 0.24), transparent 24rem),
    radial-gradient(circle at 90% 88%, rgba(142, 181, 158, 0.2), transparent 22rem),
    linear-gradient(145deg, #f2e9da 0%, #fffaf1 48%, #e8eee7 100%);
  box-shadow:
    inset 0 0 0 1px rgba(120, 96, 61, 0.1),
    0 28px 80px rgba(62, 49, 31, 0.08);
}

.anniversary-wall::before {
  position: absolute;
  inset: 0;
  content: '';
  pointer-events: none;
  background-image: radial-gradient(rgba(91, 73, 47, 0.1) 0.55px, transparent 0.55px);
  background-size: 6px 6px;
  opacity: 0.32;
}

.anniversary-card {
  position: relative;
  transform: rotate(var(--card-rotate));
  border: 1px solid rgba(101, 79, 49, 0.1);
  border-radius: 0.5rem;
  background: #fffdf7;
  padding: 0.65rem 0.65rem 0.8rem;
  box-shadow:
    0 18px 36px rgba(77, 60, 38, 0.13),
    0 3px 8px rgba(77, 60, 38, 0.08);
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 420ms ease;
}

.anniversary-card:hover {
  transform: rotate(0deg) translateY(-0.4rem);
  box-shadow:
    0 24px 46px rgba(77, 60, 38, 0.16),
    0 4px 10px rgba(77, 60, 38, 0.09);
}

.anniversary-tape {
  clip-path: polygon(2% 8%, 98% 0, 94% 88%, 6% 100%);
}

.anniversary-empty {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), transparent 55%),
    repeating-linear-gradient(135deg, rgba(169, 133, 77, 0.04) 0 1px, transparent 1px 11px),
    #f1e8d9;
}

@media (prefers-reduced-motion: reduce) {
  .anniversary-card,
  .anniversary-card:hover {
    transition: none;
  }
}
</style>

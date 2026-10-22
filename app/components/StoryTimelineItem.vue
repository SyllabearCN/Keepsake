<script setup lang="ts">
import type { StorySummary } from '~/types/content'

const props = defineProps<{
  story: StorySummary
  index: number
}>()

const { t } = useI18n()
const dateParts = computed(() => props.story.date.split('-'))
</script>

<template>
  <article class="story-timeline-item">
    <div class="story-timeline-date">
      <span class="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
        {{ dateParts[0] }}
      </span>
      <span class="display mt-1 block text-3xl leading-none">
        {{ dateParts[1] }}.{{ dateParts[2] }}
      </span>
      <span class="mt-3 inline-block rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.14em] text-muted">
        #{{ String(index + 1).padStart(2, '0') }}
      </span>
    </div>

    <NuxtLink
      :to="story.path"
      class="story-timeline-card group"
    >
      <div class="image-reveal relative aspect-[3/2] overflow-hidden bg-[var(--surface-strong)]">
        <DeferredImage
          :src="story.cover"
          :alt="story.title"
          :width="1600"
          :height="1000"
          class="h-full w-full object-cover"
        />
        <span class="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[0.58rem] font-semibold text-white backdrop-blur-md">
          {{ story.category }}
        </span>
      </div>

      <div class="flex min-w-0 flex-col p-5 sm:p-6">
        <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
          {{ story.date }} · {{ story.readingTime ?? 4 }} {{ t('stories.minuteRead') }}
        </p>
        <h2 class="display mt-3 text-[clamp(1.55rem,2.8vw,2.15rem)] leading-[1.1]">
          {{ story.title }}
        </h2>
        <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {{ story.description }}
        </p>
        <span class="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold">
          {{ t('common.readMore') }}
          <Icon
            name="lucide:arrow-right"
            class="size-4 text-[var(--accent)] transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.story-timeline-item {
  position: relative;
  display: grid;
  gap: 1.25rem;
}

.story-timeline-date {
  position: relative;
  padding-left: 2.8rem;
}

.story-timeline-item::before {
  position: absolute;
  z-index: 1;
  top: 0.55rem;
  left: 0.2rem;
  width: 0.75rem;
  height: 0.75rem;
  border: 3px solid var(--page);
  border-radius: 999px;
  background: var(--sun);
  box-shadow: 0 0 0 1px var(--sun);
  content: "";
}

.story-timeline-card {
  display: grid;
  overflow: hidden;
  margin-left: 2.1rem;
  border: 1px solid var(--line);
  border-radius: 1.4rem;
  background: var(--surface-solid);
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.story-timeline-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--sun) 42%, var(--line));
  box-shadow: var(--shadow);
}

@media (min-width: 640px) {
  .story-timeline-card {
    grid-template-columns: minmax(11rem, 13.5rem) minmax(0, 1fr);
  }
}

@media (min-width: 768px) {
  .story-timeline-item {
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 2.5rem;
  }

  .story-timeline-date {
    padding-top: 0.9rem;
    padding-left: 0;
    padding-right: 1rem;
    text-align: right;
  }

  .story-timeline-item::before {
    top: 1.5rem;
    left: 9.2rem;
  }

  .story-timeline-card {
    margin-left: 0;
  }
}
</style>

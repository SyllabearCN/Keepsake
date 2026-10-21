<script setup lang="ts">
import type { Journey } from '~/types/content'

const props = defineProps<{
  journey: Journey
  cover: string
  index: number
}>()

const emit = defineEmits<{
  open: [journey: Journey]
}>()

const { t } = useI18n()
const localize = useLocalizedText()

const dateParts = computed(() => props.journey.date.split('-'))
</script>

<template>
  <article class="timeline-item">
    <div class="timeline-date">
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

    <button
      type="button"
      class="timeline-card group"
      :aria-label="localize(journey.title)"
      @click="emit('open', journey)"
    >
      <div class="image-reveal relative aspect-[16/10] overflow-hidden bg-[var(--surface-strong)]">
        <img
          :src="cover"
          :alt="localize(journey.title)"
          width="1600"
          height="1000"
          loading="lazy"
          class="h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
        <span class="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
          Bilibili
        </span>
        <span class="absolute bottom-4 right-4 rounded-md bg-black/55 px-2 py-1 text-[0.62rem] font-semibold text-white">
          {{ journey.duration }}
        </span>
        <span class="absolute inset-0 grid place-items-center">
          <span class="grid size-14 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <Icon
              name="lucide:play"
              class="ml-0.5 size-5 fill-white"
            />
          </span>
        </span>
      </div>

      <div class="flex min-w-0 flex-col p-5 sm:p-6">
        <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
          {{ localize(journey.location) }}
        </p>
        <h2 class="display mt-3 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.04]">
          {{ localize(journey.title) }}
        </h2>
        <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {{ localize(journey.description) }}
        </p>
        <span class="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold">
          <Icon
            name="lucide:play-circle"
            class="size-4 text-[var(--accent)]"
          />
          {{ t('common.watchVideo') }}
        </span>
      </div>
    </button>
  </article>
</template>

<style scoped>
.timeline-item {
  position: relative;
  display: grid;
  gap: 1.25rem;
}

.timeline-date {
  position: relative;
  padding-left: 2.8rem;
}

.timeline-item::before {
  position: absolute;
  z-index: 1;
  top: 0.55rem;
  left: 0.2rem;
  width: 0.75rem;
  height: 0.75rem;
  border: 3px solid var(--page);
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
  content: "";
}

.timeline-card {
  display: grid;
  overflow: hidden;
  margin-left: 2.1rem;
  border: 1px solid var(--line);
  border-radius: 1.4rem;
  background: var(--surface-solid);
  text-align: left;
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.timeline-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 35%, var(--line));
  box-shadow: var(--shadow);
}

@media (min-width: 640px) {
  .timeline-card {
    grid-template-columns: minmax(14rem, 17rem) minmax(0, 1fr);
  }
}

@media (min-width: 768px) {
  .timeline-item {
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 2.5rem;
  }

  .timeline-date {
    padding-top: 0.9rem;
    padding-left: 0;
    padding-right: 1rem;
    text-align: right;
  }

  .timeline-item::before {
    top: 1.5rem;
    left: 9.2rem;
  }

  .timeline-card {
    margin-left: 0;
  }
}
</style>

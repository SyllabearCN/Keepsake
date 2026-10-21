<script setup lang="ts">
import type { Album, GalleryPhoto } from '~/types/content'

const props = defineProps<{
  album: Album
  cover: GalleryPhoto
  photoCount: number
  index: number
}>()

const emit = defineEmits<{
  select: [albumId: string]
}>()

const { t } = useI18n()
const localize = useLocalizedText()
const dateParts = computed(() => props.album.date?.split('-') ?? [])
</script>

<template>
  <article class="album-timeline-item">
    <div class="album-timeline-date">
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
      class="album-timeline-card group"
      @click="emit('select', album.id)"
    >
      <div class="image-reveal relative aspect-[4/3] overflow-hidden bg-[var(--surface-strong)]">
        <img
          :src="cover.src"
          :alt="cover.alt"
          :width="cover.width"
          :height="cover.height"
          loading="lazy"
          class="h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span class="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-[0.62rem] font-semibold text-white backdrop-blur-md">
          {{ photoCount }} {{ t('common.photos') }}
        </span>
      </div>

      <div class="flex min-w-0 flex-col p-5 sm:p-6">
        <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
          {{ album.date }}
        </p>
        <h2 class="display mt-3 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.06]">
          {{ localize(album.label) }}
        </h2>
        <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {{ localize(album.description) }}
        </p>
        <span class="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold">
          {{ t('common.viewAll') }}
          <Icon
            name="lucide:arrow-right"
            class="size-4 text-[var(--accent)] transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </button>
  </article>
</template>

<style scoped>
.album-timeline-item {
  position: relative;
  display: grid;
  gap: 1.25rem;
}

.album-timeline-date {
  position: relative;
  padding-left: 2.8rem;
}

.album-timeline-item::before {
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

.album-timeline-card {
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

.album-timeline-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 35%, var(--line));
  box-shadow: var(--shadow);
}

@media (min-width: 640px) {
  .album-timeline-card {
    grid-template-columns: minmax(12rem, 15rem) minmax(0, 1fr);
  }
}

@media (min-width: 768px) {
  .album-timeline-item {
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 2.5rem;
  }

  .album-timeline-date {
    padding-top: 0.9rem;
    padding-left: 0;
    padding-right: 1rem;
    text-align: right;
  }

  .album-timeline-item::before {
    top: 1.5rem;
    left: 9.2rem;
  }

  .album-timeline-card {
    margin-left: 0;
  }
}
</style>

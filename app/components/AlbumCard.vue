<script setup lang="ts">
import type { Album, GalleryPhoto } from '~/types/content'

defineProps<{
  album: Album
  cover: GalleryPhoto
  photoCount: number
}>()

const emit = defineEmits<{
  select: [albumId: string]
}>()

const { t } = useI18n()
const localize = useLocalizedText()
</script>

<template>
  <button
    type="button"
    class="group block w-full overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-solid)] text-left"
    @click="emit('select', album.id)"
  >
    <div class="image-reveal relative aspect-[4/3] bg-[var(--surface-strong)]">
      <DeferredImage
        :src="cover.src"
        :alt="cover.alt"
        :width="cover.width"
        :height="cover.height"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
        <div>
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-white/65">
            {{ album.date }}
          </p>
          <h2 class="display mt-2 text-3xl leading-none">
            {{ localize(album.label) }}
          </h2>
        </div>
        <span class="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-black/15 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45">
          <Icon
            name="lucide:arrow-up-right"
            class="size-4"
          />
        </span>
      </div>
    </div>

    <div class="flex items-start gap-5 p-5 sm:p-6">
      <p class="min-w-0 flex-1 text-sm leading-6 text-muted">
        {{ localize(album.description) }}
      </p>
      <span class="shrink-0 rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[0.65rem] font-semibold text-[var(--text)]">
        {{ photoCount }} {{ t('common.photos') }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from '~/types/content'

const props = withDefaults(defineProps<{
  photo: GalleryPhoto
  priority?: boolean
  aspect?: 'natural' | 'landscape' | 'portrait' | 'square'
}>(), {
  priority: false,
  aspect: 'natural',
})

const emit = defineEmits<{
  open: [photo: GalleryPhoto]
}>()

const localize = useLocalizedText()

const aspectClass = computed(() => {
  const classes = {
    natural: '',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[4/5]',
    square: 'aspect-square',
  }

  return classes[props.aspect]
})
</script>

<template>
  <article class="group relative w-full break-inside-avoid overflow-hidden rounded-[1.4rem] bg-[var(--surface-strong)]">
    <button
      type="button"
      class="block w-full text-left"
      :aria-label="localize(photo.title)"
      @click="emit('open', photo)"
    >
      <div
        class="image-reveal relative"
        :class="aspectClass"
      >
        <img
          :src="photo.src"
          :alt="photo.alt"
          :width="photo.width"
          :height="photo.height"
          :loading="priority ? 'eager' : 'lazy'"
          :fetchpriority="priority ? 'high' : 'auto'"
          class="h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-85 transition-opacity duration-300 group-hover:opacity-100" />

        <div class="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 text-white sm:p-6">
          <div class="min-w-0 flex-1">
            <p class="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/65">
              {{ localize(photo.location) }} · {{ photo.date.replaceAll('-', '.') }}
            </p>
            <h3 class="display mt-2 text-2xl leading-tight">
              {{ localize(photo.title) }}
            </h3>
          </div>
          <span class="grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-black/15 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45">
            <Icon
              name="lucide:arrow-up-right"
              class="size-4"
            />
          </span>
        </div>
      </div>
    </button>
  </article>
</template>

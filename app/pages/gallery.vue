<script setup lang="ts">
import type { GalleryPhoto } from '~/types/content'
import { albums, gallery } from '~/data/albums'

const { t } = useI18n()
const localize = useLocalizedText()
const preferences = usePreferencesStore()

useSeoMeta({
  title: t('gallery.title'),
  description: t('gallery.intro'),
})

const filters = computed(() => [
  { id: 'all', label: t('common.all') },
  ...albums.map(album => ({ id: album.id, label: localize(album.label) })),
])

const filteredPhotos = computed(() => {
  if (preferences.galleryAlbum === 'all') return gallery
  return gallery.filter(photo => photo.album === preferences.galleryAlbum)
})

const activePhoto = ref<GalleryPhoto | null>(null)
const lightboxOpen = ref(false)

function openPhoto(photo: GalleryPhoto) {
  activePhoto.value = photo
  lightboxOpen.value = true
}
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('gallery.eyebrow')"
      :title="t('gallery.title')"
      :intro="t('gallery.intro')"
    />

    <section class="page-shell pb-20">
      <div class="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
            {{ t('gallery.albumFilter') }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="filter in filters"
              :key="filter.id"
              type="button"
              class="rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors"
              :class="preferences.galleryAlbum === filter.id
                ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--page)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-muted hover:text-[var(--text)]'"
              @click="preferences.galleryAlbum = filter.id"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-muted">
          <span class="display text-2xl text-[var(--text)]">{{ String(filteredPhotos.length).padStart(2, '0') }}</span>
          <span>{{ t('common.photos') }}</span>
          <span
            v-if="preferences.favorites.length"
            class="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[var(--text)]"
          >
            ♥ {{ preferences.favorites.length }}
          </span>
        </div>
      </div>

      <div
        v-if="filteredPhotos.length"
        class="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4"
      >
        <PhotoCard
          v-for="photo in filteredPhotos"
          :key="photo.id"
          :photo="photo"
          @open="openPhoto"
        />
      </div>
      <p
        v-else
        class="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-muted"
      >
        {{ t('gallery.empty') }}
      </p>

      <div class="mt-12 grid gap-6 rounded-[1.6rem] bg-[var(--surface-strong)] p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <span class="grid size-12 place-items-center rounded-full bg-[var(--brand)] text-[var(--page)]">
          <Icon
            name="lucide:folder-heart"
            class="size-5"
          />
        </span>
        <div>
          <p class="text-sm font-bold">
            {{ t('gallery.localHint') }}
          </p>
          <p class="mt-1 text-sm leading-6 text-muted">
            {{ t('gallery.localHintText') }}
          </p>
        </div>
      </div>
    </section>

    <GalleryLightbox
      v-if="activePhoto"
      v-model:open="lightboxOpen"
      :photo="activePhoto"
    />
  </div>
</template>

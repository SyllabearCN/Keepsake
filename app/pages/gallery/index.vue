<script setup lang="ts">
import type { GalleryPhoto } from '~/types/content'
import { useMediaLibrary } from '~/composables/useMediaLibrary'

const { t } = useI18n()
const localize = useLocalizedText()
const preferences = usePreferencesStore()
const { media } = await useMediaLibrary()

const albumCards = computed(() => media.value.albums.flatMap((album) => {
  const photos = media.value.gallery.filter(photo => photo.album === album.id)
  return photos[0]
    ? [{ album, cover: photos[0]!, photoCount: photos.length }]
    : []
}))

const selectedAlbum = computed(() => {
  return albumCards.value.find(card => card.album.id === preferences.galleryAlbum)?.album ?? null
})

const selectedPhotos = computed(() => {
  return selectedAlbum.value
    ? media.value.gallery.filter(photo => photo.album === selectedAlbum.value?.id)
    : []
})

const galleryView = computed({
  get: () => preferences.galleryView,
  set: value => preferences.setGalleryView(value),
})

const filters = computed(() => [
  { id: 'all', label: t('common.all') },
  ...media.value.albums.map(album => ({
    id: album.id,
    label: `${localize(album.label)}${album.date ? ` · ${album.date}` : ''}`,
  })),
])

const activePhoto = ref<GalleryPhoto | null>(null)
const lightboxOpen = ref(false)

function selectAlbum(albumId: string) {
  preferences.galleryAlbum = albumId
}

function openPhoto(photo: GalleryPhoto) {
  activePhoto.value = photo
  lightboxOpen.value = true
}

useSeoMeta({
  title: t('gallery.title'),
  description: t('gallery.intro'),
})
</script>

<template>
  <div>
    <PageIntro
      :eyebrow="t('gallery.eyebrow')"
      :title="t('gallery.title')"
      :intro="t('gallery.intro')"
    />

    <section class="page-shell pb-20">
      <div class="mb-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="min-w-0 flex-1">
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
            {{ t('gallery.albumFilter') }}
          </p>
          <div class="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              v-for="filter in filters"
              :key="filter.id"
              type="button"
              class="shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors"
              :class="preferences.galleryAlbum === filter.id
                ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--page)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-muted hover:text-[var(--text)]'"
              @click="selectAlbum(filter.id)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-3">
          <ViewModeToggle
            v-if="!selectedAlbum"
            v-model="galleryView"
          />

          <div class="flex items-center gap-3 text-xs text-muted">
            <span class="display text-2xl text-[var(--text)]">
              {{ String(selectedAlbum ? selectedPhotos.length : albumCards.length).padStart(2, '0') }}
            </span>
            <span>{{ selectedAlbum ? t('common.photos') : t('gallery.albumList') }}</span>
            <span
              v-if="preferences.favorites.length"
              class="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[var(--text)]"
            >
              ♥ {{ preferences.favorites.length }}
            </span>
          </div>
        </div>
      </div>

      <template v-if="!selectedAlbum">
        <div
          v-if="albumCards.length"
          v-show="preferences.galleryView === 'grid'"
          class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <AlbumCard
            v-for="card in albumCards"
            :key="card.album.id"
            :album="card.album"
            :cover="card.cover"
            :photo-count="card.photoCount"
            @select="selectAlbum"
          />
        </div>

        <div
          v-if="albumCards.length && preferences.galleryView === 'timeline'"
          class="album-timeline mx-auto max-w-6xl"
        >
          <AlbumTimelineItem
            v-for="(card, index) in albumCards"
            :key="card.album.id"
            :album="card.album"
            :cover="card.cover"
            :photo-count="card.photoCount"
            :index="index"
            @select="selectAlbum"
          />
        </div>

        <p
          v-if="!albumCards.length"
          class="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-muted"
        >
          {{ t('gallery.noAlbums') }}
        </p>
      </template>

      <template v-else>
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <button
            type="button"
            class="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-[var(--text)]"
            @click="selectAlbum('all')"
          >
            <Icon
              name="lucide:arrow-left"
              class="size-4"
            />
            {{ t('gallery.backToAlbums') }}
          </button>
          <div class="flex items-center gap-3 text-xs text-muted">
            <span>{{ selectedAlbum.date }}</span>
            <span>·</span>
            <span>{{ selectedPhotos.length }} {{ t('common.photos') }}</span>
          </div>
        </div>

        <div
          v-if="selectedPhotos.length"
          class="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4"
        >
          <PhotoCard
            v-for="photo in selectedPhotos"
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
      </template>

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

<style scoped>
.album-timeline {
  position: relative;
  display: grid;
  gap: 2rem;
}

.album-timeline::before {
  position: absolute;
  top: 0.75rem;
  bottom: 1rem;
  left: 0.55rem;
  width: 1px;
  background: linear-gradient(var(--accent), var(--line) 18%, var(--line) 82%, transparent);
  content: "";
}

@media (min-width: 768px) {
  .album-timeline::before {
    left: 9.57rem;
  }
}
</style>

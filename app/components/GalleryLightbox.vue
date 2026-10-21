<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { GalleryPhoto } from '~/types/content'

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  photo: GalleryPhoto
}>()

const preferences = usePreferencesStore()
const localize = useLocalizedText()
const { t } = useI18n()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md" />
      <DialogContent class="fixed inset-0 z-[110] grid place-items-center p-3 outline-none sm:p-8">
        <div class="grid max-h-[94svh] w-full max-w-7xl overflow-hidden rounded-[1.5rem] bg-[#0d1f1a] shadow-2xl lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="relative min-h-0 bg-black/30">
            <NuxtImg
              :src="photo.src"
              :alt="photo.alt"
              :width="photo.width"
              :height="photo.height"
              class="max-h-[65svh] w-full object-contain lg:max-h-[90svh]"
            />
          </div>

          <aside class="flex min-h-0 flex-col p-6 text-white sm:p-8">
            <div class="flex items-center justify-between">
              <span class="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/45">
                {{ photo.date.replaceAll('-', '.') }}
              </span>
              <DialogClose as-child>
                <button
                  type="button"
                  class="grid size-9 place-items-center rounded-full border border-white/15 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  :aria-label="t('common.close')"
                >
                  <Icon
                    name="lucide:x"
                    class="size-4"
                  />
                </button>
              </DialogClose>
            </div>

            <div class="mt-auto pt-10">
              <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#e8b65b]">
                {{ localize(photo.location) }}
              </p>
              <DialogTitle class="display mt-3 text-4xl leading-[1.02]">
                {{ localize(photo.title) }}
              </DialogTitle>
              <DialogDescription class="mt-5 text-sm leading-7 text-white/58">
                {{ localize(photo.caption) }}
              </DialogDescription>

              <button
                type="button"
                class="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-white/10"
                @click="preferences.toggleFavorite(photo.id)"
              >
                <Icon
                  :name="preferences.favorites.includes(photo.id) ? 'lucide:heart' : 'lucide:heart-plus'"
                  class="size-4"
                  :class="preferences.favorites.includes(photo.id) ? 'fill-[var(--accent)] text-[var(--accent)]' : ''"
                />
                {{ preferences.favorites.includes(photo.id) ? t('common.saved') : t('common.save') }}
              </button>
            </div>
          </aside>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

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
import type { Journey } from '~/types/content'

const props = defineProps<{
  journey: Journey | null
}>()

const open = defineModel<boolean>('open', { default: false })
const localize = useLocalizedText()
const { t } = useI18n()

const embedUrl = computed(() => {
  if (!props.journey) return ''
  return `https://player.bilibili.com/player.html?isOutside=true&bvid=${props.journey.bvid}&p=1&autoplay=1&danmaku=0`
})

const watchUrl = computed(() => {
  if (!props.journey) return 'https://www.bilibili.com'
  return `https://www.bilibili.com/video/${props.journey.bvid}`
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md" />
      <DialogContent class="fixed inset-0 z-[110] grid place-items-center p-3 outline-none sm:p-8">
        <div class="w-full max-w-6xl overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0d1f1a] text-white shadow-2xl">
          <div class="flex items-center gap-4 border-b border-white/10 px-5 py-4">
            <div class="min-w-0 flex-1">
              <DialogTitle
                v-if="journey"
                class="truncate font-serif text-xl"
              >
                {{ localize(journey.title) }}
              </DialogTitle>
              <DialogDescription
                v-if="journey"
                class="mt-1 text-xs text-white/45"
              >
                {{ localize(journey.location) }} · {{ journey.date }}
              </DialogDescription>
            </div>
            <a
              v-if="journey"
              :href="watchUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 sm:inline-flex"
            >
              {{ t('journeys.watchOnBilibili') }}
            </a>
            <DialogClose as-child>
              <button
                type="button"
                class="grid size-9 shrink-0 place-items-center rounded-full border border-white/15"
                :aria-label="t('common.close')"
              >
                <Icon
                  name="lucide:x"
                  class="size-4"
                />
              </button>
            </DialogClose>
          </div>

          <div class="aspect-video w-full bg-black">
            <iframe
              v-if="open && journey"
              :src="embedUrl"
              :title="localize(journey.title)"
              class="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

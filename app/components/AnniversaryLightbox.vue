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

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  src: string
  alt: string
  title: string
  year: string
  note: string
}>()

const { t } = useI18n()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-[#17221d]/80 backdrop-blur-md" />
      <DialogContent class="fixed inset-0 z-[110] grid place-items-center p-3 outline-none sm:p-8">
        <div class="relative flex max-h-[94svh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] bg-[#0d1713] text-white shadow-2xl">
          <div class="min-h-0 bg-black/30">
            <img
              :src="src"
              :alt="alt"
              class="max-h-[76svh] w-full object-contain sm:max-h-[78svh]"
            >
          </div>

          <div class="flex items-start justify-between gap-6 px-5 py-4 sm:px-7 sm:py-5">
            <div class="min-w-0">
              <p class="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#e8b65b]">
                {{ year }}
              </p>
              <DialogTitle class="display mt-1.5 text-2xl leading-tight sm:text-3xl">
                {{ title }}
              </DialogTitle>
              <DialogDescription class="mt-1.5 text-xs leading-5 text-white/55 sm:text-sm">
                {{ note }}
              </DialogDescription>
            </div>

            <DialogClose as-child>
              <button
                type="button"
                class="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b65b]"
                :aria-label="t('common.close')"
              >
                <Icon
                  name="lucide:x"
                  class="size-4"
                />
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

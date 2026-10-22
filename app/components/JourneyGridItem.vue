<script setup lang="ts">
import type { Journey } from '~/types/content'

const props = defineProps<{
  journey: Journey
  cover: string
}>()

const emit = defineEmits<{
  open: [journey: Journey]
}>()

const { t } = useI18n()
const localize = useLocalizedText()
</script>

<template>
  <button
    type="button"
    class="group surface-card flex h-full flex-col overflow-hidden rounded-[1.35rem] text-left transition-transform duration-300 hover:-translate-y-1"
    @click="emit('open', props.journey)"
  >
    <div class="image-reveal relative aspect-[16/9] bg-[var(--surface-strong)]">
      <DeferredImage
        :src="cover"
        :alt="localize(journey.title)"
        :width="1600"
        :height="1000"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <span class="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
        Bilibili
      </span>
      <span class="absolute bottom-4 right-4 rounded-md bg-black/55 px-2 py-1 text-[0.62rem] font-semibold text-white">
        {{ journey.duration }}
      </span>
      <span class="absolute inset-0 grid place-items-center">
        <span class="grid size-12 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <Icon
            name="lucide:play"
            class="ml-0.5 size-4 fill-white"
          />
        </span>
      </span>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-center justify-between gap-3 text-[0.61rem] font-bold uppercase tracking-[0.14em] text-muted">
        <span>{{ localize(journey.location) }}</span>
        <span>{{ journey.date }}</span>
      </div>
      <h2 class="display mt-3 text-[clamp(1.45rem,2.5vw,1.9rem)] leading-[1.1]">
        {{ localize(journey.title) }}
      </h2>
      <p class="mt-3 line-clamp-2 text-sm leading-6 text-muted">
        {{ localize(journey.description) }}
      </p>
      <span class="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold">
        <Icon
          name="lucide:play-circle"
          class="size-4 text-[var(--accent)]"
        />
        {{ t('common.watchVideo') }}
      </span>
    </div>
  </button>
</template>

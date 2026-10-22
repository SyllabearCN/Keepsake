<script setup lang="ts">
import type { Journey } from '~/types/content'

const props = defineProps<{
  journey: Journey
  cover: string
  large?: boolean
}>()

const emit = defineEmits<{
  open: [journey: Journey]
}>()

const localize = useLocalizedText()
const { t } = useI18n()
</script>

<template>
  <article class="group">
    <button
      type="button"
      class="w-full text-left"
      @click="emit('open', props.journey)"
    >
      <div
        class="image-reveal relative overflow-hidden rounded-[1.5rem] bg-[var(--surface-strong)]"
        :class="large ? 'aspect-[16/9]' : 'aspect-[4/3]'"
      >
        <DeferredImage
          :src="cover"
          :alt="localize(journey.title)"
          :width="1600"
          :height="1000"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />

        <span class="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
          Bilibili
        </span>
        <span class="absolute bottom-4 right-4 rounded-md bg-black/55 px-2 py-1 text-[0.64rem] font-semibold text-white">
          {{ journey.duration }}
        </span>

        <span class="absolute inset-0 grid place-items-center">
          <span class="grid size-16 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <Icon
              name="lucide:play"
              class="ml-1 size-6 fill-white"
            />
          </span>
        </span>
      </div>

      <div class="mt-5 flex items-start gap-5">
        <div class="min-w-0 flex-1">
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
            {{ localize(journey.location) }} · {{ journey.date.slice(0, 4) }}
          </p>
          <h3 class="display mt-2 text-[clamp(1.55rem,2.5vw,2.4rem)] leading-[1.08]">
            {{ localize(journey.title) }}
          </h3>
          <p class="mt-3 line-clamp-2 text-sm leading-6 text-muted">
            {{ localize(journey.description) }}
          </p>
        </div>
        <span class="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-[var(--page)]">
          <Icon
            name="lucide:arrow-up-right"
            class="size-4"
          />
        </span>
      </div>
      <span class="sr-only">{{ t('common.watchVideo') }}</span>
    </button>
  </article>
</template>

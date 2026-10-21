<script setup lang="ts">
interface StorySummary {
  path: string
  title: string
  description: string
  date: string
  category: string
  cover: string
  readingTime?: number
}

defineProps<{
  story: StorySummary
  featured?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <article class="group h-full">
    <NuxtLink
      :to="story.path"
      class="surface-card flex h-full flex-col overflow-hidden rounded-[1.4rem] transition-transform duration-300 hover:-translate-y-1"
    >
      <div class="image-reveal aspect-[16/10] bg-[var(--surface-strong)]">
        <img
          :src="story.cover"
          :alt="story.title"
          :width="1600"
          :height="1000"
          class="h-full w-full object-cover"
          loading="lazy"
        >
      </div>

      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <div class="flex items-center gap-2 text-[0.61rem] font-bold uppercase tracking-[0.14em] text-muted">
          <span class="text-[var(--accent)]">{{ story.category }}</span>
          <span>·</span>
          <span>{{ story.date.replaceAll('-', '.') }}</span>
        </div>

        <h3
          class="display mt-4 text-[clamp(1.55rem,3vw,2.3rem)] leading-[1.08]"
          :class="featured ? 'sm:text-4xl' : ''"
        >
          {{ story.title }}
        </h3>
        <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {{ story.description }}
        </p>

        <div class="mt-auto flex items-center justify-between pt-7 text-xs font-semibold">
          <span class="text-muted">
            {{ story.readingTime ?? 4 }} {{ t('stories.minuteRead') }}
          </span>
          <span class="inline-flex items-center gap-2 text-[var(--text)]">
            {{ t('common.readMore') }}
            <Icon
              name="lucide:arrow-right"
              class="size-3.5 transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const { data: story } = await useAsyncData(`story-${route.path}`, () => {
  return queryCollection('stories').path(route.path).first()
})

if (!story.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('stories.notFound'),
  })
}

useSeoMeta({
  title: story.value.title,
  description: story.value.description,
  ogImage: story.value.cover,
  ogType: 'article',
})
</script>

<template>
  <article v-if="story">
    <header class="page-shell pt-36 sm:pt-44">
      <NuxtLink
        to="/stories"
        class="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-[var(--text)]"
      >
        <Icon
          name="lucide:arrow-left"
          class="size-4"
        />
        {{ t('nav.stories') }}
      </NuxtLink>

      <div class="mx-auto mt-10 max-w-5xl text-center">
        <p class="text-[0.64rem] font-bold uppercase tracking-[0.17em] text-[var(--accent)]">
          {{ story.category }} · {{ story.date.replaceAll('-', '.') }}
        </p>
        <h1 class="display mx-auto mt-5 max-w-4xl text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.055em]">
          {{ story.title }}
        </h1>
        <p class="mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
          {{ story.description }}
        </p>
      </div>

      <div class="mt-12 overflow-hidden rounded-[1.8rem] bg-[var(--surface-strong)] sm:mt-16">
        <NuxtImg
          :src="story.cover"
          :alt="story.title"
          width="2000"
          height="1200"
          class="max-h-[72svh] w-full object-cover"
          preload
        />
      </div>
    </header>

    <section class="page-shell pb-20 pt-14 sm:pt-20">
      <ContentRenderer
        :value="story"
        class="prose-keepsake"
      />

      <div class="mx-auto mt-16 flex max-w-[46rem] items-center justify-between border-t border-[var(--line)] pt-7">
        <NuxtLink
          to="/stories"
          class="pill-button border border-[var(--line)]"
        >
          <Icon
            name="lucide:arrow-left"
            class="size-4"
          />
          {{ t('nav.stories') }}
        </NuxtLink>
        <span class="text-xs text-muted">{{ story.date }}</span>
      </div>
    </section>
  </article>
</template>

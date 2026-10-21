<script setup lang="ts">
const { locale } = useI18n()

defineProps<{
  eyebrow: string
  title: string
  intro: string
}>()

const singleLineIntro = computed(() => locale.value === 'zh-CN')
</script>

<template>
  <section class="page-shell pb-10 pt-36 sm:pt-44">
    <div class="grid gap-9 border-b border-[var(--line)] pb-12 lg:grid-cols-[minmax(15rem,0.42fr)_minmax(0,1fr)] lg:items-end">
      <div>
        <p class="eyebrow">
          {{ eyebrow }}
        </p>
        <h1 class="display mt-7 text-[clamp(2.5rem,6vw,3.25rem)] leading-[1.02] tracking-[-0.045em]">
          {{ title }}
        </h1>
      </div>
      <p
        class="text-sm leading-7 text-muted sm:text-base sm:leading-8 lg:justify-self-end"
        :class="singleLineIntro
          ? 'max-w-none lg:whitespace-nowrap lg:text-[clamp(0.5rem,calc(1.36vw_-_4px),0.99rem)] lg:leading-6'
          : 'max-w-xl'"
      >
        {{ intro }}
      </p>
    </div>
  </section>
</template>

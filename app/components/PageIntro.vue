<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  intro: string
  compact?: boolean
}>()
</script>

<template>
  <section
    class="page-shell"
    :class="compact ? 'pb-4 pt-24 sm:pt-28' : 'pb-10 pt-36 sm:pt-44'"
  >
    <div
      class="grid border-b border-[var(--line)] lg:grid-cols-[1fr_0.55fr] lg:items-end"
      :class="compact ? 'gap-6 pb-6' : 'gap-9 pb-12'"
    >
      <div>
        <p class="eyebrow">
          {{ eyebrow }}
        </p>
        <h1 class="display mt-7 text-[clamp(2.5rem,6vw,3.25rem)] leading-[1.02] tracking-[-0.045em]">
          {{ title }}
        </h1>
      </div>
      <p class="max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8 lg:justify-self-end">
        {{ intro }}
      </p>
    </div>
  </section>
</template>

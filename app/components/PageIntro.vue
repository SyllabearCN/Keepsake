<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  intro: string
}>()
</script>

<template>
  <section class="page-shell pb-10 pt-36 sm:pt-44">
    <div class="grid gap-9 border-b border-[var(--line)] pb-12 lg:grid-cols-[1fr_0.55fr] lg:items-end">
      <div>
        <p class="eyebrow">
          {{ eyebrow }}
        </p>
        <h1 class="display mt-6 text-[clamp(4rem,11vw,9.5rem)] leading-[0.82] tracking-[-0.06em]">
          {{ title }}
        </h1>
      </div>
      <p class="max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8 lg:justify-self-end">
        {{ intro }}
      </p>
    </div>
  </section>
</template>

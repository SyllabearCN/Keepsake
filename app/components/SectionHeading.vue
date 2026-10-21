<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  intro?: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl'">
    <p
      class="eyebrow"
      :class="align === 'center' ? 'justify-center' : ''"
    >
      {{ eyebrow }}
    </p>
    <h2 class="display mt-5 text-[clamp(2.45rem,6vw,5.6rem)] leading-[0.98]">
      {{ title }}
    </h2>
    <p
      v-if="intro"
      class="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8"
      :class="align === 'center' ? 'mx-auto' : ''"
    >
      {{ intro }}
    </p>
  </div>
</template>

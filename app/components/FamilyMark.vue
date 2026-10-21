<template>
  <NuxtLink
    to="/"
    class="group flex items-center gap-3"
    :aria-label="t('brand.homeLabel')"
  >
    <span class="relative grid size-10 place-items-center rounded-full bg-[#f7f2e8] text-[#173b33] ring-1 ring-black/5">
      <svg
        viewBox="0 0 40 40"
        class="size-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 19.5L20 8l14 11.5V33a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"
          fill="#173b33"
        />
        <path
          d="M12 35V23a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12z"
          fill="#e8b65b"
        />
        <path
          d="M20 31c-4.8-3.3-6.1-6-4.5-8 1.2-1.5 3.6-1.3 4.5.4.9-1.7 3.3-1.9 4.5-.4 1.6 2 .3 4.7-4.5 8z"
          fill="#ef795c"
        />
        <circle
          cx="12"
          cy="10"
          r="1.4"
          fill="#ef795c"
        />
        <circle
          cx="20"
          cy="7"
          r="1.4"
          fill="#e8b65b"
        />
        <circle
          cx="28"
          cy="10"
          r="1.4"
          fill="#8db9a5"
        />
      </svg>
    </span>
    <span class="display text-[1.25rem] leading-none tracking-[-0.04em]">{{ t('brand.name') }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

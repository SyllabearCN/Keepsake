<template>
  <NuxtLink
    to="/"
    class="group flex items-center gap-3"
    :aria-label="t('brand.homeLabel')"
  >
    <span class="family-mark__badge">
      <svg
        viewBox="0 0 48 48"
        class="size-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 25.2 24 10l15 15.2v13.3a3 3 0 0 1-3 3h-8.4V29.8h-7.2v11.7H12a3 3 0 0 1-3-3V25.2Z"
          fill="#17473d"
        />
        <path
          d="M24 11.8 36.7 24.3l-2.4 2.3L24 16.6l-10.3 10-2.4-2.3L24 11.8Z"
          fill="#2b6657"
        />
        <path
          d="M24 27.5c-5.5-3.7-7-6.8-5.1-8.9 1.4-1.6 4-1.4 5.1.4 1.1-1.8 3.7-2 5.1-.4 1.9 2.1.4 5.2-5.1 8.9Z"
          fill="#ed7658"
        />
        <circle
          cx="34.2"
          cy="16"
          r="2.2"
          fill="#ebc66a"
        />
      </svg>
    </span>
    <span class="display text-[1.25rem] leading-none tracking-[-0.04em]">{{ t('brand.name') }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.family-mark__badge {
  position: relative;
  display: grid;
  width: 2.55rem;
  height: 2.55rem;
  flex: none;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(43, 102, 87, 0.18);
  border-radius: 999px;
  background:
    radial-gradient(circle at 72% 20%, rgba(243, 255, 249, 0.75), transparent 42%),
    linear-gradient(145deg, #d4e5dd 0%, #9fc3b5 100%);
  box-shadow:
    inset 0 1px 0 rgba(244, 255, 250, 0.72),
    0 5px 16px rgba(35, 87, 73, 0.16);
}
</style>

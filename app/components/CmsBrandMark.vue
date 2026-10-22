<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean
  light?: boolean
}>(), {
  compact: false,
  light: false,
})
</script>

<template>
  <div
    class="brand-mark"
    :class="{ 'brand-mark--compact': compact, 'brand-mark--light': light }"
  >
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      class="brand-mark__symbol"
    >
      <path
        d="M9 25.2 24 10l15 15.2v13.3a3 3 0 0 1-3 3h-8.4V29.8h-7.2v11.7H12a3 3 0 0 1-3-3V25.2Z"
        fill="currentColor"
      />
      <path
        d="M24 27.5c-5.5-3.7-7-6.8-5.1-8.9 1.4-1.6 4-1.4 5.1.4 1.1-1.8 3.7-2 5.1-.4 1.9 2.1.4 5.2-5.1 8.9Z"
        fill="#ef7d5f"
      />
    </svg>
    <span
      v-if="!compact"
      class="brand-mark__text"
    >
      <strong>Keepsake</strong>
      <small>FAMILY ARCHIVE CMS</small>
    </span>
  </div>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--cms-brand);
}

.brand-mark--light {
  color: #fffaf0;
}

.brand-mark__symbol {
  width: 2.55rem;
  height: 2.55rem;
  flex: none;
}

.brand-mark__text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1;
}

.brand-mark__text strong {
  font-family: var(--font-display);
  font-size: 1.28rem;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.brand-mark__text small {
  margin-top: 0.35rem;
  color: var(--cms-muted);
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.brand-mark--light .brand-mark__text small {
  color: rgba(255, 250, 240, 0.55);
}

.brand-mark--compact .brand-mark__symbol {
  width: 2.2rem;
  height: 2.2rem;
}
</style>

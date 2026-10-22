<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="page-heading">
    <div class="page-heading__copy">
      <p
        v-if="eyebrow"
        class="page-heading__eyebrow"
      >
        {{ eyebrow }}
      </p>
      <h1>{{ title }}</h1>
      <p
        v-if="description"
        class="page-heading__description"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="page-heading__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.page-heading__copy {
  min-width: 0;
}

.page-heading__eyebrow {
  margin: 0 0 0.55rem;
  color: var(--cms-accent);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--cms-ink);
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.page-heading__description {
  max-width: 42rem;
  margin: 0.65rem 0 0;
  color: var(--cms-muted);
  font-size: 0.88rem;
  line-height: 1.7;
}

.page-heading__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.65rem;
}

@media (max-width: 640px) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .page-heading__actions {
    width: 100%;
  }

  .page-heading__actions :deep(.ant-btn) {
    flex: 1;
  }
}
</style>

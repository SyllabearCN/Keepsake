<script setup lang="ts">
import type { ViewMode } from '~/stores/preferences'

const model = defineModel<ViewMode>({ required: true })
const { t } = useI18n()

const options = computed(() => [
  { value: 'grid' as const, label: t('common.cardView'), icon: 'lucide:layout-grid' },
  { value: 'timeline' as const, label: t('common.timelineView'), icon: 'lucide:list-tree' },
])
</script>

<template>
  <div
    class="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1"
    role="group"
    :aria-label="t('common.cardView')"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors"
      :class="model === option.value
        ? 'bg-[var(--brand)] text-[var(--page)]'
        : 'text-muted hover:text-[var(--text)]'"
      :aria-pressed="model === option.value"
      :aria-label="option.label"
      :title="option.label"
      @click="model = option.value"
    >
      <Icon
        :name="option.icon"
        class="size-4"
      />
      {{ option.label }}
    </button>
  </div>
</template>

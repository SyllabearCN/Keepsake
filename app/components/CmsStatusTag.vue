<script setup lang="ts">
const props = defineProps<{
  status?: string
}>()

const state = computed(() => {
  if (props.status === 'published') {
    return { label: '已发布', tone: 'success' }
  }
  if (props.status === 'draft') {
    return { label: '草稿', tone: 'danger' }
  }
  return { label: '已归档', tone: 'danger' }
})
</script>

<template>
  <span
    class="status-tag"
    :class="`status-tag--${state.tone}`"
  >
    <span class="status-tag__dot" />
    {{ state.label }}
  </span>
</template>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.32rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 650;
  white-space: nowrap;
}

.status-tag__dot {
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: currentColor;
}

.status-tag--success {
  color: #276d51;
  background: #e5f2ea;
}

.status-tag--danger {
  color: #b54435;
  background: #fbe8e4;
}
</style>

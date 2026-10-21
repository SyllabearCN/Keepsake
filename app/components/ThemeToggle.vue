<script setup lang="ts">
const preferences = usePreferencesStore()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-strong)]"
    :aria-label="preferences.theme === 'dark' ? t('common.themeLight') : t('common.themeDark')"
    @click="preferences.toggleTheme"
  >
    <Icon
      :name="preferences.theme === 'dark' ? 'lucide:sun' : 'lucide:moon'"
      class="size-4"
    />
  </button>
</template>

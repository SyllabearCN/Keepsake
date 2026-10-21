<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

async function toggleLocale() {
  await setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
}
</script>

<template>
  <button
    type="button"
    class="grid h-10 min-w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[var(--surface-strong)]"
    :aria-label="t('common.language')"
    @click="toggleLocale"
  >
    {{ locale === 'zh-CN' ? 'EN' : '中' }}
  </button>
</template>

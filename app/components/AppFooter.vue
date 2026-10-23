<script setup lang="ts">
const { t } = useI18n()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="mt-24 border-t border-[var(--line)] pb-8 pt-14">
    <div class="page-shell">
      <div class="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <FamilyMark />
        </div>

        <div class="flex items-center gap-3 md:justify-end">
          <button
            type="button"
            class="pill-button border-[var(--line)] text-muted hover:border-[var(--brand)] hover:text-[var(--text)]"
            @click="scrollToTop"
          >
            {{ t('footer.backTop') }}
            <Icon
              name="lucide:arrow-up"
              class="size-4"
            />
          </button>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-[0.68rem] font-medium text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {{ new Date().getFullYear() }} {{ t('brand.name') }}</span>
        <span>{{ t('footer.rights') }}</span>
      </div>
    </div>
  </footer>
</template>

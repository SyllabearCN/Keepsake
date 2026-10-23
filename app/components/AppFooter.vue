<script setup lang="ts">
const { t } = useI18n()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="mt-24 border-t border-[var(--line)] pb-10 pt-12">
    <div class="page-shell">
      <div class="flex justify-center">
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

      <p class="mt-10 border-t border-[var(--line)] pt-6 text-center text-[0.68rem] font-medium text-muted">
        © {{ new Date().getFullYear() }} {{ t('brand.name') }}
        <span class="mx-2 text-[var(--line)]">·</span>
        {{ t('footer.rights') }}
      </p>
    </div>
  </footer>
</template>

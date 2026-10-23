<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from 'reka-ui'

const open = ref(false)
const route = useRoute()
const { t } = useI18n()

const links = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/gallery', label: t('nav.gallery') },
  { to: '/journeys', label: t('nav.journeys') },
  { to: '/stories', label: t('nav.stories') },
  { to: '/about', label: t('nav.about') },
])

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] md:hidden"
        :aria-label="t('nav.menu')"
      >
        <Icon
          name="lucide:menu"
          class="size-5"
        />
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogContent
        class="fixed inset-y-0 right-0 z-[90] flex w-[min(78vw,18rem)] flex-col border-l border-[var(--line)] bg-[var(--page)] p-5 shadow-2xl outline-none"
      >
        <div class="flex items-center justify-between">
          <FamilyMark />
          <DialogClose as-child>
            <button
              type="button"
              class="grid size-9 place-items-center rounded-full border border-[var(--line)]"
              :aria-label="t('nav.close')"
            >
              <Icon
                name="lucide:x"
                class="size-4"
              />
            </button>
          </DialogClose>
        </div>

        <VisuallyHidden>
          <DialogTitle>{{ t('nav.menu') }}</DialogTitle>
          <DialogDescription>{{ t('nav.close') }}</DialogDescription>
        </VisuallyHidden>

        <nav class="mt-8 flex flex-col">
          <NuxtLink
            v-for="(link, index) in links"
            :key="link.to"
            :to="link.to"
            class="mobile-nav-link group flex items-center justify-between border-b border-[var(--line)] py-3 text-[1rem] tracking-[-0.015em]"
            :class="{ 'mobile-nav-link--active': isActive(link.to) }"
          >
            <span class="display">{{ link.label }}</span>
            <span class="mobile-nav-link__index text-[0.65rem] font-bold text-muted">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </NuxtLink>
        </nav>

        <div class="mt-auto flex items-center gap-2.5 pt-8">
          <ThemeToggle />
          <LocaleSwitcher />
          <span class="ml-auto text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
            Est. 2019
          </span>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
[data-state="open"] {
  animation: nav-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-nav-link {
  color: var(--text);
}

.mobile-nav-link--active {
  color: var(--accent);
}

.mobile-nav-link--active .mobile-nav-link__index {
  color: var(--accent);
}

@keyframes nav-in {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
}
</style>

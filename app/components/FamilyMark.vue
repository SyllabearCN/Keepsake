<template>
  <NuxtLink
    to="/"
    class="group flex items-center gap-3"
    aria-label="Keepsake home"
  >
    <span class="relative grid size-10 place-items-center rounded-full bg-[var(--brand)] text-[var(--page)]">
      <svg
        viewBox="0 0 40 40"
        class="size-7"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="15"
          cy="17"
          r="8"
          stroke="currentColor"
          stroke-width="1.4"
        />
        <circle
          cx="25"
          cy="17"
          r="8"
          stroke="currentColor"
          stroke-width="1.4"
        />
        <circle
          cx="20"
          cy="25"
          r="8"
          stroke="currentColor"
          stroke-width="1.4"
        />
        <path
          d="M20 8.5v4M20 29v2.5M12.5 29l1.3 2"
          stroke="currentColor"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span class="leading-none">
      <span class="display block text-[1.25rem] tracking-[-0.04em]">Keepsake</span>
      <span class="mt-1 block text-[0.55rem] font-bold uppercase tracking-[0.22em] text-muted">The three of us</span>
    </span>
  </NuxtLink>
</template>

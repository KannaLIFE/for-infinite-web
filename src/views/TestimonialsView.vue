<script setup lang="ts">
import { testimonials } from '../data/testimonials';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">好评 · 回声</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/testimonials</span>
    </header>

    <div v-if="!testimonials.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      还没有回声，在 src/data/testimonials.ts 添加。
    </div>

    <div v-else class="fi-stagger grid gap-4 md:grid-cols-2">
      <blockquote
        v-for="t in testimonials"
        :key="t.from"
        class="fi-px-panel bg-[var(--fi-panel)] p-5"
      >
        <p class="text-sm italic leading-relaxed text-[var(--fi-text)]">「{{ t.text }}」</p>
        <footer class="mono mt-3 text-xs text-[var(--fi-muted)]">—— {{ t.from }}</footer>
      </blockquote>
    </div>
  </div>
</template>

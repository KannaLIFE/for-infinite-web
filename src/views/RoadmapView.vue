<script setup lang="ts">
import { roadmap } from '../data/roadmap';
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-5">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">路线图 · 星轨</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/roadmap</span>
    </header>

    <div class="fi-stagger space-y-6">
      <section v-for="r in roadmap" :key="r.phase" class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ r.phase }}</h2>
        <ul class="space-y-2">
          <li v-for="i in r.items" :key="i.text" class="mono flex items-center gap-2 text-sm">
            <span
              class="inline-block h-2.5 w-2.5"
              :class="i.status === 'done' ? 'bg-[var(--fi-blue)]' : i.status === 'now' ? 'bg-[var(--fi-warm)] animate-pulse' : 'bg-[var(--fi-line-solid)]'"
            ></span>
            <span :class="i.status === 'done' ? 'text-[var(--fi-muted)] line-through' : i.status === 'now' ? 'text-[var(--fi-text)]' : 'text-[var(--fi-muted)]'">
              {{ i.text }}
            </span>
            <span
              v-if="i.status === 'now'"
              class="border border-[var(--fi-warm)]/60 px-1.5 py-0.5 text-[9px] text-[var(--fi-warm)]"
            >进行中</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { achievements } from '../data/achievements';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">成就 · 里程碑</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-warm)]">/achievements</span>
    </header>

    <p class="mono text-xs text-[var(--fi-muted)]">
      已点亮 {{ achievements.filter((a) => a.unlocked).length }} / {{ achievements.length }}
    </p>

    <div class="fi-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="a in achievements"
        :key="a.id"
        class="fi-px-panel flex gap-3 bg-[var(--fi-panel)] p-4"
        :class="a.unlocked ? '' : 'opacity-55'"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center border-2 text-lg"
          :class="a.unlocked ? 'border-[var(--fi-warm)] bg-[var(--fi-warm)]/10' : 'border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]'"
        >
          {{ a.unlocked ? '🏆' : '❓' }}
        </span>
        <div class="min-w-0">
          <h2 class="mono truncate text-sm" :class="a.unlocked ? 'text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'">
            {{ a.title }}
          </h2>
          <p class="mt-1 text-xs leading-relaxed text-[var(--fi-muted)]">{{ a.unlocked ? a.desc : '尚未解锁' }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

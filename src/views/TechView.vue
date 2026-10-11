<script setup lang="ts">
import { tech } from '../data/tech';

function blocks(level: number): number {
  return Math.round((level / 100) * 20);
}
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">鎶€鏈爤 路 闄勯瓟鍙?/h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/tech</span>
    </header>

    <div class="fi-stagger grid gap-4 md:grid-cols-2">
      <div v-for="t in tech" :key="t.name" class="fi-px-panel bg-[var(--fi-panel)] p-4">
        <div class="flex items-baseline justify-between gap-3">
          <h2 class="mono text-sm text-[var(--fi-text)]">
            <span v-if="t.kind === 'learning'" class="mr-1 text-[var(--fi-violet)]">鉁?/span>{{ t.name }}
          </h2>
          <span class="mono text-[10px]" :class="t.kind === 'using' ? 'text-[var(--fi-blue)]' : 'text-[var(--fi-violet)]'">
            {{ t.kind === 'using' ? '鎺屾彙' : '瀛︿範涓? }} {{ t.level }}
          </span>
        </div>
        <div class="mt-2 flex gap-0.5">
          <span
            v-for="i in 20"
            :key="i"
            class="h-3 w-full"
            :class="i <= blocks(t.level) ? (t.kind === 'using' ? 'bg-[var(--fi-blue)]' : 'bg-[var(--fi-violet)]') : 'bg-[var(--fi-panel-2)]'"
          ></span>
        </div>
        <p v-if="t.desc" class="mt-2 text-xs text-[var(--fi-muted)]">{{ t.desc }}</p>
      </div>
    </div>
  </div>
</template>

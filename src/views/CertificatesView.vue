<script setup lang="ts">
import { certificates } from '../data/certificates';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">证书 · 凭证</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/certificates</span>
    </header>

    <div v-if="!certificates.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      还没有凭证，在 src/data/certificates.ts 添加。
    </div>

    <div v-else class="fi-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="c in certificates" :key="c.name" class="fi-px-panel flex items-center gap-3 bg-[var(--fi-panel)] p-4">
        <span class="mono flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--fi-violet-dim)] bg-[var(--fi-panel-2)] text-[var(--fi-violet)]">▣</span>
        <div class="min-w-0">
          <h2 class="mono truncate text-sm text-[var(--fi-text)]">{{ c.name }}</h2>
          <p class="mt-0.5 text-xs text-[var(--fi-muted)]">
            {{ c.issuer }}<template v-if="c.date"> · {{ c.date }}</template>
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

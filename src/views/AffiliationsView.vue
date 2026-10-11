<script setup lang="ts">
import { affiliations } from '../data/affiliations';
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-5">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">阵营 · 组织</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/affiliations</span>
    </header>

    <div v-if="!affiliations.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      还没有加入任何阵营，在 src/data/affiliations.ts 添加。
    </div>

    <div v-else class="fi-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="a in affiliations"
        :key="a.name"
        class="fi-px-panel bg-[var(--fi-panel)] p-4 transition hover:border-[var(--fi-blue)]"
      >
        <h2 class="mono text-base text-[var(--fi-text)]">{{ a.name }}</h2>
        <p v-if="a.desc" class="mt-2 text-xs leading-relaxed text-[var(--fi-muted)]">{{ a.desc }}</p>
        <div v-if="a.tags && a.tags.length" class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="t in a.tags"
            :key="t"
            class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-muted)]"
          >{{ t }}</span>
        </div>
        <a
          v-if="a.link"
          :href="a.link"
          target="_blank"
          rel="noopener"
          class="mono mt-3 inline-block text-xs text-[var(--fi-blue)] hover:text-[var(--fi-warm)]"
        >前往 ▸</a>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Contribution {
  date: string;
  count: number;
  level: number;
}

const cells = ref<{ date: string; count: number; level: number }[]>([]);
const total = ref<number | null>(null);
const failed = ref(false);
const loading = ref(true);

const colors = [
  'rgba(121,184,255,0.07)',
  'rgba(121,184,255,0.28)',
  'rgba(121,184,255,0.5)',
  'rgba(121,184,255,0.74)',
  'rgba(121,184,255,1)',
];

const WEEKS = 53;
const DAYS = 7;

onMounted(async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch('https://github-contributions-api.jogruber.de/v4/kannalife', {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error('http');
    const data = (await res.json()) as { contributions?: Contribution[] };
    const list = (data.contributions ?? []).slice(-(WEEKS * DAYS));
    cells.value = list;
    total.value = list.reduce((s, c) => s + c.count, 0);
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="fi-px-panel min-w-0 overflow-hidden bg-[var(--fi-panel)] p-4">
    <div class="flex items-center justify-between">
      <h3 class="mono text-xs text-[var(--fi-warm)]">CONTRIBUTIONS · 贡献图</h3>
      <span class="mono text-[10px] text-[var(--fi-muted)]">
        <template v-if="loading">加载中…</template>
        <template v-else-if="failed">信号不可达</template>
        <template v-else>近一年 {{ total }} 次提交</template>
      </span>
    </div>

    <div v-if="loading || failed" class="mt-3 flex h-20 items-center justify-center">
      <span class="mono text-xs text-[var(--fi-muted)]">{{ failed ? '星联中断' : '…' }}</span>
    </div>

    <div
      v-else
      class="mt-3 grid gap-[3px]"
      style="grid-auto-flow: column; grid-template-columns: repeat(53, minmax(0, 1fr)); grid-template-rows: repeat(7, 10px)"
    >
      <span
        v-for="c in cells"
        :key="c.date"
        class="h-full w-full"
        :style="{ background: colors[c.level] ?? colors[0] }"
        :title="`${c.date}: ${c.count}`"
      ></span>
    </div>
  </div>
</template>

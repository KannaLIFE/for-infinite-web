<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { API_BASE } from '../lib/api';

interface RankItem {
  name: string;
  artist: string;
  play: number;
}

const state = ref<'loading' | 'online' | 'offline'>('loading');
const list = ref<RankItem[]>([]);

onMounted(async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`${API_BASE}/api/netease/rank`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error();
    list.value = await r.json();
    state.value = 'online';
  } catch {
    state.value = 'offline';
  }
});
</script>

<template>
  <div class="mt-2">
    <p v-if="state === 'loading'" class="mono animate-pulse text-[10px] text-[var(--fi-muted)]">听歌记录接收中…</p>
    <p v-else-if="state === 'offline'" class="text-[10px] text-[var(--fi-muted)]">
      暂不可读（后端未运行，或未配置网易云 Cookie）。
    </p>
    <div v-else class="space-y-1.5">
      <div v-for="(s, i) in list" :key="s.name + i" class="flex items-baseline gap-2 border-l-2 border-[var(--fi-blue-dim)] py-0.5 pl-2">
        <span class="mono w-4 shrink-0 text-[9px]" :class="i < 3 ? 'text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'">
          {{ i + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="mono truncate text-xs text-[var(--fi-text)]">{{ s.name }}</p>
          <p class="truncate text-[9px] text-[var(--fi-muted)]">{{ s.artist }}</p>
        </div>
        <span class="mono shrink-0 text-[9px] text-[var(--fi-muted)]">{{ s.play }} 次</span>
      </div>
      <p v-if="!list.length" class="mono text-[10px] text-[var(--fi-muted)]">本周暂无记录。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface RankItem {
  name: string;
  artist: string;
  play: number;
  pic?: string;
}
interface Snapshot {
  updatedAt?: string;
  week: RankItem[];
}

const base = import.meta.env.BASE_URL;
const state = ref<'loading' | 'online' | 'offline'>('loading');
const list = ref<RankItem[]>([]);
const updatedAt = ref('');

onMounted(async () => {
  try {
    const r = await fetch(`${base}data/netease.json`, { cache: 'no-store' });
    if (!r.ok) throw new Error();
    const j = (await r.json()) as Snapshot;
    list.value = j.week || [];
    updatedAt.value = j.updatedAt || '';
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
      暂无快照数据（开机快照未运行或抓取失败）。
    </p>
    <div v-else class="space-y-1.5">
      <div v-for="(s, i) in list" :key="s.name + i" class="flex items-center gap-2 border-l-2 border-[var(--fi-blue-dim)] py-0.5 pl-2">
        <span class="mono w-4 shrink-0 text-[9px]" :class="i < 3 ? 'text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'">
          {{ i + 1 }}
        </span>
        <div
          class="relative h-9 w-9 shrink-0 overflow-hidden border border-[var(--fi-line-solid)] bg-[var(--fi-bg)]"
        >
          <img
            v-if="s.pic"
            :src="s.pic"
            :alt="s.name"
            class="h-full w-full object-cover"
            loading="lazy"
            referrerpolicy="no-referrer"
          />
          <span v-else class="absolute inset-0 flex items-center justify-center text-[8px] text-[var(--fi-muted)]">♪</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="mono truncate text-xs text-[var(--fi-text)]">{{ s.name }}</p>
          <p class="truncate text-[9px] text-[var(--fi-muted)]">{{ s.artist }}</p>
        </div>
        <span class="mono shrink-0 text-[9px] text-[var(--fi-muted)]">{{ s.play }} 次</span>
      </div>
      <p v-if="!list.length" class="mono text-[10px] text-[var(--fi-muted)]">本周暂无记录。</p>
      <p v-if="updatedAt" class="mono text-right text-[8px] text-[var(--fi-muted)]">
        更新于 {{ updatedAt.slice(5, 10) }} {{ updatedAt.slice(11, 16) }}
      </p>
    </div>
  </div>
</template>

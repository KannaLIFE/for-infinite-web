<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{ username: string }>();

interface Repo {
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}
interface User {
  public_repos: number;
  followers: number;
  following: number;
}
interface Snapshot {
  repos?: number;
  followers?: number;
  stars?: number;
  forks?: number;
  contributions?: number;
  langs?: { name: string; n: number }[];
}

const base = import.meta.env.BASE_URL;
const user = ref<User | null>(null);
const repos = ref<Repo[]>([]);
const contributions = ref<number | null>(null);
const snap = ref<Snapshot | null>(null);
const state = ref<'loading' | 'online' | 'offline'>('loading');

const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  'C#': '#178600',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  PowerShell: '#012456',
  Rust: '#dea584',
  Go: '#00ADD8',
  PHP: '#4F5D95',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Lua: '#000080',
  Ruby: '#701516',
  MDX: '#fcb32c',
};

const totals = computed(() => {
  if (snap.value && snap.value.stars !== undefined) {
    return { stars: snap.value.stars, forks: snap.value.forks || 0 };
  }
  const own = repos.value.filter((r) => !r.fork);
  return {
    stars: own.reduce((a, r) => a + r.stargazers_count, 0),
    forks: own.reduce((a, r) => a + r.forks_count, 0),
  };
});

const langs = computed(() => {
  if (snap.value && snap.value.langs) {
    const max = snap.value.langs.length ? snap.value.langs[0].n : 1;
    return snap.value.langs.map((l) => ({ name: l.name, n: l.n, pct: Math.round((l.n / max) * 100) }));
  }
  const m = new Map<string, number>();
  for (const r of repos.value) {
    if (!r.fork && r.language) {
      m.set(r.language, (m.get(r.language) || 0) + (r.stargazers_count > 0 ? r.stargazers_count : 1));
    }
  }
  const arr = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = arr.length ? arr[0][1] : 1;
  return arr.map(([name, n]) => ({ name, n, pct: Math.round((n / max) * 100) }));
});

async function loadLive(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const [u, r, c] = await Promise.all([
      fetch(`https://api.github.com/users/${props.username}`, { signal: ctrl.signal }).then((x) => (x.ok ? x.json() : Promise.reject(new Error()))),
      fetch(`https://api.github.com/users/${props.username}/repos?per_page=100&sort=pushed`, { signal: ctrl.signal }).then((x) => (x.ok ? x.json() : Promise.reject(new Error()))),
      fetch(`https://github-contributions-api.jogruber.de/v4/${props.username}?y=last`, { signal: ctrl.signal }).then((x) => (x.ok ? x.json() : Promise.reject(new Error()))),
    ]);
    clearTimeout(t);
    user.value = u;
    repos.value = r;
    const list = (c.contributions ?? []) as { count: number }[];
    contributions.value = list.reduce((s, d) => s + d.count, 0);
    state.value = 'online';
  } catch {
    state.value = 'offline';
  }
}

onMounted(async () => {
  try {
    const r = await fetch(`${base}data/github.json`, { cache: 'no-store' });
    if (!r.ok) throw new Error();
    const j = (await r.json()) as Snapshot;
    if (!j || j.repos === undefined || (j as { error?: string }).error) throw new Error();
    snap.value = j;
    state.value = 'online';
  } catch {
    await loadLive();
  }
});
</script>

<template>
  <div v-if="state === 'offline'" class="mono text-[10px] text-[var(--fi-muted)]">星联离线，统计暂不可读。</div>
  <div v-else-if="state === 'loading'" class="mono animate-pulse text-[10px] text-[var(--fi-muted)]">统计接收中…</div>
  <div v-else class="space-y-2">
    <div class="grid grid-cols-5 gap-1.5 text-center">
      <div
        v-for="cell in [
          { label: '仓库', value: snap && snap.repos !== undefined ? snap.repos : (user ? user.public_repos : 0) },
          { label: '贡献', value: snap && snap.contributions !== undefined ? snap.contributions : (contributions !== null ? contributions : '…') },
          { label: '星标', value: totals.stars },
          { label: 'Fork', value: totals.forks },
          { label: '粉丝', value: snap && snap.followers !== undefined ? snap.followers : (user ? user.followers : 0) },
        ]"
        :key="cell.label"
        class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] py-1"
      >
        <p class="mono text-[11px] font-bold text-[var(--fi-blue)]">{{ cell.value }}</p>
        <p class="mono text-[8px] text-[var(--fi-muted)]">{{ cell.label }}</p>
      </div>
    </div>
    <div class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-2">
      <p class="mono mb-1.5 text-[9px] text-[var(--fi-muted)]">常用语言</p>
      <div v-for="l in langs" :key="l.name" class="mb-1 flex items-center gap-1.5 last:mb-0">
        <span class="mono w-16 shrink-0 truncate text-[9px] text-[var(--fi-text)]">{{ l.name }}</span>
        <div class="h-1.5 flex-1 bg-[var(--fi-bg)]">
          <div class="h-full" :style="{ width: l.pct + '%', background: langColors[l.name] || 'var(--fi-blue)' }"></div>
        </div>
        <span class="mono w-4 shrink-0 text-right text-[8px] text-[var(--fi-muted)]">{{ l.n }}</span>
      </div>
      <p v-if="!langs.length" class="mono text-[9px] text-[var(--fi-muted)]">暂无数据</p>
    </div>
  </div>
</template>

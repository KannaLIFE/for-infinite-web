<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { profile } from '../data/profile';
import { projects as staticProjects } from '../data/projects';

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
  fork: boolean;
}

const repos = ref<Repo[]>([]);
const failed = ref(false);
const loading = ref(true);

onMounted(async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://api.github.com/users/${profile.ghUser}/repos?sort=updated&per_page=12`,
      { signal: ctrl.signal },
    );
    clearTimeout(t);
    if (!res.ok) throw new Error('http');
    const list = (await res.json()) as Repo[];
    repos.value = list.filter((r) => !r.fork).slice(0, 9);
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">项目 · 工坊</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/projects</span>
    </header>
    <p class="mono text-xs text-[var(--fi-muted)]">
      数据来自 GitHub 公开 API · @{{ profile.ghUser }} · 按最近更新排序
    </p>

    <div v-if="loading" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      正在连接 GitHub……
    </div>

    <div v-else-if="failed" class="fi-px-panel space-y-3 bg-[var(--fi-panel)] p-8">
      <p class="mono text-center text-sm text-[var(--fi-muted)]">GitHub 信号不可达，显示备用列表。</p>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="p in staticProjects"
          :key="p.name"
          :href="p.links && p.links.length ? p.links[0].url : '#'"
          target="_blank"
          rel="noopener"
          class="fi-px-panel bg-[var(--fi-panel)] p-4 transition hover:border-[var(--fi-blue)]"
        >
          <h2 class="mono text-sm text-[var(--fi-text)]">{{ p.name }}</h2>
          <p v-if="p.desc" class="mt-1.5 text-xs text-[var(--fi-muted)]">{{ p.desc }}</p>
        </a>
      </div>
    </div>

    <div v-else-if="!repos.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      GitHub 上还没有公开仓库。
    </div>

    <div v-else class="fi-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a
        v-for="r in repos"
        :key="r.name"
        :href="r.html_url"
        target="_blank"
        rel="noopener"
        class="fi-px-panel group flex flex-col bg-[var(--fi-panel)] p-4 transition hover:border-[var(--fi-blue)]"
      >
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="mono truncate text-sm text-[var(--fi-text)] transition group-hover:text-[var(--fi-blue)]">
            {{ r.name }}
          </h2>
          <span class="mono shrink-0 text-[10px] text-[var(--fi-warm)]">★ {{ r.stargazers_count }}</span>
        </div>
        <p class="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-[var(--fi-muted)]">
          {{ r.description || '暂无描述' }}
        </p>
        <div class="mono mt-3 flex items-center justify-between gap-2 text-[10px] text-[var(--fi-muted)]">
          <span v-if="r.language" class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[var(--fi-violet)]">
            {{ r.language }}
          </span>
          <span v-else></span>
          <span>{{ new Date(r.updated_at).toLocaleDateString() }} 更新</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { marked } from 'marked';
import { api } from '../lib/api';
import { getToken, setToken } from '../lib/auth';
import type { Article, ArticleMeta } from '../types';

type Tab = 'worldview' | 'reality';

const tab = ref<Tab>('worldview');
const articles = ref<ArticleMeta[]>([]);
const selectedIdx = ref(0);
const expanded = ref<Article | null>(null);

// 现实解锁
const keyInput = ref('');
const unlockError = ref('');
const unlocked = ref(false);

const years = computed(() => {
  const set = new Set(articles.value.map((a) => a.year ?? 0));
  return [...set].sort((a, b) => b - a); // 最新在前
});

const currentYear = computed(() => years.value[selectedIdx.value] ?? 0);

const currentArticles = computed(() =>
  articles.value.filter((a) => (a.year ?? 0) === currentYear.value),
);

async function load(): Promise<void> {
  if (tab.value === 'reality' && !unlocked.value) return;
  try {
    const token = getToken() || undefined;
    const r = await api.get<{ items: ArticleMeta[] }>(
      `/api/articles/${tab.value}`,
      token,
    );
    articles.value = r.items;
    selectedIdx.value = 0;
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      unlocked.value = false;
      articles.value = [];
    }
  }
}

function onWheel(e: WheelEvent): void {
  if (!years.value.length) return;
  const n = years.value.length;
  if (e.deltaY < 0) selectedIdx.value = (selectedIdx.value + 1) % n;
  else if (e.deltaY > 0) selectedIdx.value = (selectedIdx.value - 1 + n) % n;
}

async function unlock(): Promise<void> {
  unlockError.value = '';
  try {
    const r = await api.post<{ ok: boolean; token?: string; error?: string }>(
      '/api/auth/unlock',
      { key: keyInput.value.trim() },
    );
    if (r.ok && r.token) {
      setToken(r.token);
      unlocked.value = true;
      keyInput.value = '';
      await load();
    } else {
      unlockError.value = '钥匙无效';
    }
  } catch {
    unlockError.value = '解锁失败';
  }
}

async function openArticle(slug: string): Promise<void> {
  try {
    const token = getToken() || undefined;
    expanded.value = await api.get<Article>(`/api/articles/${tab.value}/${slug}`, token);
  } catch {
    /* ignore */
  }
}

function renderMarkdown(s: string): string {
  return marked.parse(s) as string;
}

function pointerAngle(): number {
  const n = years.value.length;
  if (!n) return -90;
  return (selectedIdx.value / n) * 360 - 90;
}

watch(tab, () => void load());
onMounted(() => void load());
</script>

<template>
  <div class="flex flex-col gap-8 md:flex-row">
    <!-- 左侧：钟表时间线 -->
    <aside class="md:w-72 md:shrink-0">
      <div class="sticky top-20">
        <!-- 分类切换 -->
        <div class="mb-4 flex rounded-lg border border-[var(--fi-line)] p-1">
          <button
            v-for="t in (['worldview', 'reality'] as Tab[])"
            :key="t"
            class="flex-1 rounded-md py-2 text-sm transition"
            :class="tab === t ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'"
            @click="tab = t"
          >
            {{ t === 'worldview' ? '世界观' : '现实' }}
          </button>
        </div>

        <!-- 钟表 -->
        <div
          class="relative mx-auto flex h-64 w-64 cursor-ns-resize items-center justify-center rounded-full border border-[var(--fi-line)] bg-[var(--fi-panel)] select-none"
          @wheel.prevent="onWheel"
        >
          <svg viewBox="0 0 200 200" class="absolute inset-0 h-full w-full">
            <circle cx="100" cy="100" r="92" fill="none" stroke="var(--fi-line)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--fi-blue-dim)" stroke-opacity="0.4" />
            <!-- 刻度 -->
            <g v-for="(y, i) in years" :key="y">
              <line
                :x1="100 + 78 * Math.cos(((i / years.length) * 360 - 90) * Math.PI / 180)"
                :y1="100 + 78 * Math.sin(((i / years.length) * 360 - 90) * Math.PI / 180)"
                :x2="100 + 88 * Math.cos(((i / years.length) * 360 - 90) * Math.PI / 180)"
                :y2="100 + 88 * Math.sin(((i / years.length) * 360 - 90) * Math.PI / 180)"
                :stroke="i === selectedIdx ? 'var(--fi-warm)' : 'var(--fi-muted)'"
                stroke-width="1.5"
              />
            </g>
            <!-- 指针 -->
            <line
              :x1="100"
              :y1="100"
              :x2="100 + 60 * Math.cos(pointerAngle() * Math.PI / 180)"
              :y2="100 + 60 * Math.sin(pointerAngle() * Math.PI / 180)"
              stroke="var(--fi-warm)"
              stroke-width="2"
            />
            <circle cx="100" cy="100" r="3" fill="var(--fi-warm)" />
          </svg>
          <div class="pointer-events-none absolute text-center">
            <div class="mono text-3xl font-semibold text-[var(--fi-text)]">
              {{ currentYear }}<span class="text-sm text-[var(--fi-muted)]"> 年</span>
            </div>
            <div class="mono mt-1 text-[10px] text-[var(--fi-muted)]">滚动表盘</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧：文章列表 -->
    <section class="min-w-0 flex-1">
      <!-- 现实解锁 -->
      <div
        v-if="tab === 'reality' && !unlocked"
        class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6"
      >
        <h2 class="mono text-sm text-[var(--fi-warm)]">权限环带</h2>
        <p class="mt-2 text-sm text-[var(--fi-muted)]">现实记录已上锁，请输入钥匙解锁。</p>
        <div class="mt-4 flex gap-2">
          <input
            v-model="keyInput"
            type="password"
            class="mono flex-1 rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
            placeholder="钥匙……"
            @keyup.enter="unlock"
          />
          <button
            class="rounded-lg px-4 py-2 text-sm"
            style="background: var(--fi-warm); color: #1a1208"
            @click="unlock"
          >
            解锁
          </button>
        </div>
        <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
      </div>

      <template v-else>
        <div v-if="!currentArticles.length" class="mono text-sm text-[var(--fi-muted)]">
          这一年没有记录。
        </div>
        <div v-else class="space-y-3">
          <article
            v-for="a in currentArticles"
            :key="a.slug"
            class="cursor-pointer rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5 transition hover:border-[var(--fi-blue-dim)]"
            @click="openArticle(a.slug)"
          >
            <div class="flex items-baseline justify-between gap-4">
              <h2 class="text-lg font-medium text-[var(--fi-text)]">{{ a.title }}</h2>
              <time v-if="a.date" class="mono shrink-0 text-xs text-[var(--fi-muted)]">{{ a.date }}</time>
            </div>
            <p v-if="a.excerpt" class="mt-2 text-sm text-[var(--fi-muted)]">{{ a.excerpt }}</p>
          </article>
        </div>
      </template>
    </section>

    <!-- 详情弹层 -->
    <div
      v-if="expanded"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-6 pt-16"
      @click.self="expanded = null"
    >
      <div class="w-full max-w-3xl rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-8">
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-2xl font-semibold text-[var(--fi-text)]">{{ expanded.title }}</h2>
          <button class="mono text-sm text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="expanded = null">
            关闭 ✕
          </button>
        </div>
        <div class="mt-6 max-w-none leading-relaxed text-[var(--fi-text)]" v-html="renderMarkdown(expanded.content)"></div>
      </div>
    </div>
  </div>
</template>

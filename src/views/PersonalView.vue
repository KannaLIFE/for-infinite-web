<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';
import { getToken, hasScope, setAuth } from '../lib/auth';
import { renderMarkdown } from '../lib/md';
import type { Article, ArticleMeta } from '../types';
import ClockDial from '../components/ClockDial.vue';

const worldArticles = ref<ArticleMeta[]>([]);
const realityArticles = ref<ArticleMeta[]>([]);
const currentYear = ref(0);
const expanded = ref<Article | null>(null);

const realityLoaded = ref(false);
const showReality = ref(false);
const keyInput = ref('');
const unlockError = ref('');
const unlocking = ref(false);

function groupByYear(list: ArticleMeta[]): Map<number, ArticleMeta[]> {
  const map = new Map<number, ArticleMeta[]>();
  for (const a of list) {
    const y = a.year ?? 0;
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(a);
  }
  return map;
}

const worldByYear = computed(() => groupByYear(worldArticles.value));
const realityByYear = computed(() => groupByYear(realityArticles.value));

const dialYears = computed(() => {
  const set = new Set<number>();
  for (const a of worldArticles.value) set.add(a.year ?? 0);
  if (realityLoaded.value) for (const a of realityArticles.value) set.add(a.year ?? 0);
  return [...set].sort((a, b) => a - b);
});

const worldOfYear = computed(() => worldByYear.value.get(currentYear.value) ?? []);
const realityOfYear = computed(() => realityByYear.value.get(currentYear.value) ?? []);

const canReadReality = computed(() => hasScope('article') || hasScope('admin'));

async function loadWorld(): Promise<void> {
  try {
    const r = await api.get<{ items: ArticleMeta[] }>('/api/articles/worldview');
    worldArticles.value = r.items;
    if (dialYears.value.length && !currentYear.value) {
      currentYear.value = Math.max(...dialYears.value);
    }
  } catch {

  }
}

async function loadReality(): Promise<void> {
  try {
    const r = await api.get<{ items: ArticleMeta[] }>(
      '/api/articles/reality',
      getToken() || undefined,
    );
    realityArticles.value = r.items;
    realityLoaded.value = true;
  } catch (err) {
    if ((err as { status?: number }).status === 401) realityLoaded.value = false;
  }
}

async function unlockReality(): Promise<void> {
  unlockError.value = '';
  unlocking.value = true;
  try {
    const r = await api.post<{ ok: boolean; token?: string; scopes?: string[]; error?: string }>(
      '/api/auth/unlock',
      { key: keyInput.value.trim() },
    );
    if (r.ok && r.token) {
      setAuth(r.token, r.scopes ?? []);
      keyInput.value = '';
      await loadReality();
    } else {
      unlockError.value = '钥匙无效';
    }
  } catch {
    unlockError.value = '解锁失败';
  } finally {
    unlocking.value = false;
  }
}

async function toggleReality(): Promise<void> {
  showReality.value = !showReality.value;
  if (showReality.value && !realityLoaded.value && canReadReality.value) {
    await loadReality();
  }
}

async function openArticle(slug: string, category: 'worldview' | 'reality'): Promise<void> {
  try {
    const token = getToken() || undefined;
    expanded.value = await api.get<Article>(`/api/articles/${category}/${slug}`, token);
  } catch {

  }
}

onMounted(async () => {
  await loadWorld();
  if (canReadReality.value) await loadReality();
});
</script>

<template>
  <div>
    <div class="space-y-8 px-5 md:hidden">
      <header class="flex items-center gap-3">
        <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">个人文章</h1>
        <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/clock</span>
      </header>

      <div v-for="y in dialYears" :key="y" class="space-y-2">
        <h2 class="mono text-lg text-[var(--fi-warm)]">{{ y }} 年</h2>
        <article
          v-for="a in worldByYear.get(y)"
          :key="a.slug"
          class="fi-px-panel cursor-pointer bg-[var(--fi-panel)] p-4 transition hover:border-[var(--fi-blue)]"
          @click="openArticle(a.slug, 'worldview')"
        >
          <span class="mono text-sm text-[var(--fi-text)]">{{ a.title }}</span>
        </article>
        <article
          v-if="realityLoaded"
          v-for="a in realityByYear.get(y)"
          :key="'r' + a.slug"
          class="fi-px-panel cursor-pointer bg-[var(--fi-panel)] p-4 transition hover:border-[var(--fi-warm)]"
          @click="openArticle(a.slug, 'reality')"
        >
          <span class="mono text-sm text-[var(--fi-warm-soft)]">现实 · {{ a.title }}</span>
        </article>
      </div>

      <div v-if="!realityLoaded" class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <p class="text-sm text-[var(--fi-muted)]">现实记录已上锁。</p>
        <div v-if="!canReadReality" class="mt-3 flex gap-2">
          <input
            v-model="keyInput"
            type="password"
            class="mono fi-px-panel min-w-0 flex-1 bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
            placeholder="钥匙……"
            @keyup.enter="unlockReality"
          />
          <button class="mono fi-px-btn px-3 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlockReality">
            解锁
          </button>
        </div>
        <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
      </div>
    </div>

    <div class="hidden md:flex">
      <aside class="relative w-72 shrink-0">
        <ClockDial v-model="currentYear" :years="dialYears" />
      </aside>

      <section class="min-w-0 flex-1 space-y-4 py-6 pr-6">
        <div
          v-for="a in worldOfYear"
          :key="a.slug"
          class="fi-px-panel cursor-pointer bg-[var(--fi-panel)] p-5 transition hover:border-[var(--fi-blue)]"
          @click="openArticle(a.slug, 'worldview')"
        >
          <h3 class="mono text-lg text-[var(--fi-text)]">{{ a.title }}</h3>
          <p v-if="a.excerpt" class="mt-1 text-sm text-[var(--fi-muted)]">{{ a.excerpt }}</p>
        </div>
        <div v-if="!worldOfYear.length && !realityOfYear.length" class="mono text-sm text-[var(--fi-muted)]">
          这一年没有记录。
        </div>

        <div class="fi-px-panel bg-[var(--fi-panel)] p-5">
          <div class="flex items-center justify-between">
            <span class="mono text-sm text-[var(--fi-muted)]">
              现实
              <span v-if="realityLoaded && realityOfYear.length">· {{ realityOfYear.length }} 篇</span>
              <span v-else-if="realityLoaded">· 该年无现实记录</span>
              <span v-else>· 上锁</span>
            </span>
            <button
              class="mono fi-px-btn bg-[var(--fi-panel-2)] px-3 py-1.5 text-xs"
              :class="showReality ? 'text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'"
              @click="toggleReality"
            >
              {{ showReality ? '收起' : '展开' }}
            </button>
          </div>

          <div v-if="showReality && !realityLoaded && !canReadReality" class="mt-3">
            <p class="text-xs text-[var(--fi-muted)]">现实记录已上锁，需要钥匙。</p>
            <div class="mt-2 flex gap-2">
              <input
                v-model="keyInput"
                type="password"
                class="mono fi-px-panel min-w-0 flex-1 bg-[var(--fi-panel-2)] px-3 py-1.5 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
                placeholder="钥匙……"
                @keyup.enter="unlockReality"
              />
              <button
                class="mono fi-px-btn px-3 py-1.5 text-xs text-[var(--fi-warm)]"
                :disabled="unlocking"
                @click="unlockReality"
              >
                {{ unlocking ? '…' : '解锁' }}
              </button>
            </div>
            <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
          </div>

          <div v-if="showReality && realityLoaded" class="mt-3 space-y-2">
            <div
              v-for="a in realityOfYear"
              :key="a.slug"
              class="cursor-pointer border-2 border-[var(--fi-violet-dim)] bg-[var(--fi-panel-2)] p-3 transition hover:border-[var(--fi-warm)]"
              @click="openArticle(a.slug, 'reality')"
            >
              <span class="mono text-sm text-[var(--fi-warm-soft)]">{{ a.title }}</span>
            </div>
            <p v-if="!realityOfYear.length" class="text-xs text-[var(--fi-muted)]">该年无现实记录。</p>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="expanded"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-6 pt-16"
      @click.self="expanded = null"
    >
      <div class="fi-px-panel w-full max-w-3xl bg-[var(--fi-panel)] p-8">
        <div class="flex items-start justify-between gap-4">
          <h2 class="mono text-xl text-[var(--fi-text)]">{{ expanded.title }}</h2>
          <button class="mono text-sm text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="expanded = null">
            关闭 ✕
          </button>
        </div>
        <img
          v-if="expanded.cover"
          :src="expanded.cover"
          :alt="expanded.title"
          class="mt-4 max-h-72 w-full border-2 border-[var(--fi-line-solid)] object-cover"
        />
        <div class="mt-6 max-w-none leading-relaxed text-[var(--fi-text)]" v-html="renderMarkdown(expanded.content)"></div>
      </div>
    </div>
  </div>
</template>

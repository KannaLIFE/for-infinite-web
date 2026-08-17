<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { marked } from 'marked';
import { api } from '../lib/api';
import { getToken, hasScope, setAuth } from '../lib/auth';
import type { Article, ArticleMeta } from '../types';
import ClockDial from '../components/ClockDial.vue';

// ===== 数据 =====
const worldArticles = ref<ArticleMeta[]>([]);
const realityArticles = ref<ArticleMeta[]>([]);
const currentYear = ref(0);
const expanded = ref<Article | null>(null);

// 现实解锁状态
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

/** 钟表/列表的年份：世界观 ∪（解锁后）现实 */
const dialYears = computed(() => {
  const set = new Set<number>();
  for (const a of worldArticles.value) set.add(a.year ?? 0);
  if (realityLoaded.value) for (const a of realityArticles.value) set.add(a.year ?? 0);
  return [...set].sort((a, b) => a - b);
});

const worldOfYear = computed(() => worldByYear.value.get(currentYear.value) ?? []);
const realityOfYear = computed(() => realityByYear.value.get(currentYear.value) ?? []);

const canReadReality = computed(() => hasScope('article') || hasScope('admin'));

// ===== 加载 =====
async function loadWorld(): Promise<void> {
  try {
    const r = await api.get<{ items: ArticleMeta[] }>('/api/articles/worldview');
    worldArticles.value = r.items;
    if (dialYears.value.length && !currentYear.value) {
      currentYear.value = Math.max(...dialYears.value);
    }
  } catch {
    /* ignore */
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
    /* ignore */
  }
}

function renderMarkdown(s: string): string {
  return marked.parse(s) as string;
}

onMounted(async () => {
  await loadWorld();
  if (canReadReality.value) await loadReality();
});
</script>

<template>
  <div>
    <!-- ============ 移动版：竖排列表 ============ -->
    <div class="space-y-8 px-5 md:hidden">
      <header>
        <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">个人文章</h1>
      </header>

      <div v-for="y in dialYears" :key="y" class="space-y-2">
        <h2 class="mono text-lg text-[var(--fi-warm)]">{{ y }} 年</h2>
        <article
          v-for="a in worldByYear.get(y)"
          :key="a.slug"
          class="cursor-pointer rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-4"
          @click="openArticle(a.slug, 'worldview')"
        >
          <span class="text-sm font-medium text-[var(--fi-text)]">{{ a.title }}</span>
        </article>
        <article
          v-if="realityLoaded"
          v-for="a in realityByYear.get(y)"
          :key="'r' + a.slug"
          class="cursor-pointer rounded-xl border border-[var(--fi-warm)]/40 bg-[var(--fi-panel)] p-4"
          @click="openArticle(a.slug, 'reality')"
        >
          <span class="text-sm text-[var(--fi-warm-soft)]">现实 · {{ a.title }}</span>
        </article>
      </div>

      <!-- 移动版现实解锁入口 -->
      <div v-if="!realityLoaded" class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <p class="text-sm text-[var(--fi-muted)]">现实记录已上锁。</p>
        <div v-if="!canReadReality" class="mt-3 flex gap-2">
          <input
            v-model="keyInput"
            type="password"
            class="mono min-w-0 flex-1 rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
            placeholder="钥匙……"
            @keyup.enter="unlockReality"
          />
          <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlockReality">
            解锁
          </button>
        </div>
        <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
      </div>
    </div>

    <!-- ============ 桌面版：钟表 + 文章 ============ -->
    <div class="hidden md:flex">
      <aside class="relative w-72 shrink-0">
        <ClockDial v-model="currentYear" :years="dialYears" />
      </aside>

      <section class="min-w-0 flex-1 space-y-4 py-6 pr-6">
        <!-- 世界观文章 -->
        <div
          v-for="a in worldOfYear"
          :key="a.slug"
          class="cursor-pointer rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5 transition hover:border-[var(--fi-blue-dim)]"
          @click="openArticle(a.slug, 'worldview')"
        >
          <h3 class="text-lg font-medium text-[var(--fi-text)]">{{ a.title }}</h3>
          <p v-if="a.excerpt" class="mt-1 text-sm text-[var(--fi-muted)]">{{ a.excerpt }}</p>
        </div>
        <div v-if="!worldOfYear.length && !realityOfYear.length" class="mono text-sm text-[var(--fi-muted)]">
          这一年没有记录。
        </div>

        <!-- 现实区块 -->
        <div class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
          <div class="flex items-center justify-between">
            <span class="mono text-sm text-[var(--fi-muted)]">
              现实
              <span v-if="realityLoaded && realityOfYear.length">· {{ realityOfYear.length }} 篇</span>
              <span v-else-if="realityLoaded">· 该年无现实记录</span>
              <span v-else>· 上锁</span>
            </span>
            <button
              class="mono rounded border px-3 py-1.5 text-xs"
              :class="showReality ? 'border-[var(--fi-warm)] text-[var(--fi-warm)]' : 'border-[var(--fi-line)] text-[var(--fi-muted)] hover:text-[var(--fi-text)]'"
              @click="toggleReality"
            >
              {{ showReality ? '收起' : '展开' }}
            </button>
          </div>

          <!-- 未解锁：钥匙输入 -->
          <div v-if="showReality && !realityLoaded && !canReadReality" class="mt-3">
            <p class="text-xs text-[var(--fi-muted)]">现实记录已上锁，需要钥匙。</p>
            <div class="mt-2 flex gap-2">
              <input
                v-model="keyInput"
                type="password"
                class="mono min-w-0 flex-1 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-1.5 text-sm text-[var(--fi-text)] outline-none"
                placeholder="钥匙……"
                @keyup.enter="unlockReality"
              />
              <button class="rounded border border-[var(--fi-warm)] px-3 py-1.5 text-xs text-[var(--fi-warm)]" :disabled="unlocking" @click="unlockReality">
                {{ unlocking ? '…' : '解锁' }}
              </button>
            </div>
            <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
          </div>

          <!-- 已解锁：现实文章 -->
          <div v-if="showReality && realityLoaded" class="mt-3 space-y-2">
            <div
              v-for="a in realityOfYear"
              :key="a.slug"
              class="cursor-pointer rounded-lg border border-[var(--fi-warm)]/30 bg-[var(--fi-panel-2)] p-3 transition hover:border-[var(--fi-warm)]"
              @click="openArticle(a.slug, 'reality')"
            >
              <span class="text-sm text-[var(--fi-warm-soft)]">{{ a.title }}</span>
            </div>
            <p v-if="!realityOfYear.length" class="text-xs text-[var(--fi-muted)]">该年无现实记录。</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 文章详情弹层 -->
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

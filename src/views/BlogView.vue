<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/md';
import type { Article, ArticleMeta } from '../types';

const tags = ref<{ tag: string; count: number }[]>([]);
const selectedTags = ref<string[]>([]);
const keyword = ref('');
const articles = ref<ArticleMeta[]>([]);
const loading = ref(false);
const visibleCount = ref(20);
const sentinel = ref<HTMLElement | null>(null);

const expanded = ref<Article | null>(null);

const visible = computed(() => articles.value.slice(0, visibleCount.value));

function toggleTag(t: string): void {
  const i = selectedTags.value.indexOf(t);
  if (i >= 0) selectedTags.value.splice(i, 1);
  else selectedTags.value.push(t);
}

async function loadArticles(): Promise<void> {
  loading.value = true;
  try {
    const qs = new URLSearchParams();
    if (selectedTags.value.length) qs.set('tags', selectedTags.value.join(','));
    if (keyword.value.trim()) qs.set('keyword', keyword.value.trim());
    const q = qs.toString();
    const r = await api.get<{ items: ArticleMeta[] }>(
      q ? `/api/articles/blog/search?${q}` : '/api/articles/blog',
    );
    articles.value = r.items;
    visibleCount.value = 20;
  } finally {
    loading.value = false;
  }
}

async function openArticle(slug: string): Promise<void> {
  try {
    expanded.value = await api.get<Article>(`/api/articles/blog/${slug}`);
  } catch {
    /* ignore */
  }
}


// 标签/搜索变化时重新加载
watch([selectedTags, keyword], () => void loadArticles(), { deep: false });

onMounted(async () => {
  const r = await api.get<{ items: { tag: string; count: number }[] }>('/api/tags/blog');
  tags.value = r.items;
  await loadArticles();

  // 无限滚动哨兵
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && visibleCount.value < articles.value.length) {
        visibleCount.value += 20;
      }
    },
    { rootMargin: '200px' },
  );
  if (sentinel.value) io.observe(sentinel.value);
});
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-5">
    <header>
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">博客文章</h1>
      <p class="mono mt-1 text-xs text-[var(--fi-muted)]">技术笔记与分享</p>
    </header>

    <!-- 搜索 -->
    <div class="flex items-center gap-3">
      <input
        v-model="keyword"
        class="mono w-full max-w-sm rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
        placeholder="关键字搜索……"
      />
    </div>

    <!-- 标签（多选 = 并集） -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tags"
        :key="t.tag"
        class="mono rounded-full border px-3 py-1 text-xs transition"
        :class="
          selectedTags.includes(t.tag)
            ? 'border-[var(--fi-warm)] bg-[var(--fi-warm)]/10 text-[var(--fi-warm)]'
            : 'border-[var(--fi-line)] text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
        "
        @click="toggleTag(t.tag)"
      >
        {{ t.tag }} · {{ t.count }}
      </button>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="mono text-sm text-[var(--fi-muted)]">读取中……</div>
    <div v-else-if="!articles.length" class="mono text-sm text-[var(--fi-muted)]">
      暂无记录。
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="a in visible"
        :key="a.slug"
        class="cursor-pointer rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5 transition hover:border-[var(--fi-blue-dim)]"
        @click="openArticle(a.slug)"
      >
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-lg font-medium text-[var(--fi-text)]">{{ a.title }}</h2>
          <time class="mono shrink-0 text-xs text-[var(--fi-muted)]">{{ a.date || '' }}</time>
        </div>
        <p v-if="a.excerpt" class="mt-2 text-sm text-[var(--fi-muted)]">{{ a.excerpt }}</p>
        <div v-if="a.tags.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="t in a.tags"
            :key="t"
            class="mono rounded border border-[var(--fi-line)] px-2 py-0.5 text-[10px] text-[var(--fi-muted)]"
          >{{ t }}</span>
        </div>
      </article>

      <div ref="sentinel" class="h-1"></div>
      <p v-if="visibleCount < articles.length" class="mono text-center text-xs text-[var(--fi-muted)]">
        继续下滑……
      </p>
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
        <time class="mono mt-1 block text-xs text-[var(--fi-muted)]">{{ expanded.date || '' }}</time>
        <div class="prose-invert mt-6 max-w-none leading-relaxed text-[var(--fi-text)]" v-html="renderMarkdown(expanded.content)"></div>
      </div>
    </div>
  </div>
</template>

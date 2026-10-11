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
const featured = computed(() => visible.value[0] ?? null);
const rest = computed(() => visible.value.slice(1));
const filtered = computed(() => selectedTags.value.length > 0 || keyword.value.trim() !== '');

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

  }
}

watch([selectedTags, keyword], () => void loadArticles(), { deep: false });

onMounted(async () => {
  const r = await api.get<{ items: { tag: string; count: number }[] }>('/api/tags/blog');
  tags.value = r.items;
  await loadArticles();

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
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">鍗氬鏂囩珷</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/blog</span>
    </header>

    <div class="flex items-center gap-3">
      <input
        v-model="keyword"
        class="mono fi-px-panel w-full max-w-sm bg-[var(--fi-panel)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
        placeholder="鍏抽敭瀛楁悳绱⑩€︹€?
      />
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tags"
        :key="t.tag"
        class="mono border-2 px-3 py-1 text-xs transition"
        :class="
          selectedTags.includes(t.tag)
            ? 'border-[var(--fi-warm)] bg-[var(--fi-warm)]/10 text-[var(--fi-warm)]'
            : 'border-[var(--fi-line-solid)] text-[var(--fi-muted)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-text)]'
        "
        @click="toggleTag(t.tag)"
      >
        {{ t.tag }} 路 {{ t.count }}
      </button>
    </div>

    <div v-if="loading" class="mono text-sm text-[var(--fi-muted)]">璇诲彇涓€︹€?/div>
    <div v-else-if="!articles.length" class="mono text-sm text-[var(--fi-muted)]">
      鏆傛棤璁板綍銆?    </div>

    <div v-else class="space-y-6">
      <article
        v-if="featured && !filtered"
        class="group fi-px-panel relative cursor-pointer overflow-hidden bg-[var(--fi-panel)] transition hover:border-[var(--fi-blue)]"
        @click="openArticle(featured.slug)"
      >
        <div
          class="relative h-56 w-full"
          style="background: linear-gradient(135deg, rgba(121, 184, 255, 0.25), rgba(183, 140, 255, 0.18))"
        >
          <img
            v-if="featured.cover"
            :src="featured.cover"
            :alt="featured.title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span
            v-else
            class="mono absolute inset-0 flex items-center justify-center text-6xl text-[var(--fi-blue)]/40"
          >{{ featured.title.slice(0, 1) }}</span>
          <div class="absolute inset-0" style="background: linear-gradient(0deg, rgba(4, 6, 17, 0.92), transparent 65%)"></div>
          <div class="absolute bottom-0 left-0 right-0 p-5">
            <span class="mono border border-[var(--fi-warm)]/60 bg-[var(--fi-bg)]/70 px-2 py-0.5 text-[10px] text-[var(--fi-warm)]">缃《</span>
            <h2 class="mono mt-2 text-xl text-[var(--fi-text)] md:text-2xl">{{ featured.title }}</h2>
            <time class="mono mt-1 block text-[10px] text-[var(--fi-muted)]">{{ featured.date || '' }}</time>
          </div>
        </div>
      </article>

      <div class="fi-stagger grid gap-4 md:grid-cols-2">
        <article
          v-for="a in rest"
          :key="a.slug"
          class="group fi-px-panel flex cursor-pointer flex-col overflow-hidden bg-[var(--fi-panel)] transition hover:border-[var(--fi-blue)]"
          @click="openArticle(a.slug)"
        >
          <div
            class="relative h-36 w-full shrink-0 overflow-hidden"
            style="background: linear-gradient(135deg, rgba(121, 184, 255, 0.18), rgba(183, 140, 255, 0.14))"
          >
            <img
              v-if="a.cover"
              :src="a.cover"
              :alt="a.title"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span
              v-else
              class="mono absolute inset-0 flex items-center justify-center text-4xl text-[var(--fi-blue)]/50"
            >{{ a.title.slice(0, 1) }}</span>
          </div>
          <div class="flex min-w-0 flex-1 flex-col p-4">
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="mono truncate text-sm text-[var(--fi-text)] transition group-hover:text-[var(--fi-blue)]">
                {{ a.title }}
              </h2>
              <time class="mono shrink-0 text-[10px] text-[var(--fi-muted)]">{{ a.date || '' }}</time>
            </div>
            <p v-if="a.excerpt" class="mt-2 line-clamp-2 text-xs text-[var(--fi-muted)]">{{ a.excerpt }}</p>
            <div v-if="a.tags.length" class="mt-auto flex flex-wrap gap-1.5 pt-3">
              <span
                v-for="t in a.tags"
                :key="t"
                class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-muted)]"
              >{{ t }}</span>
            </div>
          </div>
        </article>
      </div>

      <div ref="sentinel" class="h-1"></div>
      <p v-if="visibleCount < articles.length" class="mono text-center text-xs text-[var(--fi-muted)]">
        缁х画涓嬫粦鈥︹€?      </p>
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
            鍏抽棴 鉁?          </button>
        </div>
        <time class="mono mt-1 block text-xs text-[var(--fi-muted)]">{{ expanded.date || '' }}</time>
        <img
          v-if="expanded.cover"
          :src="expanded.cover"
          :alt="expanded.title"
          class="mt-4 max-h-72 w-full border border-[var(--fi-line-solid)] object-cover"
        />
        <div class="prose-invert mt-6 max-w-none leading-relaxed text-[var(--fi-text)]" v-html="renderMarkdown(expanded.content)"></div>
      </div>
    </div>
  </div>
</template>

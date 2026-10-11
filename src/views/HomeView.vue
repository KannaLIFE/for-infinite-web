<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { profile } from '../data/profile';
import { API_BASE, api } from '../lib/api';
import { nowWorldYear } from '../lib/time';
import GhGrid from '../components/GhGrid.vue';
import WorldClock from '../components/WorldClock.vue';
import type { ArticleMeta } from '../types';

type ApiState = 'checking' | 'online' | 'offline';
const apiState = ref<ApiState>('checking');
const latestPosts = ref<ArticleMeta[]>([]);

const aboutSections = computed(() => [
  { key: 'anime', title: 'anime · 番剧', items: profile.about.anime },
  { key: 'games', title: 'games · 游戏', items: profile.about.games },
  { key: 'vtubers', title: 'vtubers · 主播', items: profile.about.vtubers },
  { key: 'vocaloid', title: 'vocaloid · 术力口', items: profile.about.vocaloid },
  { key: 'music', title: 'music · 音乐', items: profile.music },
  { key: 'others', title: 'others · 其他', items: profile.about.others },
]);

onMounted(async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
    clearTimeout(t);
    apiState.value = res.ok ? 'online' : 'offline';
  } catch {
    apiState.value = 'offline';
  }

  try {
    const r = await api.get<{ items: ArticleMeta[] }>('/api/articles/blog');
    latestPosts.value = r.items.slice(0, 3);
  } catch {

  }
});
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 px-5">
    <section class="fi-rise pt-4 text-center">
      <p class="mono text-xs tracking-[0.5em] text-[var(--fi-muted)]">星权穹顶 · 第 {{ nowWorldYear() }} 观测纪</p>
      <h1 class="mono mt-4 text-5xl font-bold tracking-widest text-[var(--fi-text)] md:text-7xl">
        {{ profile.motto }}
      </h1>
      <p class="mono mt-3 text-sm text-[var(--fi-violet)]">{{ profile.mottoSub }}</p>
    </section>

    <section class="flex flex-wrap justify-center gap-2">
      <a
        v-for="s in profile.socials"
        :key="s.label"
        :href="s.url"
        target="_blank"
        rel="noopener"
        class="mono fi-px-btn bg-[var(--fi-panel)] px-3 py-1.5 text-xs text-[var(--fi-blue)]"
      >{{ s.label }} ▸</a>
    </section>

    <section class="fi-px-panel flex flex-col gap-5 bg-[var(--fi-panel)] p-6 md:flex-row md:items-center">
      <div
        class="relative flex h-20 w-20 shrink-0 items-center justify-center border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]"
      >
        <span
          class="fi-breathe inline-block h-6 w-6"
          style="background: var(--fi-warm); box-shadow: 0 0 14px var(--fi-warm)"
        ></span>
        <span class="mono absolute -bottom-1 -right-1 border border-[var(--fi-line-solid)] bg-[var(--fi-bg)] px-1 text-[9px] text-[var(--fi-blue)]">
          KL
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="mono text-2xl font-bold text-[var(--fi-text)]">{{ profile.name }}</h2>
          <span class="mono text-sm text-[var(--fi-muted)]">{{ profile.handle }}</span>
          <span class="mono flex items-center gap-1.5 border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-2 py-0.5 text-[10px] text-[var(--fi-muted)]">
            <span class="inline-block h-1.5 w-1.5 bg-[var(--fi-blue)]"></span>
            {{ profile.status }}
          </span>
        </div>
        <p class="serif-quote mt-2 text-base text-[var(--fi-warm-soft)]">{{ profile.tagline }}</p>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--fi-muted)]">{{ profile.intro }}</p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="p in profile.pills"
            :key="p"
            class="mono border border-[var(--fi-violet-dim)] bg-[var(--fi-panel-2)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]"
          >{{ p }}</span>
          <span
            v-for="i in profile.interests"
            :key="i"
            class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-2 py-0.5 text-[10px] text-[var(--fi-muted)]"
          >{{ i }}</span>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <GhGrid />
      <WorldClock :clocks="profile.clocks" />
      <div class="fi-px-panel space-y-4 bg-[var(--fi-panel)] p-4">
        <h3 class="mono text-xs text-[var(--fi-warm)]">STATION · 观测站状态</h3>
        <div>
          <p class="mono text-[10px] text-[var(--fi-muted)]">星联状态</p>
          <p class="mono mt-1 flex items-center gap-1.5 text-sm">
            <span
              class="inline-block h-2 w-2"
              :class="apiState === 'online' ? 'bg-[var(--fi-blue)]' : apiState === 'offline' ? 'bg-[#ff6b6b]' : 'bg-[var(--fi-muted)] animate-pulse'"
            ></span>
            <span :class="apiState === 'online' ? 'text-[var(--fi-blue)]' : apiState === 'offline' ? 'text-[#ff8a8a]' : 'text-[var(--fi-muted)]'">
              {{ apiState === 'online' ? '在线' : apiState === 'offline' ? '离线' : '检测中' }}
            </span>
          </p>
        </div>
        <div>
          <p class="mono text-[10px] text-[var(--fi-muted)]">当前状态</p>
          <p class="mono mt-1 text-sm text-[var(--fi-violet)]">{{ profile.statusNote }}</p>
        </div>
        <div>
          <p class="mono text-[10px] text-[var(--fi-muted)]">观测站版本</p>
          <p class="mono mt-1 text-sm text-[var(--fi-warm)]">v2.0 · 末地风</p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 md:grid-cols-2">
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-blue)]">BYF · 关注前须知</h2>
          <span class="mono text-[10px] text-[var(--fi-blue)]">/byf</span>
        </div>
        <ul class="space-y-1.5 text-sm text-[var(--fi-muted)]">
          <li v-for="b in profile.byf" :key="b" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[var(--fi-blue)]"></span>{{ b }}
          </li>
        </ul>
      </section>
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[#ff8a8a]">DNI · 请勿互动</h2>
          <span class="mono text-[10px] text-[#ff8a8a]">/dni</span>
        </div>
        <ul class="space-y-1.5 text-sm text-[var(--fi-muted)]">
          <li v-for="d in profile.dni" :key="d" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[#ff6b6b]"></span>{{ d }}
          </li>
        </ul>
      </section>
    </div>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">ABOUT · 档案</h2>
        <span class="mono text-[10px] text-[var(--fi-blue)]">/about</span>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="s in aboutSections"
          :key="s.key"
          class="border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-3"
        >
          <h3 class="mono text-xs text-[var(--fi-violet)]">{{ s.title }}</h3>
          <p class="mt-2 text-xs leading-relaxed text-[var(--fi-muted)]">{{ s.items.join(' · ') || '待补充' }}</p>
        </div>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">LATEST · 最近日志</h2>
        <RouterLink to="/blog" class="mono text-xs text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
          全部 ▸
        </RouterLink>
      </div>
      <p v-if="!latestPosts.length" class="mono text-xs text-[var(--fi-muted)]">星联离线，日志暂不可读。</p>
      <div v-else class="space-y-2">
        <RouterLink
          v-for="p in latestPosts"
          :key="p.slug"
          to="/blog"
          class="group flex items-baseline justify-between gap-3 border-l-2 border-[var(--fi-blue-dim)] py-1 pl-3 transition hover:border-[var(--fi-blue)]"
        >
          <span class="mono truncate text-sm text-[var(--fi-text)] group-hover:text-[var(--fi-blue)]">{{ p.title }}</span>
          <time class="mono shrink-0 text-[10px] text-[var(--fi-muted)]">{{ p.date || '' }}</time>
        </RouterLink>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">FRIENDS · 友链</h2>
        <RouterLink to="/friends" class="mono text-xs text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
          全部友链 ▸
        </RouterLink>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <a
          v-for="f in profile.friends"
          :key="f.url"
          :href="f.url"
          target="_blank"
          rel="noopener"
          class="fi-px-btn w-44 shrink-0 bg-[var(--fi-panel-2)] p-3"
        >
          <span class="block truncate text-sm font-medium text-[var(--fi-text)]">{{ f.name }}</span>
          <span class="mt-1 block truncate text-xs text-[var(--fi-muted)]">{{ f.desc }}</span>
        </a>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">TECH · 技术栈</h2>
        <RouterLink to="/tech" class="mono text-xs text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
          详情 ▸
        </RouterLink>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="t in profile.techStack"
          :key="t"
          class="mono border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-3 py-1 text-xs text-[var(--fi-text)]"
        >{{ t }}</span>
        <span
          v-for="t in profile.learning"
          :key="t"
          class="mono border-2 border-dashed border-[var(--fi-blue-dim)] bg-[var(--fi-panel-2)] px-3 py-1 text-xs text-[var(--fi-muted)]"
        >✦ {{ t }}</span>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5 text-center">
      <h2 class="mono text-sm text-[var(--fi-warm)]">REACH OUT · 联系</h2>
      <p class="mt-2 text-sm text-[var(--fi-muted)]">{{ profile.reachout }}</p>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <a
          v-for="s in profile.socials"
          :key="s.label"
          :href="s.url"
          target="_blank"
          rel="noopener"
          class="mono fi-px-btn bg-[var(--fi-panel-2)] px-3 py-1.5 text-xs text-[var(--fi-blue)]"
        >{{ s.label }} ▸</a>
      </div>
    </section>
  </div>
</template>

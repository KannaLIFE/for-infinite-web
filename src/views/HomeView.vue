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

const marqueeChips = computed(() => [
  ...profile.techStack.map((t) => ({ name: t, kind: 'using' as const })),
  ...profile.learning.map((t) => ({ name: t, kind: 'learning' as const })),
]);

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
    latestPosts.value = r.items.slice(0, 5);
  } catch {

  }
});
</script>

<template>
  <div class="w-full px-4">
    <div class="grid items-start gap-4 lg:grid-cols-[1.15fr_1fr_0.85fr]">
      <div class="min-w-0 space-y-4">
        <section class="fi-rise text-center">
          <p class="mono text-xs tracking-[0.4em] text-[var(--fi-muted)]">第 {{ nowWorldYear() }} 观测纪</p>
          <h1 class="mono mt-3 text-4xl font-bold tracking-widest text-[var(--fi-text)] md:text-6xl">
            {{ profile.motto }}
          </h1>
          <p class="mono mt-2 text-sm text-[var(--fi-violet)]">{{ profile.mottoSub }}</p>
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

        <section class="fi-px-panel flex gap-4 bg-[var(--fi-panel)] p-5">
          <div
            class="relative flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]"
          >
            <span
              class="fi-breathe inline-block h-5 w-5"
              style="background: var(--fi-warm); box-shadow: 0 0 12px var(--fi-warm)"
            ></span>
            <span class="mono absolute -bottom-1 -right-1 border border-[var(--fi-line-solid)] bg-[var(--fi-bg)] px-1 text-[9px] text-[var(--fi-blue)]">
              KL
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="mono text-xl font-bold text-[var(--fi-text)]">{{ profile.name }}</h2>
              <span class="mono text-xs text-[var(--fi-muted)]">{{ profile.handle }}</span>
              <span class="mono flex items-center gap-1.5 border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[9px] text-[var(--fi-muted)]">
                <span class="inline-block h-1.5 w-1.5 bg-[var(--fi-blue)]"></span>
                {{ profile.status }}
              </span>
            </div>
            <p class="serif-quote mt-1.5 text-sm text-[var(--fi-warm-soft)]">{{ profile.tagline }}</p>
            <p class="mt-1.5 text-xs leading-relaxed text-[var(--fi-muted)]">{{ profile.intro }}</p>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              <span
                v-for="p in profile.pills"
                :key="p"
                class="mono border border-[var(--fi-violet-dim)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[9px] text-[var(--fi-violet)]"
              >{{ p }}</span>
              <span
                v-for="i in profile.interests"
                :key="i"
                class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[9px] text-[var(--fi-muted)]"
              >{{ i }}</span>
            </div>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="mono text-xs text-[var(--fi-warm)]">TECH · 技术栈</h2>
            <RouterLink to="/tech" class="mono text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">详情 ▸</RouterLink>
          </div>
          <div class="fi-marquee">
            <div class="fi-marquee-track">
              <template v-for="round in 2" :key="round">
                <span
                  v-for="c in marqueeChips"
                  :key="`${round}-${c.name}`"
                  class="mono whitespace-nowrap border-2 px-2.5 py-1 text-[10px]"
                  :class="c.kind === 'using' ? 'border-[var(--fi-line-solid)] text-[var(--fi-text)]' : 'border-dashed border-[var(--fi-blue-dim)] text-[var(--fi-muted)]'"
                >{{ c.kind === 'learning' ? '✦ ' : '' }}{{ c.name }}</span>
              </template>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-2 gap-4">
          <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="mono text-xs text-[var(--fi-blue)]">BYF · 关注前须知</h2>
              <span class="mono text-[9px] text-[var(--fi-blue)]">/byf</span>
            </div>
            <ul class="space-y-1 text-xs text-[var(--fi-muted)]">
              <li v-for="b in profile.byf" :key="b" class="flex items-center gap-1.5">
                <span class="inline-block h-1.5 w-1.5 bg-[var(--fi-blue)]"></span>{{ b }}
              </li>
            </ul>
          </section>
          <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="mono text-xs text-[#ff8a8a]">DNI · 请勿互动</h2>
              <span class="mono text-[9px] text-[#ff8a8a]">/dni</span>
            </div>
            <ul class="space-y-1 text-xs text-[var(--fi-muted)]">
              <li v-for="d in profile.dni" :key="d" class="flex items-center gap-1.5">
                <span class="inline-block h-1.5 w-1.5 bg-[#ff6b6b]"></span>{{ d }}
              </li>
            </ul>
          </section>
        </div>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4 text-center">
          <h2 class="mono text-xs text-[var(--fi-warm)]">REACH OUT · 联系</h2>
          <p class="mt-1.5 text-xs text-[var(--fi-muted)]">{{ profile.reachout }}</p>
          <div class="mt-2.5 flex flex-wrap justify-center gap-2">
            <a
              v-for="s in profile.socials"
              :key="s.label"
              :href="s.url"
              target="_blank"
              rel="noopener"
              class="mono fi-px-btn bg-[var(--fi-panel-2)] px-2.5 py-1 text-[10px] text-[var(--fi-blue)]"
            >{{ s.label }} ▸</a>
          </div>
        </section>
      </div>

      <div class="min-w-0 space-y-4">
        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="mono text-xs text-[var(--fi-warm)]">ABOUT · 档案</h2>
            <span class="mono text-[10px] text-[var(--fi-blue)]">/about</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="s in aboutSections"
              :key="s.key"
              class="border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-2.5"
            >
              <h3 class="mono text-[10px] text-[var(--fi-violet)]">{{ s.title }}</h3>
              <p class="mt-1.5 text-[11px] leading-relaxed text-[var(--fi-muted)]">{{ s.items.join(' · ') || '待补充' }}</p>
            </div>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="mono text-xs text-[var(--fi-warm)]">LATEST · 最近日志</h2>
            <RouterLink to="/blog" class="mono text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
              全部 ▸
            </RouterLink>
          </div>
          <p v-if="!latestPosts.length" class="mono text-xs text-[var(--fi-muted)]">星联离线，日志暂不可读。</p>
          <div v-else class="space-y-1.5">
            <RouterLink
              v-for="p in latestPosts"
              :key="p.slug"
              to="/blog"
              class="group flex items-baseline justify-between gap-3 border-l-2 border-[var(--fi-blue-dim)] py-1 pl-2.5 transition hover:border-[var(--fi-blue)]"
            >
              <span class="mono truncate text-xs text-[var(--fi-text)] group-hover:text-[var(--fi-blue)]">{{ p.title }}</span>
              <time class="mono shrink-0 text-[9px] text-[var(--fi-muted)]">{{ p.date || '' }}</time>
            </RouterLink>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="mono text-xs text-[var(--fi-warm)]">FRIENDS · 友链</h2>
            <RouterLink to="/friends" class="mono text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
              全部友链 ▸
            </RouterLink>
          </div>
          <div class="space-y-2">
            <a
              v-for="f in profile.friends"
              :key="f.url"
              :href="f.url"
              target="_blank"
              rel="noopener"
              class="fi-px-btn block bg-[var(--fi-panel-2)] p-2.5"
            >
              <span class="block truncate text-xs font-medium text-[var(--fi-text)]">{{ f.name }}</span>
              <span class="mt-0.5 block truncate text-[10px] text-[var(--fi-muted)]">{{ f.desc }}</span>
            </a>
          </div>
        </section>
      </div>

      <div class="min-w-0 space-y-4">
        <section class="fi-px-panel relative overflow-hidden bg-[var(--fi-panel)]">
          <img
            v-if="profile.bannerUrl"
            :src="profile.bannerUrl"
            alt="banner"
            class="h-40 w-full object-cover"
          />
          <div v-else class="relative flex h-40 items-center justify-center">
            <span
              class="fi-breathe inline-block h-8 w-8"
              style="background: var(--fi-warm); box-shadow: 0 0 18px var(--fi-warm)"
            ></span>
            <span class="mono absolute bottom-2 right-2 text-[9px] text-[var(--fi-muted)]">KL · PORTRAIT</span>
          </div>
        </section>

        <section class="fi-px-panel space-y-3 bg-[var(--fi-panel)] p-4">
          <h3 class="mono text-xs text-[var(--fi-warm)]">STATION · 观测站状态</h3>
          <div>
            <p class="mono text-[9px] text-[var(--fi-muted)]">星联状态</p>
            <p class="mono mt-1 flex items-center gap-1.5 text-xs">
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
            <p class="mono text-[9px] text-[var(--fi-muted)]">当前状态</p>
            <p class="mono mt-1 text-xs text-[var(--fi-violet)]">{{ profile.statusNote }}</p>
          </div>
          <div>
            <p class="mono text-[9px] text-[var(--fi-muted)]">观测站版本</p>
            <p class="mono mt-1 text-xs text-[var(--fi-warm)]">v2.0 · 末地风</p>
          </div>
        </section>

        <GhGrid />

        <WorldClock :clocks="profile.clocks" />
      </div>
    </div>
  </div>
</template>

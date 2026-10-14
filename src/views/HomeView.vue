<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { profile, type AboutItem, type AboutSection } from '../data/profile';
import { friends } from '../data/friends';
import { API_BASE, api } from '../lib/api';
import { nowWorldYear } from '../lib/time';
import GhGrid from '../components/GhGrid.vue';
import GhStats from '../components/GhStats.vue';
import WorldClock from '../components/WorldClock.vue';
import YtCard from '../components/YtCard.vue';
import DiscordStatus from '../components/DiscordStatus.vue';
import NeteaseCard from '../components/NeteaseCard.vue';
import type { ArticleMeta } from '../types';

type ApiState = 'checking' | 'online' | 'offline';
const apiState = ref<ApiState>('checking');
const latestPosts = ref<ArticleMeta[]>([]);
const base = import.meta.env.BASE_URL;

const pcOnline = ref<'checking' | 'online' | 'offline'>('checking');
const liveStatus = ref('');
let statusTimer: ReturnType<typeof setInterval> | null = null;

async function pollStatus(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(`${API_BASE}/status`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!r.ok) throw new Error();
    const j = await r.json();
    pcOnline.value = 'online';
    liveStatus.value = j.status || '';
  } catch {
    pcOnline.value = 'offline';
  }
}

const hoverCard = ref<{ x: number; y: number; section: AboutSection; item: AboutItem } | null>(null);
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function enterCard(e: MouseEvent, s: AboutSection, it: AboutItem): void {
  if (hoverTimer) clearTimeout(hoverTimer);
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const panelW = 288;
  let x = rect.right + 10;
  if (x + panelW > window.innerWidth - 8) x = rect.left - panelW - 10;
  let y = rect.top;
  const panelH = 340;
  if (y + panelH > window.innerHeight - 8) y = Math.max(8, window.innerHeight - panelH - 8);
  hoverCard.value = { x, y, section: s, item: it };
}

function leaveCard(): void {
  if (hoverTimer) clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    hoverCard.value = null;
  }, 140);
}

function ratioClass(key: string): string {
  if (key === 'shows' || key === 'games') return 'aspect-[2/3]';
  return 'aspect-square';
}

function imgUrl(img?: string): string {
  if (!img) return '';
  if (img.startsWith('/')) return base + img;
  return img;
}

function stripItems(s: AboutSection): AboutItem[] {
  return s.items.length >= 4 ? [...s.items, ...s.items] : s.items;
}

function openAbout(s: AboutSection, it: AboutItem): void {
  if (it.site) {
    window.open(it.site, '_blank', 'noopener');
    return;
  }
  if (s.key === 'shows') {
    const q = encodeURIComponent(it.en || it.name);
    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank', 'noopener');
  }
}

const shows = computed(() => profile.about.find((s) => s.key === 'shows')?.items ?? []);
const showSection = computed(() => profile.about.find((s) => s.key === 'shows') as AboutSection);
const showIdx = ref(0);
const showPaused = ref(false);
let showTimer: ReturnType<typeof setInterval> | null = null;

function restartShowTimer(): void {
  if (showTimer) clearInterval(showTimer);
  showTimer = setInterval(() => {
    if (showPaused.value || shows.value.length < 2) return;
    showIdx.value = (showIdx.value + 1) % shows.value.length;
  }, 4000);
}

function stepShow(dir: number): void {
  if (!shows.value.length) return;
  showIdx.value = (showIdx.value + dir + shows.value.length) % shows.value.length;
  restartShowTimer();
}

function jumpShow(i: number): void {
  showIdx.value = i;
  restartShowTimer();
}

const vocaloid = computed(() => profile.about.find((s) => s.key === 'vocaloid')?.items ?? []);
const vocIdx = ref(0);
const vocPaused = ref(false);
let vocTimer: ReturnType<typeof setInterval> | null = null;

function restartVocTimer(): void {
  if (vocTimer) clearInterval(vocTimer);
  vocTimer = setInterval(() => {
    if (vocPaused.value || vocaloid.value.length < 2) return;
    vocIdx.value = (vocIdx.value + 1) % vocaloid.value.length;
  }, 5000);
}

function stepVoc(dir: number): void {
  if (!vocaloid.value.length) return;
  vocIdx.value = (vocIdx.value + dir + vocaloid.value.length) % vocaloid.value.length;
  restartVocTimer();
}

function jumpVoc(i: number): void {
  vocIdx.value = i;
  restartVocTimer();
}

const contentGrid = [
  { to: '/blog', glyph: '▤', label: '博客' },
  { to: '/projects', glyph: '✦', label: '项目' },
  { to: '/gallery', glyph: '◈', label: '画廊' },
  { to: '/tech', glyph: '⌬', label: '技术栈' },
  { to: '/friends', glyph: '◉', label: '友链' },
  { to: '/services', glyph: '⚒', label: '服务' },
];

const marqueeChips = computed(() => [
  ...profile.techStack.map((t) => ({ name: t, kind: 'using' as const })),
  ...profile.learning.map((t) => ({ name: t, kind: 'learning' as const })),
]);

onMounted(async () => {
  restartShowTimer();
  restartVocTimer();
  pollStatus();
  statusTimer = setInterval(pollStatus, 15000);

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

onUnmounted(() => {
  if (showTimer) clearInterval(showTimer);
  if (vocTimer) clearInterval(vocTimer);
  if (statusTimer) clearInterval(statusTimer);
});
</script>

<template>
  <div class="w-full">
    <div class="grid items-start lg:grid-cols-[8fr_6fr_5fr]">
      <div class="min-w-0 lg:border-r-2 lg:border-[var(--fi-line-solid)]">
        <div class="space-y-4 px-3 py-4">
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
              class="relative h-16 w-16 shrink-0 overflow-hidden border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]"
            >
              <img
                v-if="profile.avatar"
                :src="base + profile.avatar"
                alt="avatar"
                class="h-full w-full object-cover"
              />
              <span
                v-else
                class="fi-breathe absolute inset-0 m-auto inline-block h-5 w-5"
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
              </div>
            </div>
          </section>

          <section class="fi-px-panel bg-[var(--fi-panel)] p-3">
            <div class="grid grid-cols-3 gap-2 md:grid-cols-6">
              <RouterLink
                v-for="c in contentGrid"
                :key="c.to + c.label"
                :to="c.to"
                class="group flex flex-col items-center gap-1.5 border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-2.5 transition hover:border-[var(--fi-blue)]"
              >
                <span class="mono text-lg text-[var(--fi-blue)]">{{ c.glyph }}</span>
                <span class="mono text-[9px] text-[var(--fi-muted)] group-hover:text-[var(--fi-text)]">{{ c.label }}</span>
              </RouterLink>
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

          <div class="grid grid-cols-2 gap-3">
            <section class="fi-px-panel bg-[var(--fi-panel)] p-3" :class="profile.dni.length ? '' : 'col-span-2'">
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
            <section v-if="profile.dni.length" class="fi-px-panel bg-[var(--fi-panel)] p-3">
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

          <GhGrid />

          <section class="fi-px-panel bg-[var(--fi-panel)] p-3">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="mono text-xs text-[var(--fi-violet)]">GITHUB · 统计</h2>
              <a
                href="https://github.com/kannalife"
                target="_blank"
                rel="noopener"
                class="mono text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]"
              >主页 ▸</a>
            </div>
            <GhStats username="kannalife" />
          </section>

          <WorldClock :clocks="profile.clocks" />
        </div>
      </div>

      <div class="min-w-0 space-y-4 px-3 py-4 lg:border-r-2 lg:border-[var(--fi-line-solid)]">
        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="mono text-xs text-[var(--fi-warm)]">ABOUT · 档案</h2>
            <span class="mono text-[10px] text-[var(--fi-blue)]">/about</span>
          </div>
          <div class="space-y-3">
            <div v-for="s in profile.about" :key="s.key" class="border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-3">
              <h3 class="mono text-[10px] text-[var(--fi-violet)]">{{ s.title }}</h3>
              <div
                v-if="s.key === 'shows'"
                class="mt-2 flex gap-3"
                @mouseenter="showPaused = true"
                @mouseleave="showPaused = false"
              >
                <div class="w-32 shrink-0 sm:w-36">
                  <div
                    class="relative cursor-pointer overflow-hidden border-2 border-[var(--fi-line-solid)] transition hover:border-[var(--fi-blue)]"
                    style="background: linear-gradient(135deg, rgba(121,184,255,0.16), rgba(183,140,255,0.12))"
                    title="在 YouTube 搜索这部作品"
                    @click="shows[showIdx] && openAbout(showSection, shows[showIdx])"
                  >
                    <transition name="fi-slide" mode="out-in">
                      <img
                        v-if="shows[showIdx] && shows[showIdx].img"
                        :key="'slide-' + showIdx"
                        :src="imgUrl(shows[showIdx].img)"
                        :alt="shows[showIdx].name"
                        class="aspect-[2/3] w-full object-cover"
                      />
                      <div v-else :key="'slide-empty-' + showIdx" class="aspect-[2/3] w-full"></div>
                    </transition>
                  </div>
                </div>
                <div class="flex min-w-0 flex-1 flex-col">
                  <transition name="fi-fade" mode="out-in">
                    <div v-if="shows[showIdx]" :key="'info-' + showIdx">
                      <h4 class="mono text-sm text-[var(--fi-text)]">{{ shows[showIdx].name }}</h4>
                      <p class="mt-1.5 text-xs leading-relaxed text-[var(--fi-muted)]">
                        {{ shows[showIdx].desc || '（暂无简述）' }}
                      </p>
                    </div>
                  </transition>
                  <div class="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div class="flex items-center gap-1">
                      <button
                        v-for="(it, i) in shows"
                        :key="it.name"
                        class="h-1.5 transition-all"
                        :class="i === showIdx ? 'w-4 bg-[var(--fi-blue)]' : 'w-1.5 bg-[var(--fi-line-solid)] hover:bg-[var(--fi-muted)]'"
                        :aria-label="it.name"
                        @click="jumpShow(i)"
                      ></button>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="mono text-[9px] text-[var(--fi-muted)]">{{ showIdx + 1 }}/{{ shows.length }}</span>
                      <button
                        class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-text)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-blue)]"
                        aria-label="上一部"
                        @click="stepShow(-1)"
                      >◀</button>
                      <button
                        class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-text)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-blue)]"
                        aria-label="下一部"
                        @click="stepShow(1)"
                      >▶</button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else-if="s.key === 'vocaloid'"
                class="mt-2"
                @mouseenter="vocPaused = true"
                @mouseleave="vocPaused = false"
              >
                <YtCard
                  v-if="vocaloid[vocIdx]"
                  :key="vocaloid[vocIdx].name"
                  :video-id="vocaloid[vocIdx].yt || ''"
                  :name="vocaloid[vocIdx].name"
                />
                <div class="mt-2 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1">
                    <button
                      v-for="(it, i) in vocaloid"
                      :key="it.name"
                      class="h-1.5 transition-all"
                      :class="i === vocIdx ? 'w-4 bg-[var(--fi-blue)]' : 'w-1.5 bg-[var(--fi-line-solid)] hover:bg-[var(--fi-muted)]'"
                      :aria-label="it.name"
                      @click="jumpVoc(i)"
                    ></button>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="mono text-[9px] text-[var(--fi-muted)]">{{ vocIdx + 1 }}/{{ vocaloid.length }}</span>
                    <button
                      class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-text)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-blue)]"
                      aria-label="上一首"
                      @click="stepVoc(-1)"
                    >◀</button>
                    <button
                      class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-text)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-blue)]"
                      aria-label="下一首"
                      @click="stepVoc(1)"
                    >▶</button>
                  </div>
                </div>
              </div>
              <div v-else-if="s.key === 'vtubers'" class="mt-2">
                <img
                  v-if="s.items[0] && s.items[0].img"
                  :src="imgUrl(s.items[0].img)"
                  :alt="s.items[0].name"
                  class="w-full cursor-pointer border-2 border-[var(--fi-line-solid)] object-cover transition hover:border-[var(--fi-blue)]"
                  title="前往 Twitch 频道"
                  @click="s.items[0] && openAbout(s, s.items[0])"
                />
                <p class="mono mt-1.5 truncate text-[10px] text-[var(--fi-muted)]">{{ s.items[0] ? s.items[0].name : '' }}</p>
              </div>
              <div
                v-else
                class="mt-2"
                :class="s.items.length >= 4 ? 'fi-marquee' : 'flex gap-2 overflow-x-auto pb-1'"
                @scroll="hoverCard = null"
              >
                <div
                  :class="s.items.length >= 4 ? 'fi-marquee-track' : 'flex gap-2'"
                  :style="s.items.length >= 4 ? { animationDuration: '30s' } : undefined"
                >
                  <div
                    v-for="(it, i) in stripItems(s)"
                    :key="i"
                    class="group relative w-28 shrink-0 cursor-pointer"
                    :title="s.key === 'games' && it.site ? '前往官方网站' : undefined"
                    @mouseenter="enterCard($event, s, it)"
                    @mouseleave="leaveCard"
                    @click="s.key === 'games' && openAbout(s, it)"
                  >
                    <div
                      class="relative overflow-hidden border-2 transition duration-200 group-hover:scale-[1.04] group-hover:border-[var(--fi-blue)]"
                      :class="ratioClass(s.key)"
                      style="background: linear-gradient(135deg, rgba(121,184,255,0.16), rgba(183,140,255,0.12))"
                    >
                      <img
                        v-if="it.img"
                        :src="imgUrl(it.img)"
                        :alt="it.name"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span
                        v-else
                        class="mono absolute inset-0 flex items-center justify-center text-3xl text-[var(--fi-violet)]/40"
                      >{{ it.name.slice(0, 1) }}</span>
                    </div>
                    <p class="mono mt-1 truncate text-center text-[10px] text-[var(--fi-muted)] group-hover:text-[var(--fi-text)]">
                      {{ it.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="min-w-0 space-y-4 px-3 py-4">
        <section>
          <div class="mb-1.5 flex items-center justify-between">
            <span class="mono text-[9px] text-[var(--fi-warm)]">友链横幅</span>
            <RouterLink to="/banner" class="mono text-[9px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
              横幅样式 ▸
            </RouterLink>
          </div>
          <RouterLink to="/banner" title="查看友链横幅样式">
            <img
              v-if="profile.bannerUrl"
              :src="profile.bannerUrl"
              alt="友链横幅"
              class="block w-full border border-[var(--fi-line-solid)] transition hover:border-[var(--fi-blue)]"
            />
          </RouterLink>
        </section>

        <section class="fi-px-panel space-y-3 bg-[var(--fi-panel)] p-4">
          <h3 class="mono text-xs text-[var(--fi-warm)]">STATION · 观测站状态</h3>
          <div>
            <p class="mono text-[9px] text-[var(--fi-muted)]">电脑在线</p>
            <p class="mono mt-1 flex items-center gap-1.5 text-xs">
              <span
                class="inline-block h-2 w-2"
                :class="pcOnline === 'online' ? 'bg-[var(--fi-blue)]' : pcOnline === 'offline' ? 'bg-[#ff6b6b]' : 'bg-[var(--fi-muted)] animate-pulse'"
              ></span>
              <span :class="pcOnline === 'online' ? 'text-[var(--fi-blue)]' : pcOnline === 'offline' ? 'text-[#ff8a8a]' : 'text-[var(--fi-muted)]'">
                {{ pcOnline === 'online' ? '在线' : pcOnline === 'offline' ? '离线' : '检测中' }}
              </span>
            </p>
          </div>
          <div>
            <p class="mono text-[9px] text-[var(--fi-muted)]">当前状态</p>
            <p class="mono mt-1 text-xs text-[var(--fi-violet)]">
              {{ pcOnline === 'online' && liveStatus ? liveStatus : pcOnline === 'offline' ? '未知' : profile.statusNote }}
            </p>
          </div>
          <div>
            <p class="mono text-[9px] text-[var(--fi-muted)]">观测站版本</p>
            <p class="mono mt-1 text-xs text-[var(--fi-warm)]">v2.0</p>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <h3 class="mono text-xs text-[var(--fi-violet)]">DISCORD · 状态</h3>
          <DiscordStatus v-if="profile.discordId" :user-id="profile.discordId" />
          <p v-else class="mono mt-2 text-xs text-[var(--fi-muted)]">未接入（在 profile.ts 填 discordId 后显示实时状态）</p>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <h3 class="mono text-xs text-[var(--fi-warm)]">NETEASE · 最近听歌</h3>
          <NeteaseCard />
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="mono text-xs text-[var(--fi-warm)]">LATEST · 最近日志</h3>
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
              class="group flex items-baseline justify-between gap-2 border-l-2 border-[var(--fi-blue-dim)] py-1 pl-2.5 transition hover:border-[var(--fi-blue)]"
            >
              <span class="mono truncate text-xs text-[var(--fi-text)] group-hover:text-[var(--fi-blue)]">{{ p.title }}</span>
              <time class="mono shrink-0 text-[9px] text-[var(--fi-muted)]">{{ p.date || '' }}</time>
            </RouterLink>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <h3 class="mono text-xs text-[var(--fi-warm)]">FRIENDS · 友链</h3>
          <div class="mt-2 space-y-2">
            <a
              v-for="f in friends"
              :key="f.name"
              :href="f.links?.[0]?.url || '#'"
              target="_blank"
              rel="noopener"
              class="fi-px-btn block bg-[var(--fi-panel-2)] p-2.5"
            >
              <span class="block truncate text-xs font-medium text-[var(--fi-text)]">{{ f.name }}</span>
              <span v-if="f.desc" class="mt-0.5 block truncate text-[10px] text-[var(--fi-muted)]">{{ f.desc }}</span>
            </a>
            <RouterLink to="/friends" class="mono block text-center text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
              全部友链 ▸
            </RouterLink>
          </div>
        </section>

        <section class="fi-px-panel bg-[var(--fi-panel)] p-4 text-center">
          <h3 class="mono text-xs text-[var(--fi-warm)]">REACH OUT · 联系</h3>
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
    </div>

    <section class="fi-px-panel mx-3 mb-6 bg-[var(--fi-panel)] p-4">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="mono text-xs text-[var(--fi-warm)]">SERVICES · 服务预览</h2>
        <RouterLink to="/services" class="mono text-[10px] text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
          查看完整服务 ▸
        </RouterLink>
      </div>
      <p class="text-xs text-[var(--fi-muted)]">服务内容整理中，敬请期待。</p>
    </section>

    <div
      v-if="hoverCard"
      class="fi-px-panel fixed z-40 w-80 bg-[var(--fi-panel)] p-3"
      :style="{ left: hoverCard.x + 'px', top: hoverCard.y + 'px' }"
      @mouseenter="() => { if (hoverTimer) clearTimeout(hoverTimer); }"
      @mouseleave="leaveCard"
    >
      <div class="flex gap-3">
        <div
          v-if="hoverCard.item.img"
          class="w-20 shrink-0 overflow-hidden border-2 border-[var(--fi-line-solid)]"
          style="background: linear-gradient(135deg, rgba(121,184,255,0.16), rgba(183,140,255,0.12))"
        >
          <img
            :src="imgUrl(hoverCard.item.img)"
            :alt="hoverCard.item.name"
            class="aspect-[2/3] w-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="mono truncate text-sm text-[var(--fi-text)]">{{ hoverCard.item.name }}</h4>
          <p class="mono text-[10px] text-[var(--fi-violet)]">{{ hoverCard.section.title }}</p>
          <p class="mt-1.5 text-xs leading-relaxed text-[var(--fi-muted)]">
            {{ hoverCard.item.desc || '（暂无简述）' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fi-slide-enter-active,
.fi-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fi-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.fi-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.fi-fade-enter-active,
.fi-fade-leave-active {
  transition: opacity 0.3s ease;
}
.fi-fade-enter-from,
.fi-fade-leave-to {
  opacity: 0;
}
</style>

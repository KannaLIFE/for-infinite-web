<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { profile } from '../data/profile';
import { API_BASE } from '../lib/api';
import { nowWorldYear } from '../lib/time';

type ApiState = 'checking' | 'online' | 'offline';
const apiState = ref<ApiState>('checking');

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
});
</script>

<template>
  <div class="fi-stagger mx-auto max-w-6xl space-y-8 px-5">
    <section class="fi-px-panel flex flex-col gap-6 bg-[var(--fi-panel)] p-6 md:flex-row md:items-center">
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
          <h1 class="mono text-2xl font-bold text-[var(--fi-text)] md:text-3xl">{{ profile.name }}</h1>
          <span class="mono flex items-center gap-1.5 border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-2 py-0.5 text-[10px] text-[var(--fi-muted)]">
            <span class="inline-block h-1.5 w-1.5 bg-[var(--fi-blue)]"></span>
            {{ profile.status }}
          </span>
        </div>
        <p class="serif-quote mt-2 text-base text-[var(--fi-warm-soft)]">{{ profile.tagline }}</p>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--fi-muted)]">{{ profile.intro }}</p>
      </div>

      <div class="flex shrink-0 gap-2 md:flex-col">
        <a
          v-for="c in profile.contacts"
          :key="c.label"
          :href="c.value.startsWith('http') ? c.value : `mailto:${c.value}`"
          target="_blank"
          rel="noopener"
          class="mono fi-px-btn bg-[var(--fi-panel-2)] px-3 py-1.5 text-xs text-[var(--fi-blue)]"
        >
          {{ c.label }} ▸
        </a>
      </div>
    </section>

    <section class="fi-px-panel grid grid-cols-2 gap-3 bg-[var(--fi-panel)] p-4 md:grid-cols-4">
      <div>
        <p class="mono text-[10px] text-[var(--fi-muted)]">观测纪</p>
        <p class="mono mt-1 text-sm text-[var(--fi-text)]">{{ nowWorldYear() }} 年</p>
      </div>
      <div>
        <p class="mono text-[10px] text-[var(--fi-muted)]">星区坐标</p>
        <p class="mono mt-1 text-sm text-[var(--fi-violet)]">For Infinite · 穹顶</p>
      </div>
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
        <p class="mono text-[10px] text-[var(--fi-muted)]">观测站版本</p>
        <p class="mono mt-1 text-sm text-[var(--fi-warm)]">v2.0 · 末地风</p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">ABOUT · 关于</h2>
          <span class="mono text-[10px] text-[var(--fi-blue)]">/about</span>
        </div>
        <p class="text-sm leading-relaxed text-[var(--fi-muted)]">{{ profile.intro }}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">
          <span
            v-for="i in profile.interests"
            :key="i"
            class="mono border border-[var(--fi-violet-dim)] bg-[var(--fi-panel-2)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]"
          >{{ i }}</span>
        </div>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">MUSIC · 正在听</h2>
          <span class="mono text-[10px] text-[var(--fi-violet)]">/music</span>
        </div>
        <ul class="space-y-1.5">
          <li v-for="(m, i) in profile.music" :key="m" class="mono flex items-center gap-2 text-sm text-[var(--fi-text)]">
            <span class="inline-block h-2 w-2" :style="`background:${i % 2 ? 'var(--fi-violet)' : 'var(--fi-blue)'}`"></span>
            {{ m }}
          </li>
        </ul>
      </section>
    </div>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">TECH · 技术栈</h2>
        <span class="mono text-[10px] text-[var(--fi-blue)]">/tech</span>
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
  </div>
</template>

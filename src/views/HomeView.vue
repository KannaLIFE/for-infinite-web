<script setup lang="ts">
import { profile } from '../data/profile';
import { nowWorldYear } from '../lib/time';
</script>

<template>
  <div class="fi-stagger mx-auto max-w-6xl space-y-10 px-5">
    <section class="pt-6">
      <p class="mono flex items-center gap-2 text-xs tracking-widest text-[var(--fi-muted)]">
        <span class="inline-block h-2 w-2 bg-[var(--fi-violet)]"></span>
        星权穹顶 · 第 {{ nowWorldYear() }} 观测纪
      </p>
      <h1 class="mono mt-3 text-3xl font-bold text-[var(--fi-text)] md:text-5xl">
        {{ profile.name }}
      </h1>
      <p class="serif-quote mt-3 text-lg text-[var(--fi-warm-soft)]">
        {{ profile.tagline }}
      </p>
      <p class="mt-4 max-w-2xl leading-relaxed text-[var(--fi-muted)]">
        {{ profile.intro }}
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-3">
      <div
        v-for="(block, idx) in [
          { key: 'tech', badge: '/tech', title: 'TECH · 技术', items: profile.techStack },
          { key: 'learn', badge: '/learn', title: 'LEARNING · 正在学', items: profile.learning },
          { key: 'interest', badge: '/interest', title: 'INTEREST · 兴趣', items: profile.interests },
        ]"
        :key="block.key"
        class="fi-px-panel bg-[var(--fi-panel)] p-5"
        :class="idx === 2 ? 'md:col-span-1' : ''"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">{{ block.title }}</h2>
          <span class="mono text-[10px] text-[var(--fi-blue)]">{{ block.badge }}</span>
        </div>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="t in block.items" :key="t" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[var(--fi-blue)]"></span>{{ t }}
          </li>
        </ul>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">CONTACT · 联系方式</h2>
        <span class="mono text-[10px] text-[var(--fi-blue)]">/contact</span>
      </div>
      <div class="flex flex-wrap gap-3">
        <a
          v-for="c in profile.contacts"
          :key="c.label"
          :href="c.value.startsWith('http') ? c.value : undefined"
          class="fi-px-btn bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)]"
        >
          <span class="mono text-xs text-[var(--fi-muted)]">{{ c.label }}</span>
          <span class="ml-2">{{ c.value }}</span>
        </a>
      </div>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">FRIENDS · 友链</h2>
        <RouterLink to="/friends" class="mono text-xs text-[var(--fi-blue)] hover:text-[var(--fi-warm)]">
          全部友链 ▸
        </RouterLink>
      </div>
      <div class="flex flex-wrap gap-3">
        <a
          v-for="f in profile.friends"
          :key="f.url"
          :href="f.url"
          target="_blank"
          rel="noopener"
          class="fi-px-btn bg-[var(--fi-panel-2)] px-4 py-2.5"
        >
          <span class="text-sm font-medium text-[var(--fi-text)]">{{ f.name }}</span>
          <span class="ml-2 text-xs text-[var(--fi-muted)]">{{ f.desc }}</span>
        </a>
      </div>
    </section>

    <section class="fi-px-panel overflow-hidden bg-[var(--fi-panel)]">
      <img
        v-if="profile.bannerUrl"
        :src="profile.bannerUrl"
        alt="banner"
        class="h-auto w-full"
      />
      <div
        v-else
        class="mono flex items-center gap-2 px-5 py-4 text-sm text-[var(--fi-text)]"
      >
        <span class="inline-block h-2 w-2" style="background: var(--fi-warm)"></span>
        FOR INFINITE
      </div>
    </section>
  </div>
</template>

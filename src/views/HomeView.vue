<script setup lang="ts">
import { profile } from '../data/profile';
import { nowWorldYear } from '../lib/time';
</script>

<template>
  <div class="space-y-12">
    <!-- 头部 -->
    <section class="fi-rise pt-6">
      <p class="mono text-xs tracking-widest text-[var(--fi-muted)]">
        星权穹顶 · 第 {{ nowWorldYear() }} 观测纪
      </p>
      <h1 class="mt-2 text-4xl font-bold text-[var(--fi-text)] md:text-5xl">
        {{ profile.name }}
      </h1>
      <p class="serif-quote mt-3 text-lg text-[var(--fi-warm-soft)]">
        {{ profile.tagline }}
      </p>
      <p class="mt-4 max-w-2xl leading-relaxed text-[var(--fi-muted)]">
        {{ profile.intro }}
      </p>
    </section>

    <!-- 技术 / 学习 / 兴趣 -->
    <section class="grid gap-6 md:grid-cols-3">
      <div class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">TECH · 技术</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="t in profile.techStack" :key="t" class="flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-[var(--fi-blue)]"></span>{{ t }}
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">LEARNING · 正在学</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="t in profile.learning" :key="t" class="flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-[var(--fi-blue)]"></span>{{ t }}
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">INTEREST · 兴趣</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="t in profile.interests" :key="t" class="flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-[var(--fi-blue)]"></span>{{ t }}
          </li>
        </ul>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">CONTACT · 联系方式</h2>
      <div class="flex flex-wrap gap-4">
        <a
          v-for="c in profile.contacts"
          :key="c.label"
          :href="c.value.startsWith('http') ? c.value : undefined"
          class="rounded-lg border border-[var(--fi-line)] px-3 py-2 text-sm text-[var(--fi-text)] transition hover:border-[var(--fi-blue)]"
        >
          <span class="mono text-xs text-[var(--fi-muted)]">{{ c.label }}</span>
          <span class="ml-2">{{ c.value }}</span>
        </a>
      </div>
    </section>

    <!-- 友链 -->
    <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">FRIENDS · 友链</h2>
      <div class="flex flex-wrap gap-4">
        <a
          v-for="f in profile.friends"
          :key="f.url"
          :href="f.url"
          target="_blank"
          rel="noopener"
          class="rounded-lg border border-[var(--fi-line)] px-4 py-3 transition hover:border-[var(--fi-warm)]"
        >
          <span class="text-sm font-medium text-[var(--fi-text)]">{{ f.name }}</span>
          <span class="ml-2 text-xs text-[var(--fi-muted)]">{{ f.desc }}</span>
        </a>
      </div>
    </section>

    <!-- Banner（友链横幅） -->
    <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">BANNER</h2>
      <img
        v-if="profile.bannerUrl"
        :src="profile.bannerUrl"
        alt="banner"
        class="h-auto"
      />
      <div
        v-else
        class="mono inline-flex items-center gap-2 rounded border border-[var(--fi-line)] px-4 py-2 text-sm text-[var(--fi-text)]"
      >
        <span class="inline-block h-2 w-2 rounded-full" style="background: var(--fi-warm)"></span>
        FOR INFINITE
      </div>
    </section>
  </div>
</template>

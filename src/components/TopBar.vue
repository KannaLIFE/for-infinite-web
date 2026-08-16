<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const navs = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/personal', label: '个人文章' },
  { to: '/messages', label: '消息' },
  { to: '/admin', label: '后台' },
];
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-40 border-b border-[var(--fi-line)] bg-[var(--fi-bg)]/80 backdrop-blur"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
      <!-- 左上角徽标（开场动画收束到这里） -->
      <RouterLink to="/" class="flex items-center gap-2">
        <span
          class="fi-breathe inline-block h-2 w-2 rounded-full"
          style="background: var(--fi-warm); box-shadow: 0 0 8px var(--fi-warm)"
        ></span>
        <span class="mono text-sm font-semibold tracking-widest text-[var(--fi-text)]">
          FOR INFINITE
        </span>
      </RouterLink>

      <nav class="ml-auto flex items-center gap-1">
        <RouterLink
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="mono rounded px-3 py-1.5 text-xs transition"
          :class="
            route.path === n.to
              ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]'
              : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
        >
          {{ n.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

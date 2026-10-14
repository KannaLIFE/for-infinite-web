<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { currentLocale, setLocale, t } from '../lib/i18n';

const route = useRoute();
const open = ref<string | null>(null);

const locale = computed(() => currentLocale());

function toggleLang(): void {
  setLocale(locale.value === 'zh' ? 'en' : 'zh');
}

const groups = computed(() => [
  {
    key: 'map',
    label: t('nav.map'),
    items: [
      { to: '/blog', label: t('nav.blog') },
      { to: '/personal', label: t('nav.personal') },
    ],
  },
  {
    key: 'workshop',
    label: t('nav.workshop'),
    items: [
      { to: '/projects', label: t('nav.projects') },
      { to: '/gallery', label: t('nav.gallery') },
      { to: '/tech', label: t('nav.tech') },
      { to: '/services', label: t('nav.services') },
    ],
  },
  {
    key: 'link',
    label: t('nav.link'),
    items: [
      { to: '/messages', label: t('nav.messages') },
      { to: '/admin', label: t('nav.admin') },
    ],
  },
]);

watch(
  () => route.path,
  () => {
    open.value = null;
  },
);

function toggle(key: string): void {
  open.value = open.value === key ? null : key;
}

let closeTimer: ReturnType<typeof setTimeout> | null = null;

function hoverOpen(key: string): void {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  open.value = key;
}

function hoverClose(key: string): void {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (open.value === key) open.value = null;
  }, 200);
}
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-40 border-b border-[var(--fi-line)] bg-[var(--fi-bg)]/85 backdrop-blur"
  >
    <div class="flex w-full items-center gap-4 px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2">
        <span
          class="fi-breathe inline-block h-2 w-2"
          style="background: var(--fi-warm); box-shadow: 0 0 8px var(--fi-warm)"
        ></span>
        <span class="mono text-sm font-semibold tracking-widest text-[var(--fi-text)]">
          FOR INFINITE
        </span>
      </RouterLink>

      <nav class="ml-auto flex flex-wrap items-center gap-0.5">
        <RouterLink
          to="/"
          class="mono px-3 py-1.5 text-xs transition"
          :class="
            route.path === '/'
              ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]'
              : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
        >
          {{ t('nav.home') }}
        </RouterLink>

        <RouterLink
          to="/friends"
          class="mono px-3 py-1.5 text-xs transition"
          :class="
            route.path === '/friends'
              ? 'bg-[var(--fi-panel-2)] text-[var(--fi-violet)]'
              : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
        >
          {{ t('nav.friends') }}
        </RouterLink>

        <div
          v-for="g in groups"
          :key="g.key"
          class="relative"
          @mouseenter="hoverOpen(g.key)"
          @mouseleave="hoverClose(g.key)"
        >
          <button
            type="button"
            class="mono px-3 py-1.5 text-xs transition"
            :class="
              open === g.key || g.items.some((i) => route.path === i.to)
                ? 'text-[var(--fi-warm)]'
                : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
            "
            @click="toggle(g.key)"
          >
            {{ g.label }} <span class="text-[10px]">▾</span>
          </button>

          <div
            v-if="open === g.key"
            class="absolute right-0 top-full pt-2"
          >
            <div class="fi-px-panel flex min-w-36 flex-col gap-1 bg-[var(--fi-panel)] p-2">
            <RouterLink
              v-for="i in g.items"
              :key="i.to"
              :to="i.to"
              class="mono px-3 py-1.5 text-xs transition"
              :class="
                route.path === i.to
                  ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]'
                  : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
              "
            >
              {{ i.label }}
            </RouterLink>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mono ml-1 border border-[var(--fi-line-solid)] px-2.5 py-1.5 text-xs text-[var(--fi-muted)] transition hover:border-[var(--fi-warm)] hover:text-[var(--fi-text)]"
          :title="locale === 'zh' ? 'Switch to English' : '切换到中文'"
          @click="toggleLang"
        >
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
      </nav>
    </div>
  </header>
</template>

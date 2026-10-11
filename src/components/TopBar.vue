<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const open = ref<string | null>(null);

const groups = [
  {
    key: 'map',
    label: '鏄熷浘',
    items: [
      { to: '/blog', label: '鍗氬' },
      { to: '/personal', label: '涓汉鏂囩珷' },
    ],
  },
  {
    key: 'workshop',
    label: '宸ュ潑',
    items: [
      { to: '/projects', label: '椤圭洰' },
      { to: '/gallery', label: '鐢诲粖' },
      { to: '/tech', label: '鎶€鏈爤' },
      { to: '/roadmap', label: '璺嚎鍥? },
      { to: '/services', label: '鏈嶅姟路濮旀墭' },
    ],
  },
  {
    key: 'archive',
    label: '妗ｆ',
    items: [
      { to: '/achievements', label: '鎴愬氨' },
      { to: '/certificates', label: '璇佷功' },
      { to: '/affiliations', label: '闃佃惀' },
      { to: '/testimonials', label: '濂借瘎' },
    ],
  },
  {
    key: 'link',
    label: '鏄熻仈',
    items: [
      { to: '/messages', label: '娑堟伅' },
      { to: '/guestbook', label: '鐣欒█鏉? },
      { to: '/admin', label: '鍚庡彴' },
    ],
  },
];

watch(
  () => route.path,
  () => {
    open.value = null;
  },
);

function toggle(key: string): void {
  open.value = open.value === key ? null : key;
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

      <nav class="ml-auto flex items-center gap-0.5">
        <RouterLink
          to="/"
          class="mono px-3 py-1.5 text-xs transition"
          :class="
            route.path === '/'
              ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]'
              : 'text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
        >
          涓婚〉
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
          鍙嬮摼
        </RouterLink>

        <div
          v-for="g in groups"
          :key="g.key"
          class="relative"
          @mouseleave="open = null"
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
            {{ g.label }} <span class="text-[10px]">鈻?/span>
          </button>

          <div
            v-if="open === g.key"
            class="fi-px-panel absolute right-0 top-full mt-2 flex min-w-36 flex-col gap-1 bg-[var(--fi-panel)] p-2"
          >
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
      </nav>
    </div>
  </header>
</template>

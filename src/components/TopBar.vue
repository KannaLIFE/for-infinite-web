<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const open = ref<string | null>(null);

const groups = [
  {
    key: 'map',
    label: '星图',
    items: [
      { to: '/blog', label: '博客' },
      { to: '/personal', label: '个人文章' },
    ],
  },
  {
    key: 'workshop',
    label: '工坊',
    items: [
      { to: '/projects', label: '项目' },
      { to: '/gallery', label: '画廊' },
      { to: '/tech', label: '技术栈' },
      { to: '/roadmap', label: '路线图' },
      { to: '/services', label: '服务·委托' },
    ],
  },
  {
    key: 'archive',
    label: '档案',
    items: [
      { to: '/achievements', label: '成就' },
      { to: '/certificates', label: '证书' },
      { to: '/affiliations', label: '阵营' },
      { to: '/testimonials', label: '好评' },
    ],
  },
  {
    key: 'link',
    label: '星联',
    items: [
      { to: '/messages', label: '消息' },
      { to: '/guestbook', label: '留言板' },
      { to: '/admin', label: '后台' },
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
          主页
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
          友链
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
            {{ g.label }} <span class="text-[10px]">▾</span>
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

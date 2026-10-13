<script setup lang="ts">
import { ref } from 'vue';

const base = import.meta.env.BASE_URL;
const bannerUrl = `https://kannalife.github.io/for-infinite-web/banner.webp`;
const avatarUrl = `https://kannalife.github.io/for-infinite-web/avatar.jpg`;
const name = 'KannaLIFE';

const items = [
  {
    key: 'card-avatar',
    title: '样式一 · 头像卡片横幅',
    desc: '浅色底框覆盖图片下方，头像半浮于框线上，名字在右侧。适合作为友链卡片。',
    html: '',
    urls: [bannerUrl, avatarUrl],
    kind: 'card-avatar',
  },
  {
    key: 'card-name',
    title: '样式二 · 纯名字横幅',
    desc: '同款底框，不带头像，只放名字。',
    html: '',
    urls: [bannerUrl],
    kind: 'card-name',
  },
  {
    key: 'plain',
    title: '样式三 · 纯图片',
    desc: '直接使用横幅图片，适合放在页脚或侧栏。',
    html: '',
    urls: [bannerUrl],
    kind: 'plain',
  },
  {
    key: 'avatar',
    title: '样式四 · 头像图片',
    desc: '单独的头像图，适合方形友链位。',
    html: '',
    urls: [avatarUrl],
    kind: 'avatar',
  },
];

const copied = ref<string | null>(null);
function copy(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = text;
    setTimeout(() => {
      copied.value = null;
    }, 1500);
  });
}
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">友链横幅 · 样式</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/banner</span>
    </header>
    <p class="text-sm text-[var(--fi-muted)]">
      挑选喜欢的样式，点击地址即可复制，放到你自己的博客友链区。
    </p>

    <div class="fi-stagger grid gap-6 md:grid-cols-2">
      <section
        v-for="it in items"
        :key="it.key"
        class="fi-px-panel flex flex-col bg-[var(--fi-panel)] p-4"
      >
        <h2 class="mono text-sm text-[var(--fi-warm)]">{{ it.title }}</h2>
        <p class="mt-1 text-xs text-[var(--fi-muted)]">{{ it.desc }}</p>

        <div class="mt-4 flex min-h-44 items-center justify-center bg-[var(--fi-bg)] p-4">
          <template v-if="it.kind === 'card-avatar'">
            <div class="relative w-full max-w-sm">
              <img :src="bannerUrl" alt="banner" class="block w-full rounded-md" />
              <div
                class="absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-b-md bg-[#f2f6ff]/95 px-4 pb-2.5 pt-3.5"
              >
                <div class="-mt-10 h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#f2f6ff] bg-[#dbe6ff]">
                  <img :src="avatarUrl" :alt="name" class="h-full w-full object-cover" />
                </div>
                <span class="mono text-sm font-semibold tracking-wider text-[#3b4a6b]">{{ name }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="it.kind === 'card-name'">
            <div class="relative w-full max-w-sm">
              <img :src="bannerUrl" alt="banner" class="block w-full rounded-md" />
              <div class="absolute inset-x-0 bottom-0 flex items-center rounded-b-md bg-[#f2f6ff]/95 px-4 py-2.5">
                <span class="mono text-sm font-semibold tracking-wider text-[#3b4a6b]">{{ name }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="it.kind === 'plain'">
            <img :src="bannerUrl" alt="banner" class="w-full max-w-sm rounded border border-[var(--fi-line-solid)]" />
          </template>

          <template v-else>
            <img :src="avatarUrl" :alt="name" class="h-24 w-24 rounded-full border-2 border-[var(--fi-line-solid)] object-cover" />
          </template>
        </div>

        <div class="mt-3 space-y-1.5">
          <button
            v-for="u in it.urls"
            :key="u"
            class="mono block w-full truncate border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-3 py-1.5 text-left text-[10px] text-[var(--fi-blue)] transition hover:border-[var(--fi-blue)]"
            :title="u"
            @click="copy(u)"
          >
            {{ u }}
            <span v-if="copied === u" class="ml-2 text-[var(--fi-warm)]">已复制 ✓</span>
            <span v-else class="ml-2 text-[var(--fi-muted)]">点击复制</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

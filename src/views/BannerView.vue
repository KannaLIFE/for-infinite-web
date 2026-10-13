<script setup lang="ts">
import { ref } from 'vue';

const base = import.meta.env.BASE_URL;
const bannerUrl = `https://kannalife.github.io/for-infinite-web/banner.webp`;
const bannerCardUrl = `https://kannalife.github.io/for-infinite-web/banner-card.jpg`;
const bannerNameUrl = `https://kannalife.github.io/for-infinite-web/banner-name.jpg`;
const avatarUrl = `https://kannalife.github.io/for-infinite-web/avatar.jpg`;
const name = 'KannaLIFE';

const items = [
  {
    key: 'card-avatar',
    title: '样式一 · 头像卡片横幅',
    desc: '浅色底框覆盖图片下方，头像半浮于框线上，名字在右侧。适合作为友链卡片。',
    html: '',
    urls: [bannerCardUrl],
    kind: 'card-avatar',
    img: bannerCardUrl,
  },
  {
    key: 'card-name',
    title: '样式二 · 纯名字横幅',
    desc: '同款底框，不带头像，只放名字。',
    html: '',
    urls: [bannerNameUrl],
    kind: 'card-name',
    img: bannerNameUrl,
  },
  {
    key: 'plain',
    title: '样式三 · 纯图片',
    desc: '直接使用横幅图片，适合放在页脚或侧栏。',
    html: '',
    urls: [bannerUrl],
    kind: 'plain',
    img: bannerUrl,
  },
  {
    key: 'avatar',
    title: '样式四 · 头像图片',
    desc: '单独的头像图，适合方形友链位。',
    html: '',
    urls: [avatarUrl],
    kind: 'avatar',
    img: avatarUrl,
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
          <img
            v-if="it.kind === 'plain'"
            :src="it.img"
            alt="banner"
            class="w-full max-w-sm rounded border border-[var(--fi-line-solid)]"
          />
          <img
            v-else-if="it.kind === 'avatar'"
            :src="it.img"
            :alt="name"
            class="h-24 w-24 rounded-full border-2 border-[var(--fi-line-solid)] object-cover"
          />
          <img
            v-else
            :src="it.img"
            alt="banner"
            class="w-full max-w-sm rounded-md border border-[var(--fi-line-solid)]"
          />
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

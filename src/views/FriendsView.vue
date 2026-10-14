<script setup lang="ts">
import { friends } from '../data/friends';

const base = import.meta.env.BASE_URL;
const defaultBanner = `${base}friend-default.jpg`;

function friendUrl(f: (typeof friends)[number]): string {
  return f.links?.[0]?.url || '#';
}

function onCoverError(e: Event): void {
  const img = e.target as HTMLImageElement;
  if (img.src !== defaultBanner) img.src = defaultBanner;
}
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">友链 · 星群</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/friends</span>
    </header>
    <p class="mono text-xs text-[var(--fi-muted)]">
      每个坐标，都是一位同行者。想加入？在 <span class="text-[var(--fi-blue)]">src/data/friends.ts</span> 添加。
    </p>

    <div v-if="!friends.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      星群空空如也。
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <a
        v-for="f in friends"
        :key="f.name"
        :href="friendUrl(f)"
        :title="f.desc || f.name"
        target="_blank"
        rel="noopener"
        class="group block"
      >
        <div class="relative aspect-video w-full overflow-hidden border-2 border-[var(--fi-line-solid)] transition hover:border-[var(--fi-blue)]">
          <img
            :src="f.cover || defaultBanner"
            :alt="f.name"
            class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            @error="onCoverError"
          />

          <div class="absolute inset-x-0 bottom-0 h-[24%]" style="background: #f2f6ff"></div>

          <div class="absolute bottom-[6%] left-[4%] aspect-square h-[36%]">
            <img
              v-if="f.avatar"
              :src="f.avatar"
              :alt="f.name"
              class="h-full w-full rounded-full border-[3px] border-white object-cover"
              loading="lazy"
            />
            <span
              v-else
              class="flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-[var(--fi-blue)] mono text-white"
            >
              {{ f.name.slice(0, 1) }}
            </span>
          </div>

          <div class="absolute inset-x-0 bottom-0 flex h-[24%] items-center pr-3" style="padding-left: 44%">
            <h2 class="mono w-full truncate text-base font-semibold text-black md:text-lg">
              {{ f.name }}
            </h2>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

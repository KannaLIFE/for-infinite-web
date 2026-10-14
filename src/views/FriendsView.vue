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

    <div v-else class="space-y-4">
      <a
        v-for="f in friends"
        :key="f.name"
        :href="friendUrl(f)"
        target="_blank"
        rel="noopener"
        class="group block"
      >
        <div class="relative h-28 w-full overflow-hidden border-2 border-[var(--fi-line-solid)] transition hover:border-[var(--fi-blue)] sm:h-32">
          <img
            :src="f.cover || defaultBanner"
            :alt="f.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            @error="onCoverError"
          />
          <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]">
                <img v-if="f.avatar" :src="f.avatar" :alt="f.name" class="h-full w-full object-cover" loading="lazy" />
                <span v-else class="mono text-sm text-[var(--fi-blue)]">{{ f.name.slice(0, 1) }}</span>
              </span>
              <div class="min-w-0">
                <h2 class="mono truncate text-sm text-white">{{ f.name }}</h2>
                <p v-if="f.desc" class="truncate text-[10px] text-white/70">{{ f.desc }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <span
                v-for="t in f.tags || []"
                :key="t"
                class="mono hidden border border-white/30 bg-black/40 px-1.5 py-0.5 text-[9px] text-white/80 md:inline-block"
              >{{ t }}</span>
              <span class="mono border border-[var(--fi-blue)]/60 bg-black/50 px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">主页 ▸</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

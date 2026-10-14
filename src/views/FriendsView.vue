<script setup lang="ts">
import { friends } from '../data/friends';
import { pick, t } from '../lib/i18n';

const base = import.meta.env.BASE_URL;
const defaultBanner = `${base}friend-default.jpg`;

function friendUrl(f: (typeof friends)[number]): string {
  return f.links?.[0]?.url || '#';
}

function friendName(f: (typeof friends)[number]): string {
  return pick(f.name, f.nameEn);
}

function coverUrl(f: (typeof friends)[number]): string {
  if (!f.cover) return defaultBanner;
  if (/^https?:/.test(f.cover)) return f.cover;
  return base + f.cover;
}

function onCoverError(e: Event): void {
  const img = e.target as HTMLImageElement;
  if (img.src !== defaultBanner) img.src = defaultBanner;
}
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">{{ t('friends.title') }}</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/friends</span>
    </header>
    <p class="mono text-xs text-[var(--fi-muted)]">
      {{ t('friends.intro') }}
    </p>

    <div v-if="!friends.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      {{ t('friends.empty') }}
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <a
        v-for="f in friends"
        :key="f.name"
        :href="friendUrl(f)"
        :title="pick(f.desc, f.descEn) || friendName(f)"
        target="_blank"
        rel="noopener"
        class="group block"
      >
        <div
          class="relative aspect-video w-full overflow-hidden border-2 transition"
          style="border-color: transparent; border-image: linear-gradient(135deg, var(--fi-blue), var(--fi-violet), var(--fi-line-solid), var(--fi-violet), var(--fi-blue)) 1"
        >
          <img
            :src="coverUrl(f)"
            :alt="friendName(f)"
            class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            @error="onCoverError"
          />

          <div class="absolute inset-x-0 bottom-0 h-[24%] border-t-2" style="background: var(--fi-panel); border-color: var(--fi-line-solid)"></div>

          <div class="absolute bottom-[6%] left-[4%] aspect-square h-[36%]">
            <img
              v-if="f.avatar"
              :src="f.avatar"
              :alt="friendName(f)"
              class="h-full w-full rounded-full border-2 border-[var(--fi-blue)] bg-[var(--fi-panel-2)] object-cover"
              loading="lazy"
            />
            <span
              v-else
              class="mono flex h-full w-full items-center justify-center rounded-full border-2 border-[var(--fi-blue)] bg-[var(--fi-panel-2)] text-white"
            >
              {{ friendName(f).slice(0, 1) }}
            </span>
          </div>

          <div class="absolute inset-x-0 bottom-0 flex h-[24%] items-center pr-2" style="padding-left: 44%">
            <h2 class="mono w-full truncate text-xs font-semibold text-[var(--fi-text)] md:text-sm">
              {{ friendName(f) }}
            </h2>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

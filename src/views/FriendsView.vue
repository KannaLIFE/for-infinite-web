<script setup lang="ts">
import { friends } from '../data/friends';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">鍙嬮摼 路 鏄熺兢</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/friends</span>
    </header>
    <p class="mono text-xs text-[var(--fi-muted)]">
      姣忎釜鍧愭爣锛岄兘鏄竴浣嶅悓琛岃€呫€傛兂鍔犲叆锛熷湪 <span class="text-[var(--fi-blue)]">src/data/friends.ts</span> 娣诲姞銆?    </p>

    <div v-if="!friends.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      鏄熺兢绌虹┖濡備篃銆?    </div>

    <div v-else class="fi-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="f in friends"
        :key="f.name"
        class="group fi-px-panel overflow-hidden bg-[var(--fi-panel)] transition hover:border-[var(--fi-violet)]"
      >
        <div
          class="relative h-28 w-full overflow-hidden"
          style="background: linear-gradient(135deg, rgba(121, 184, 255, 0.2), rgba(183, 140, 255, 0.16))"
        >
          <img
            v-if="f.cover"
            :src="f.cover"
            :alt="f.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span v-else class="mono absolute inset-0 flex items-center justify-center text-4xl text-[var(--fi-violet)]/40">
            {{ f.name.slice(0, 1) }}
          </span>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)]"
            >
              <img v-if="f.avatar" :src="f.avatar" :alt="f.name" class="h-full w-full object-cover" />
              <span v-else class="mono text-sm text-[var(--fi-blue)]">{{ f.name.slice(0, 1) }}</span>
            </span>
            <h2 class="mono truncate text-base text-[var(--fi-text)]">{{ f.name }}</h2>
          </div>

          <p v-if="f.desc" class="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--fi-muted)]">
            {{ f.desc }}
          </p>

          <div v-if="f.tags && f.tags.length" class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="t in f.tags"
              :key="t"
              class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-muted)]"
            >{{ t }}</span>
          </div>

          <div v-if="f.links && f.links.length" class="mt-4 flex flex-wrap gap-2">
            <a
              v-for="l in f.links"
              :key="l.url + l.label"
              :href="l.url"
              target="_blank"
              rel="noopener"
              class="mono fi-px-btn bg-[var(--fi-panel-2)] px-2.5 py-1 text-[10px] text-[var(--fi-blue)]"
            >{{ l.label }} 鈻?/a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

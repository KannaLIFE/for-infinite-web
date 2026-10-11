<script setup lang="ts">
import { projects } from '../data/projects';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">椤圭洰 路 宸ュ潑</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-blue)]">/projects</span>
    </header>

    <div v-if="!projects.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      宸ュ潑杩樼┖鐫€锛屽湪 src/data/projects.ts 娣诲姞椤圭洰銆?    </div>

    <div v-else class="fi-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="p in projects"
        :key="p.name"
        class="group fi-px-panel overflow-hidden bg-[var(--fi-panel)] transition hover:border-[var(--fi-blue)]"
      >
        <div
          class="relative h-32 w-full overflow-hidden"
          style="background: linear-gradient(135deg, rgba(121, 184, 255, 0.2), rgba(183, 140, 255, 0.14))"
        >
          <img
            v-if="p.cover"
            :src="p.cover"
            :alt="p.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span v-else class="mono absolute inset-0 flex items-center justify-center text-4xl text-[var(--fi-blue)]/40">
            {{ p.name.slice(0, 1) }}
          </span>
        </div>
        <div class="p-4">
          <h2 class="mono text-base text-[var(--fi-text)]">{{ p.name }}</h2>
          <p v-if="p.desc" class="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--fi-muted)]">{{ p.desc }}</p>
          <div v-if="p.tags && p.tags.length" class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="t in p.tags"
              :key="t"
              class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] px-1.5 py-0.5 text-[10px] text-[var(--fi-muted)]"
            >{{ t }}</span>
          </div>
          <div v-if="p.links && p.links.length" class="mt-4 flex flex-wrap gap-2">
            <a
              v-for="l in p.links"
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

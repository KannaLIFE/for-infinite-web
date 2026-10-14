<script setup lang="ts">
import { ref } from 'vue';
import { gallery, type GalleryItem } from '../data/gallery';
import { t } from '../lib/i18n';

const lightbox = ref<GalleryItem | null>(null);
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">{{ t('gallery.title') }}</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-violet)]">/gallery</span>
    </header>

    <div v-if="!gallery.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      {{ t('gallery.empty') }}
    </div>

    <div v-else class="fi-stagger grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <button
        v-for="g in gallery"
        :key="g.src"
        class="group fi-px-panel aspect-square overflow-hidden bg-[var(--fi-panel-2)] p-0 transition hover:border-[var(--fi-violet)]"
        @click="lightbox = g"
      >
        <img :src="g.src" :alt="g.alt" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
      </button>
    </div>

    <div
      v-if="lightbox"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      @click.self="lightbox = null"
    >
      <div class="fi-px-panel max-h-[85vh] max-w-4xl bg-[var(--fi-panel)] p-3">
        <img :src="lightbox.src" :alt="lightbox.alt" class="max-h-[70vh] w-auto object-contain" />
        <p v-if="lightbox.caption" class="mono mt-2 text-center text-xs text-[var(--fi-muted)]">{{ lightbox.caption }}</p>
        <button class="mono mt-2 block w-full text-xs text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="lightbox = null">
          {{ t('common.closeX') }}
        </button>
      </div>
    </div>
  </div>
</template>

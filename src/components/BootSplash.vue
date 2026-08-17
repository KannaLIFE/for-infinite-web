<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';

const emit = defineEmits<{ done: [] }>();

const quote = ref<{ text: string; author: string }>({
  text: '认识你自己。',
  author: '苏格拉底',
});
const phase = ref<'intro' | 'shrink'>('intro');
const showQuote = ref(false);

const letters = 'FOR INFINITE'.split('');

const style = computed(() => {
  if (phase.value === 'shrink') {
    return {
      top: '18px',
      left: '18px',
      transform: 'translate(0,0) scale(0.32)',
      transformOrigin: 'top left',
    };
  }
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%) scale(1)',
    transformOrigin: 'center',
  };
});

onMounted(async () => {
  // 后台拉取哲言（失败则用默认）
  try {
    const r = await api.get<{ text: string; author: string }>('/api/quote');
    if (r.text) quote.value = { text: r.text, author: r.author || '' };
  } catch {
    /* keep default */
  }

  // 时间轴：字符快速显现 → 立即显哲言 → 立即缩小 → 结束
  setTimeout(() => (showQuote.value = true), 900);
  setTimeout(() => (phase.value = 'shrink'), 1500);
  setTimeout(() => emit('done'), 2500);
});

function skip(): void {
  emit('done');
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fi-bg)]">
    <!-- 光核背景晕光 -->
    <div
      class="fi-breathe pointer-events-none absolute h-72 w-72 rounded-full"
      style="background: radial-gradient(circle, rgba(240,179,90,0.10), transparent 70%)"
    ></div>

    <!-- 徽标：随阶段从中心缩小到左上角 -->
    <div
      class="absolute flex flex-col items-center"
      :style="{ ...style, transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }"
    >
      <div class="flex items-baseline gap-[0.12em]">
        <span
          v-for="(ch, i) in letters"
          :key="i"
          class="inline-block font-mono text-4xl font-semibold tracking-tight text-[var(--fi-text)] md:text-6xl"
          :style="{
            opacity: 0,
            animation: `fi-letter 0.05s ease ${i * 0.05}s forwards`,
            color: ch === ' ' ? 'transparent' : undefined,
          }"
        >{{ ch === ' ' ? '\u00A0' : ch }}</span>
      </div>

      <!-- 光核细线 -->
      <div
        class="mt-3 h-px w-full"
        style="
          background: linear-gradient(90deg, transparent, var(--fi-warm), transparent);
          animation: fi-line-grow 0.6s ease 0.3s forwards;
          transform-origin: center;
          opacity: 0;
        "
      ></div>

      <!-- 哲言（带出处） -->
      <p
        v-show="showQuote"
        class="serif-quote fi-rise mt-5 max-w-md px-6 text-center text-sm text-[var(--fi-muted)] md:text-base"
      >
        {{ quote.text }}
        <span v-if="quote.author" class="mono mt-1 block text-xs text-[var(--fi-muted)]">
          —— {{ quote.author }}
        </span>
      </p>
    </div>

    <!-- 跳过 -->
    <button
      class="absolute bottom-8 right-8 text-xs text-[var(--fi-muted)] opacity-60 transition hover:opacity-100"
      @click="skip"
    >
      跳过 →
    </button>
  </div>
</template>

<style>
@keyframes fi-letter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fi-line-grow {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}
</style>

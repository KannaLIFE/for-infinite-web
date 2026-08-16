<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../lib/api';

const emit = defineEmits<{ done: [] }>();

const phrase = ref('算不完，也要算。');
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
  // 后台拉取哲学语句（失败则用默认）
  try {
    const r = await api.get<{ quote: string }>('/api/quote');
    if (r.quote) phrase.value = r.quote;
  } catch {
    /* keep default */
  }

  // 时间轴：字符动画 -> 显示语句 -> 缩小 -> 结束
  setTimeout(() => (showQuote.value = true), 1500);
  setTimeout(() => (phase.value = 'shrink'), 3300);
  setTimeout(() => emit('done'), 4200);
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
      :style="{ ...style, transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }"
    >
      <div class="flex items-baseline gap-[0.12em]">
        <span
          v-for="(ch, i) in letters"
          :key="i"
          class="inline-block font-mono text-4xl font-semibold tracking-tight text-[var(--fi-text)] md:text-6xl"
          :style="{
            opacity: 0,
            animation: `fi-letter 0.05s ease ${i * 0.06}s forwards`,
            color: ch === ' ' ? 'transparent' : undefined,
          }"
        >{{ ch === ' ' ? '\u00A0' : ch }}</span>
      </div>

      <!-- 光核细线 -->
      <div
        class="mt-3 h-px w-full"
        style="
          background: linear-gradient(90deg, transparent, var(--fi-warm), transparent);
          animation: fi-line-grow 1.4s ease 0.2s forwards;
          transform-origin: center;
          opacity: 0;
        "
      ></div>

      <!-- 哲学语句 -->
      <p
        v-show="showQuote"
        class="serif-quote fi-rise mt-5 max-w-md px-6 text-center text-sm text-[var(--fi-muted)] md:text-base"
      >
        {{ phrase }}
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

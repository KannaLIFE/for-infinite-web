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
const typed = ref('');
const typingDone = ref(false);

const letters = 'FOR INFINITE'.split('');
const fullLine = '> 连接星权穹顶 ▮';

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
  try {
    const r = await api.get<{ text: string; author: string }>('/api/quote');
    if (r.text) quote.value = { text: r.text, author: r.author || '' };
  } catch {

  }

  let i = 0;
  const timer = setInterval(() => {
    i++;
    typed.value = fullLine.slice(0, i);
    if (i >= fullLine.length) {
      clearInterval(timer);
      typingDone.value = true;
    }
  }, 55);

  setTimeout(() => (showQuote.value = true), 1600);
  setTimeout(() => (phase.value = 'shrink'), 2300);
  setTimeout(() => emit('done'), 3300);
});

function skip(): void {
  emit('done');
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fi-bg)]">
    <span
      v-for="p in 8"
      :key="p"
      class="absolute"
      :style="{
        width: 2 + (p % 3) + 'px',
        height: 2 + (p % 3) + 'px',
        left: 8 + p * 11 + '%',
        top: 20 + ((p * 37) % 60) + '%',
        background: p % 2 ? 'var(--fi-violet)' : 'var(--fi-blue)',
        opacity: 0.5,
        animation: `float-px ${5 + p * 0.7}s linear infinite`,
      }"
    ></span>

    <div
      class="fi-breathe pointer-events-none absolute h-72 w-72"
      style="background: radial-gradient(circle, rgba(247,211,138,0.10), transparent 70%)"
    ></div>

    <div
      class="absolute flex flex-col items-center"
      :style="{ ...style, transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }"
    >
      <div class="flex items-baseline gap-[0.12em]">
        <span
          v-for="(ch, i) in letters"
          :key="i"
          class="mono inline-block text-4xl font-semibold tracking-tight md:text-6xl"
          :style="{
            opacity: 0,
            animation: `fi-letter 0.05s ease ${i * 0.05}s forwards`,
            color: ch === ' ' ? 'transparent' : i % 3 === 0 ? 'var(--fi-violet)' : 'var(--fi-text)',
          }"
        >{{ ch === ' ' ? '\u00A0' : ch }}</span>
      </div>

      <div
        class="mt-3 h-0.5 w-full"
        style="
          background: linear-gradient(90deg, transparent, var(--fi-warm), transparent);
          animation: fi-line-grow 0.6s ease 0.3s forwards;
          transform-origin: center;
          opacity: 0;
        "
      ></div>

      <p class="mono mt-5 h-5 text-xs text-[var(--fi-muted)] md:text-sm">
        {{ typed }}<span v-if="!typingDone" class="text-[var(--fi-blue)]">█</span>
      </p>

      <p
        v-show="showQuote"
        class="fi-rise mt-4 max-w-md px-6 text-center text-sm italic text-[var(--fi-muted)] md:text-base"
      >
        <span class="text-[var(--fi-violet)]">「{{ quote.text }}」</span>
        <span v-if="quote.author" class="mono mt-1 block text-xs text-[var(--fi-muted)]">
          —— {{ quote.author }}
        </span>
      </p>
    </div>

    <button
      class="mono absolute bottom-8 right-8 border-2 border-[var(--fi-line-solid)] px-3 py-1 text-xs text-[var(--fi-muted)] transition hover:border-[var(--fi-blue)] hover:text-[var(--fi-text)]"
      @click="skip"
    >
      跳过 ▸
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
@keyframes float-px {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 0.5; }
  100% { transform: translateY(-140px); opacity: 0; }
}
</style>

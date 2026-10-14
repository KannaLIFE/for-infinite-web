<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { pick, t } from '../lib/i18n';

const props = defineProps<{ clocks: { label: string; en?: string; offset: number }[] }>();

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

function timeOf(offset: number): string {
  const utc = now.value.getTime() + now.value.getTimezoneOffset() * 60000;
  const d = new Date(utc + offset * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="fi-px-panel bg-[var(--fi-panel)] p-4">
    <h3 class="mono text-xs text-[var(--fi-warm)]">{{ t('widgets.worldClock') }}</h3>
    <div class="mt-3 grid grid-cols-3 gap-2">
      <div
        v-for="c in props.clocks"
        :key="c.label"
        class="border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-2 text-center"
      >
        <p class="mono text-[10px] text-[var(--fi-muted)]">{{ pick(c.label, c.en) }}</p>
        <p class="mono mt-1 text-sm text-[var(--fi-text)]">{{ timeOf(c.offset) }}</p>
        <p class="mono text-[9px] text-[var(--fi-blue)]">GMT {{ c.offset >= 0 ? '+' : '' }}{{ c.offset }}</p>
      </div>
    </div>
  </div>
</template>

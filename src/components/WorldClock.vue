<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { pick, t } from '../lib/i18n';

const props = defineProps<{ clocks: { label: string; en?: string; tz: string }[] }>();

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

/** 用 IANA 时区 + Intl 计算当地时刻，自动处理夏令时 */
function timeOf(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now.value);
  } catch {
    return '--:--:--';
  }
}

/** 动态偏移标签（GMT+8 / GMT-4 …），随夏令时自动变化 */
function offsetOf(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(now.value);
    const p = parts.find((x) => x.type === 'timeZoneName');
    return p ? p.value : '';
  } catch {
    return '';
  }
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
        <p class="mono mt-1 text-sm text-[var(--fi-text)]">{{ timeOf(c.tz) }}</p>
        <p class="mono text-[9px] text-[var(--fi-blue)]">{{ offsetOf(c.tz) }}</p>
      </div>
    </div>
  </div>
</template>

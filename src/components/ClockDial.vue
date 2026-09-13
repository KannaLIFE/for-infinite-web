<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{

  years: number[];

  modelValue: number;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

const R = 220;
const CX = -R * 0.5;
const CY = R * 0.866;
const W = R * 0.5 + 20;
const H = R * 1.732;
const START_ANGLE = 30;
const END_ANGLE = 150;
const POINTER_ANGLE = 90;
const ANGLE_PER_YEAR = 6;

const displayYear = ref(props.modelValue);
const velocity = ref(0);
let rafId: number | null = null;

watch(
  () => props.modelValue,
  (v) => {
    if (rafId === null && Math.abs(displayYear.value - v) > 0.01) {
      displayYear.value = v;
    }
  },
);

const MIN_YEAR = 0;

function onWheel(e: WheelEvent): void {

  const unit = Math.min(Math.abs(e.deltaY) * 0.0007, 0.07);
  const dir = e.deltaY < 0 ? 1 : -1;

  if (displayYear.value <= MIN_YEAR && dir < 0) return;
  velocity.value += dir * unit;
  if (rafId === null) rafId = requestAnimationFrame(step);
}

function step(): void {
  displayYear.value += velocity.value;

  if (displayYear.value < MIN_YEAR) {
    displayYear.value = MIN_YEAR;
    velocity.value = 0;
  }
  velocity.value *= 0.93;

  if (Math.abs(velocity.value) < 0.004) {

    const target = Math.round(displayYear.value);
    const diff = target - displayYear.value;
    if (Math.abs(diff) < 0.02) {
      displayYear.value = target;
      velocity.value = 0;
      rafId = null;
      emit('update:modelValue', target);
      return;
    }
    displayYear.value += diff * 0.22;
  }
  rafId = requestAnimationFrame(step);
}

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});

function pt(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function angleOf(year: number): number {
  return POINTER_ANGLE - (displayYear.value - year) * ANGLE_PER_YEAR;
}

const visibleTicks = computed(() => {
  const has = new Set(props.years);
  const ticks: { year: number; angle: number; hasWorld: boolean }[] = [];
  for (let y = Math.floor(displayYear.value) - 40; y <= Math.ceil(displayYear.value) + 40; y++) {
    const a = angleOf(y);
    if (a < START_ANGLE - 2 || a > END_ANGLE + 2) continue;
    ticks.push({ year: y, angle: a, hasWorld: has.has(y) });
  }
  return ticks;
});

const arcD = computed(() => {
  const a = pt(START_ANGLE, R);
  const b = pt(END_ANGLE, R);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
});
const segmentD = computed(() => `${arcD.value} Z`);
</script>

<template>
  <div class="sticky top-20 flex h-[calc(100vh-5rem)] select-none items-stretch" @wheel.prevent="onWheel">
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-full w-full" preserveAspectRatio="xMinYMid meet">

      <path :d="segmentD" fill="var(--fi-panel)" stroke="none" opacity="0.6" />

      <path :d="arcD" fill="none" stroke="var(--fi-blue-dim)" stroke-width="1.5" />

      <g v-for="t in visibleTicks" :key="t.year">
        <line
          :x1="pt(t.angle, R - 30).x" :y1="pt(t.angle, R - 30).y"
          :x2="pt(t.angle, R - (t.hasWorld ? 6 : 18)).x" :y2="pt(t.angle, R - (t.hasWorld ? 6 : 18)).y"
          :stroke="t.hasWorld ? 'var(--fi-warm)' : 'var(--fi-line)'"
          :stroke-width="t.hasWorld ? 3 : 1"
        />
      </g>

      <polygon
        :points="`${pt(POINTER_ANGLE, R - 4).x},${pt(POINTER_ANGLE, R - 4).y} ${pt(POINTER_ANGLE, 22).x},${pt(POINTER_ANGLE, 22).y - 4.5} ${pt(POINTER_ANGLE, 22).x},${pt(POINTER_ANGLE, 22).y + 4.5}`"
        fill="var(--fi-warm)"
      />
    </svg>

    <div class="pointer-events-none absolute left-[74%] top-1/2 -translate-y-1/2">
      <div class="flex items-baseline gap-1">
        <span class="mono text-3xl font-semibold text-[var(--fi-text)]">{{ modelValue }}</span>
        <span class="mono text-sm text-[var(--fi-muted)]">年</span>
      </div>
    </div>
  </div>
</template>

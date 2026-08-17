<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  /** 有文章的年份（暖色粗刻度） */
  years: number[];
  /** 当前选中年份（吸附完成后回传） */
  modelValue: number;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

// ===== 几何：圆心在屏幕左外侧，1点/5点贴左边缘，3点在弧最右端 =====
const R = 220;
const CX = -R * 0.5;
const CY = R * 0.866;
const W = R * 0.5 + 20;
const H = R * 1.732;
const START_ANGLE = 30; // 1 点
const END_ANGLE = 150; // 5 点
const POINTER_ANGLE = 90; // 3 点
const ANGLE_PER_YEAR = 6;

// ===== 惯性滑动 + 刻度吸附 =====
const displayYear = ref(props.modelValue); // 浮点年份，驱动刻度连续移动
const velocity = ref(0); // 年份/帧
let rafId: number | null = null;

// 外部传入的年份变化（如文章加载后初始化）同步到 displayYear
watch(
  () => props.modelValue,
  (v) => {
    if (rafId === null && Math.abs(displayYear.value - v) > 0.01) {
      displayYear.value = v;
    }
  },
);

function onWheel(e: WheelEvent): void {
  // 滚轮一格 ≈ 0.55 年份速度；向上滚=去未来(+)，向下滚=回过去(-)
  velocity.value += -e.deltaY * 0.0055;
  if (rafId === null) rafId = requestAnimationFrame(step);
}

function step(): void {
  displayYear.value += velocity.value;
  velocity.value *= 0.93; // 阻尼：逐渐减慢

  if (Math.abs(velocity.value) < 0.004) {
    // 吸附到最近的整数年份（刻度吸引力）
    const target = Math.round(displayYear.value);
    const diff = target - displayYear.value;
    if (Math.abs(diff) < 0.02) {
      displayYear.value = target;
      velocity.value = 0;
      rafId = null;
      emit('update:modelValue', target);
      return;
    }
    displayYear.value += diff * 0.22; // 缓动吸附
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
      <!-- 弓形盘面（淡） -->
      <path :d="segmentD" fill="var(--fi-panel)" stroke="none" opacity="0.6" />
      <!-- 1~5 点弧描边 -->
      <path :d="arcD" fill="none" stroke="var(--fi-blue-dim)" stroke-width="1.5" />
      <!-- 刻度：有文章=暖色粗线，无文章=灰色细线 -->
      <g v-for="t in visibleTicks" :key="t.year">
        <line
          :x1="pt(t.angle, R - 30).x" :y1="pt(t.angle, R - 30).y"
          :x2="pt(t.angle, R - (t.hasWorld ? 6 : 18)).x" :y2="pt(t.angle, R - (t.hasWorld ? 6 : 18)).y"
          :stroke="t.hasWorld ? 'var(--fi-warm)' : 'var(--fi-line)'"
          :stroke-width="t.hasWorld ? 3 : 1"
        />
      </g>
      <!-- 针形指针 -->
      <polygon
        :points="`${pt(POINTER_ANGLE, R - 4).x},${pt(POINTER_ANGLE, R - 4).y} ${pt(POINTER_ANGLE, 22).x},${pt(POINTER_ANGLE, 22).y - 4.5} ${pt(POINTER_ANGLE, 22).x},${pt(POINTER_ANGLE, 22).y + 4.5}`"
        fill="var(--fi-warm)"
      />
    </svg>
    <!-- 当前年份：表盘外，正对指针 -->
    <div class="pointer-events-none absolute left-[74%] top-1/2 -translate-y-1/2">
      <div class="flex items-baseline gap-1">
        <span class="mono text-3xl font-semibold text-[var(--fi-text)]">{{ modelValue }}</span>
        <span class="mono text-sm text-[var(--fi-muted)]">年</span>
      </div>
    </div>
  </div>
</template>

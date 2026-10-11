<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let raf = 0;
let ctx: CanvasRenderingContext2D | null = null;
let w = 0;
let h = 0;

type P = { x: number; y: number; s: number; vy: number; vx: number; a: number; tw: number; hue: string };
const parts: P[] = [];

function resize(): void {
  w = window.innerWidth;
  h = window.innerHeight;
  if (canvas.value) {
    canvas.value.width = w;
    canvas.value.height = h;
  }
}

function make(n: number): void {
  for (let i = 0; i < n; i++) {
    const roll = Math.random();
    parts.push({
      x: Math.random() * w,
      y: Math.random() * h,
      s: 1 + Math.random() * 2.5,
      vy: 0.1 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.2,
      a: 0.2 + Math.random() * 0.6,
      tw: Math.random() * Math.PI * 2,
      hue: roll < 0.72 ? 'violet' : roll < 0.95 ? 'blue' : 'warm',
    });
  }
}

function frame(): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  for (const p of parts) {
    p.y -= p.vy;
    p.x += p.vx;
    p.tw += 0.03;
    if (p.y < -8) {
      p.y = h + 8;
      p.x = Math.random() * w;
    }
    const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
    const color = p.hue === 'violet' ? '183,140,255' : p.hue === 'blue' ? '121,184,255' : '247,211,138';
    ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  raf = requestAnimationFrame(frame);
}

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null;
  resize();
  make(Math.max(40, Math.min(80, Math.floor((w * h) / 22000))));
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', resize);
});
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none fixed inset-0 z-0"></canvas>
</template>

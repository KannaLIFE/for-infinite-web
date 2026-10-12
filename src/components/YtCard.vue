<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { loadYt } from '../lib/yt';

const props = defineProps<{ videoId: string; name: string }>();

const holder = ref<HTMLElement | null>(null);
const playing = ref(false);
const muted = ref(true);
let player: {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
} | null = null;

const thumb = computed(() => `https://i.ytimg.com/vi/${props.videoId}/hqdefault.jpg`);

async function start(): Promise<void> {
  playing.value = true;
  if (!player) {
    const YT = (await loadYt()) as {
      Player: new (el: HTMLElement | null, opts: Record<string, unknown>) => typeof player;
    };
    player = YT.Player ? new YT.Player(holder.value, {
      videoId: props.videoId,
      playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, playsinline: 1 },
      events: { onReady: () => player && player.playVideo() },
    }) : null;
  } else {
    player.playVideo();
  }
}

function stop(): void {
  playing.value = false;
  if (player) player.pauseVideo();
}

function toggleMute(): void {
  if (!player) return;
  muted.value = !muted.value;
  if (muted.value) {
    player.mute();
  } else {
    player.unMute();
    player.playVideo();
  }
}

function open(): void {
  window.open(`https://www.youtube.com/watch?v=${props.videoId}`, '_blank', 'noopener');
}

onBeforeUnmount(() => {
  if (player) player.destroy();
});
</script>

<template>
  <div
    class="group relative cursor-pointer overflow-hidden border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] transition hover:border-[var(--fi-blue)]"
    @mouseenter="start"
    @mouseleave="stop"
    @click="open"
  >
    <img
      v-show="!playing"
      :src="thumb"
      :alt="name"
      class="aspect-video w-full object-cover"
      loading="lazy"
    />
    <div v-show="playing" ref="holder" class="aspect-video w-full"></div>
    <button
      v-show="playing"
      class="mono absolute right-1 top-1 border border-[var(--fi-line-solid)] bg-[var(--fi-bg)]/85 px-1 py-0.5 text-[10px] leading-none text-[var(--fi-text)] hover:text-[var(--fi-blue)]"
      :aria-label="muted ? '取消静音' : '静音'"
      @click.stop="toggleMute"
    >{{ muted ? '🔇' : '🔊' }}</button>
    <span
      class="mono absolute inset-x-0 bottom-0 truncate bg-[var(--fi-bg)]/80 px-1.5 py-0.5 text-[9px] text-[var(--fi-muted)]"
    >{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{ userId: string }>();

type DiscStatus = 'loading' | 'online' | 'idle' | 'dnd' | 'offline' | 'none';
const status = ref<DiscStatus>('loading');
const activity = ref('');
const state = ref('');
const custom = ref('');
const spotify = ref('');
const spotifyArtist = ref('');

const dot: Record<DiscStatus, string> = {
  loading: 'var(--fi-muted)',
  online: 'var(--fi-blue)',
  idle: '#f5c542',
  dnd: '#ff6b6b',
  offline: 'var(--fi-muted)',
  none: 'var(--fi-muted)',
};
const label: Record<DiscStatus, string> = {
  loading: '检测中',
  online: '在线',
  idle: '离开',
  dnd: '勿扰',
  offline: '离线',
  none: '未检测到',
};

let timer: ReturnType<typeof setInterval> | null = null;

async function poll(): Promise<void> {
  try {
    const r = await fetch(`https://api.lanyard.rest/v1/users/${props.userId}`, { cache: 'no-store' });
    const j = await r.json();
    if (!j.success || !j.data) {
      status.value = 'none';
      return;
    }
    const d = j.data;
    status.value = (['online', 'idle', 'dnd', 'offline'] as const).includes(d.discord_status)
      ? d.discord_status
      : 'offline';
    const acts: { type?: number; name?: string; state?: string }[] = d.activities || [];
    const act = acts.find((a) => a.type !== 4 && a.type !== 2);
    if (act) {
      activity.value = act.name || '';
      state.value = act.state || '';
    } else {
      activity.value = '';
      state.value = '';
    }
    const cus = acts.find((a) => a.type === 4);
    custom.value = cus && (cus.state || cus.name) ? cus.state || cus.name || '' : '';
    if (d.spotify) {
      spotify.value = d.spotify.song || '';
      spotifyArtist.value = d.spotify.artist ? d.spotify.artist.replace(/; /g, ', ') : '';
    } else {
      spotify.value = '';
      spotifyArtist.value = '';
    }
  } catch {
    status.value = 'none';
  }
}

onMounted(() => {
  poll();
  timer = setInterval(poll, 60000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="mt-2 space-y-1.5">
    <p class="mono flex items-center gap-1.5 text-xs">
      <span
        class="inline-block h-2 w-2"
        :class="status === 'loading' ? 'animate-pulse' : ''"
        :style="{ background: dot[status] }"
      ></span>
      <span class="text-[var(--fi-text)]">{{ label[status] }}</span>
    </p>
    <p v-if="spotify" class="mono truncate text-[10px] text-[var(--fi-muted)]">
      🎧 {{ spotify }}<template v-if="spotifyArtist"> · {{ spotifyArtist }}</template>
    </p>
    <p v-if="activity" class="mono truncate text-[10px] text-[var(--fi-muted)]">
      {{ activity }}<template v-if="state"> · {{ state }}</template>
    </p>
    <p v-if="custom" class="mono truncate text-[10px] text-[var(--fi-muted)]">
      “{{ custom }}”
    </p>
    <p v-if="status === 'none'" class="text-[10px] text-[var(--fi-muted)]">
      需要先加入 Lanyard 服务器：discord.com/invite/lanyard
    </p>
  </div>
</template>

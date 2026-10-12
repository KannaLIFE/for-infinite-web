<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{ userId: string }>();

type DiscStatus = 'loading' | 'online' | 'idle' | 'dnd' | 'offline' | 'none';
const status = ref<DiscStatus>('loading');
const activity = ref('');
const state = ref('');

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

onMounted(async () => {
  try {
    const r = await fetch(`https://api.lanyard.rest/v1/users/${props.userId}`);
    const j = await r.json();
    if (!j.success || !j.data) {
      status.value = 'none';
      return;
    }
    const d = j.data;
    status.value = (['online', 'idle', 'dnd', 'offline'] as const).includes(d.discord_status)
      ? d.discord_status
      : 'offline';
    const act = (d.activities || []).find((a: { type?: number }) => a.type !== 4);
    if (act) {
      activity.value = act.name || '';
      state.value = act.state || '';
    }
  } catch {
    status.value = 'none';
  }
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
    <p v-if="activity" class="mono truncate text-[10px] text-[var(--fi-muted)]">
      {{ activity }}<template v-if="state"> · {{ state }}</template>
    </p>
    <p v-if="status === 'none'" class="text-[10px] text-[var(--fi-muted)]">
      需要先加入 Lanyard 服务器：discord.com/invite/lanyard
    </p>
  </div>
</template>

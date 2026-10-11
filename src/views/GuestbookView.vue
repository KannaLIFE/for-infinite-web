<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';

interface Entry {
  id: number;
  name: string;
  text: string;
  createdAt: number;
}

const entries = ref<Entry[]>([]);
const name = ref('');
const text = ref('');
const busy = ref(false);
const error = ref('');
const offline = ref(false);

async function load(): Promise<void> {
  try {
    const r = await api.get<{ items: Entry[] }>('/api/guestbook');
    entries.value = r.items;
    offline.value = false;
  } catch {
    offline.value = true;
  }
}

async function submit(): Promise<void> {
  const n = name.value.trim();
  const t = text.value.trim();
  if (!n || !t || busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await api.post('/api/guestbook', { name: n, text: t });
    name.value = '';
    text.value = '';
    await load();
  } catch (err) {
    error.value = (err as { message?: string }).message === 'too many requests, try later'
      ? '发得太快了，歇一会儿再来。'
      : '信号中断，留言失败。';
  } finally {
    busy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">留言板 · 星声</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-warm)]">/guestbook</span>
    </header>

    <div v-if="offline" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
      星联离线——留言板要等观测站后端上线后才能使用。
    </div>

    <template v-else>
      <form class="fi-px-panel space-y-3 bg-[var(--fi-panel)] p-5" @submit.prevent="submit">
        <input
          v-model="name"
          maxlength="32"
          class="mono fi-px-panel w-full max-w-56 bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
          placeholder="你的名字"
        />
        <textarea
          v-model="text"
          maxlength="500"
          rows="3"
          class="fi-px-panel w-full bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
          placeholder="留下一点声音……"
        ></textarea>
        <div class="flex items-center gap-3">
          <button type="submit" class="mono fi-px-btn px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" :disabled="busy">
            {{ busy ? '发送中…' : '投递 ▸' }}
          </button>
          <p v-if="error" class="mono text-xs text-[#ff8a8a]">{{ error }}</p>
        </div>
      </form>

      <div v-if="!entries.length" class="mono fi-px-panel bg-[var(--fi-panel)] p-8 text-center text-sm text-[var(--fi-muted)]">
        还没有声音，留下第一条吧。
      </div>

      <div v-else class="fi-stagger space-y-3">
        <article v-for="e in entries" :key="e.id" class="fi-px-panel bg-[var(--fi-panel)] p-4">
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="mono text-sm text-[var(--fi-blue)]">{{ e.name }}</h2>
            <time class="mono text-[10px] text-[var(--fi-muted)]">{{ new Date(e.createdAt).toLocaleString() }}</time>
          </div>
          <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--fi-text)]">{{ e.text }}</p>
        </article>
      </div>
    </template>
  </div>
</template>

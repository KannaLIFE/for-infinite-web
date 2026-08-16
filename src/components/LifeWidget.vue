<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { api } from '../lib/api';
import { getVisitorId } from '../lib/visitor';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const open = ref(false);
const messages = ref<ChatMsg[]>([]);
const input = ref('');
const busy = ref(false);
const listEl = ref<HTMLElement | null>(null);

async function scrollBottom(): Promise<void> {
  await nextTick();
  if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight;
}

async function openChat(): Promise<void> {
  open.value = !open.value;
  if (open.value && messages.value.length === 0) {
    // 首次打开，请求 LIFE 的欢迎语（基于访客记忆）
    try {
      const r = await api.post<{ reply: string }>('/api/life/hello', {
        visitorId: getVisitorId(),
      });
      messages.value.push({ role: 'assistant', content: r.reply });
      await scrollBottom();
    } catch {
      messages.value.push({ role: 'assistant', content: '（信号有些微弱……）' });
    }
  }
}

async function send(): Promise<void> {
  const text = input.value.trim();
  if (!text || busy.value) return;
  input.value = '';
  messages.value.push({ role: 'user', content: text });
  await scrollBottom();
  busy.value = true;
  try {
    const r = await api.post<{ reply: string }>('/api/life/chat', {
      visitorId: getVisitorId(),
      message: text,
    });
    messages.value.push({ role: 'assistant', content: r.reply });
  } catch {
    messages.value.push({ role: 'assistant', content: '（信号有些微弱……）' });
  } finally {
    busy.value = false;
    await scrollBottom();
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
    <!-- 聊天窗 -->
    <transition name="pop">
      <div
        v-if="open"
        class="mb-3 flex w-80 flex-col overflow-hidden rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] shadow-2xl"
      >
        <div
          class="flex items-center gap-2 border-b border-[var(--fi-line)] px-4 py-3"
        >
          <span
            class="inline-block h-2 w-2 rounded-full"
            style="background: var(--fi-warm); box-shadow: 0 0 6px var(--fi-warm)"
          ></span>
          <span class="mono text-sm text-[var(--fi-text)]">LIFE</span>
          <span class="mono ml-auto text-[10px] text-[var(--fi-muted)]">壳里的暖光</span>
        </div>

        <div ref="listEl" class="h-72 space-y-2 overflow-y-auto px-4 py-3">
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed"
              :class="
                m.role === 'user'
                  ? 'bg-[var(--fi-blue-dim)] text-[var(--fi-text)]'
                  : 'bg-[var(--fi-panel-2)] text-[var(--fi-text)]'
              "
            >
              {{ m.content }}
            </div>
          </div>
          <div v-if="busy" class="text-xs text-[var(--fi-muted)]">…</div>
        </div>

        <div class="flex items-center gap-2 border-t border-[var(--fi-line)] p-2">
          <input
            v-model="input"
            class="min-w-0 flex-1 rounded-md bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)]"
            placeholder="说点什么……"
            @keyup.enter="send"
          />
          <button
            class="rounded-md px-3 py-2 text-sm"
            style="background: var(--fi-warm); color: #1a1208"
            @click="send"
          >
            发送
          </button>
        </div>
      </div>
    </transition>

    <!-- 小人：光核光点 -->
    <button
      class="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[var(--fi-line)] bg-[var(--fi-panel)] transition hover:border-[var(--fi-warm)]"
      @click="openChat"
    >
      <span
        class="fi-breathe absolute inset-0 rounded-full"
        style="background: radial-gradient(circle, rgba(240,179,90,0.25), transparent 65%)"
      ></span>
      <svg viewBox="0 0 24 24" class="relative h-7 w-7" fill="none">
        <circle cx="12" cy="12" r="4.5" fill="var(--fi-warm)" />
        <circle cx="12" cy="12" r="9" stroke="var(--fi-warm)" stroke-opacity="0.35" stroke-width="1" />
        <circle cx="12" cy="12" r="11" stroke="var(--fi-warm)" stroke-opacity="0.15" stroke-width="0.5" />
      </svg>
    </button>
  </div>
</template>

<style>
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>

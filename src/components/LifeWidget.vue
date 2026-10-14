<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { api } from '../lib/api';
import { getVisitorId } from '../lib/visitor';
import { t } from '../lib/i18n';

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
    try {
      const r = await api.post<{ reply: string }>('/api/life/hello', {
        visitorId: getVisitorId(),
      });
      messages.value.push({ role: 'assistant', content: r.reply });
      await scrollBottom();
    } catch {
      messages.value.push({ role: 'assistant', content: t('widgets.lifeSignal') });
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
    messages.value.push({ role: 'assistant', content: t('widgets.lifeSignal') });
  } finally {
    busy.value = false;
    await scrollBottom();
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
    <transition name="pop">
      <div
        v-if="open"
        class="fi-px-panel mb-3 flex w-80 flex-col overflow-hidden bg-[var(--fi-panel)]"
      >
        <div
          class="flex items-center gap-2 border-b-2 border-[var(--fi-line-solid)] px-4 py-3"
        >
          <span
            class="inline-block h-2 w-2"
            style="background: var(--fi-warm); box-shadow: 0 0 6px var(--fi-warm)"
          ></span>
          <span class="mono text-sm text-[var(--fi-text)]">LIFE</span>
          <span class="mono ml-auto text-[10px] text-[var(--fi-muted)]">{{ t('widgets.lifeTitle') }}</span>
        </div>

        <div ref="listEl" class="h-72 space-y-2 overflow-y-auto px-4 py-3">
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] whitespace-pre-wrap border-2 px-3 py-2 text-sm leading-relaxed"
              :class="
                m.role === 'user'
                  ? 'border-[var(--fi-blue-dim)] bg-[var(--fi-blue-dim)]/40 text-[var(--fi-text)]'
                  : 'border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] text-[var(--fi-text)]'
              "
            >
              {{ m.content }}
            </div>
          </div>
          <div v-if="busy" class="mono text-xs text-[var(--fi-muted)]">…</div>
        </div>

        <div class="flex items-center gap-2 border-t-2 border-[var(--fi-line-solid)] p-2">
          <input
            v-model="input"
            class="mono fi-px-panel min-w-0 flex-1 bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
            :placeholder="t('widgets.lifePlaceholder')"
            @keyup.enter="send"
          />
          <button
            class="mono fi-px-btn px-3 py-2 text-sm"
            style="background: var(--fi-warm); color: #1a1208"
            @click="send"
          >
            {{ t('common.send') }}
          </button>
        </div>
      </div>
    </transition>

    <button
      class="fi-px-btn relative flex h-14 w-14 items-center justify-center bg-[var(--fi-panel)] hover:border-[var(--fi-warm)]"
      @click="openChat"
    >
      <span
        class="fi-breathe absolute inset-1"
        style="background: radial-gradient(circle, rgba(247,211,138,0.3), transparent 65%)"
      ></span>
      <span
        class="relative inline-block h-4 w-4"
        style="background: var(--fi-warm); box-shadow: 0 0 12px var(--fi-warm)"
      ></span>
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

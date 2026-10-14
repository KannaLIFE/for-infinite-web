<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { api, mediaUrl } from '../lib/api';
import { getToken, setToken } from '../lib/auth';
import { useBackendHealth } from '../lib/backend';
import { t } from '../lib/i18n';
import type { StoredMessage } from '../types';

type Page = 'filtered' | 'unfiltered';

const page = ref<Page>('filtered');
const messages = ref<StoredMessage[]>([]);
const unlocked = ref(false);
const keyInput = ref('');
const unlockError = ref('');

const { backend, start } = useBackendHealth();

const scroller = ref<HTMLElement | null>(null);
const nearBottom = ref(true);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const active = ref<StoredMessage | null>(null);
const replyText = ref('');

const token = () => getToken() || undefined;

async function unlock(): Promise<void> {
  unlockError.value = '';
  try {
    const r = await api.post<{ ok: boolean; token?: string }>('/api/auth/unlock', {
      key: keyInput.value.trim(),
    });
    if (r.ok && r.token) {
      setToken(r.token);
      unlocked.value = true;
      keyInput.value = '';
      await load(true);
    } else {
      unlockError.value = t('common.keyInvalid');
    }
  } catch {
    unlockError.value = t('common.unlockFailed');
  }
}

async function load(reset = false): Promise<void> {
  if (!unlocked.value) return;
  try {
    const r = await api.get<{ items: StoredMessage[] }>(
      `/api/messages/${page.value}`,
      token(),
    );

    const map = new Map<string, StoredMessage>();
    for (const m of messages.value) map.set(m.id, m);
    for (const m of r.items) map.set(m.id, m);
    messages.value = [...map.values()].sort((a, b) => a.timestamp - b.timestamp);

    await scrollToBottom(reset);
  } catch (err) {
    if ((err as { status?: number }).status === 401) unlocked.value = false;
  }
}

async function loadOlder(): Promise<void> {
  const oldest = messages.value[0]?.timestamp;
  if (!oldest || !unlocked.value) return;
  const r = await api.get<{ items: StoredMessage[] }>(
    `/api/messages/${page.value}?before=${oldest}`,
    token(),
  );
  const ids = new Set(messages.value.map((m) => m.id));
  const older = r.items.filter((m) => !ids.has(m.id));
  if (older.length) {
    messages.value = [...older, ...messages.value].sort((a, b) => a.timestamp - b.timestamp);
  }
}

async function scrollToBottom(force = false): Promise<void> {
  await nextTick();
  const el = scroller.value;
  if (!el) return;
  if (force || nearBottom.value) el.scrollTop = el.scrollHeight;
}

function onScroll(): void {
  const el = scroller.value;
  if (!el) return;
  nearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  if (el.scrollTop < 80) void loadOlder();
}

const colorCache = new Map<string, string>();
function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}
function hueOf(m: StoredMessage): number {
  return m.source === 'group'
    ? 180 + (hashHue(m.conversationId) % 90)
    : 20 + (hashHue(m.conversationId) % 50);
}
function convColor(m: StoredMessage): string {
  const key = m.conversationId;
  const cached = colorCache.get(key);
  if (cached) return cached;
  const c = `hsl(${hueOf(m)}, 70%, 72%)`;
  colorCache.set(key, c);
  return c;
}
function convBorder(m: StoredMessage): string {
  return `hsl(${hueOf(m)}, 55%, 42%)`;
}

function title(m: StoredMessage): string {
  return m.source === 'group'
    ? `${m.conversationName} · ${m.senderName}`
    : m.senderName;
}

async function toggleMode(m: StoredMessage): Promise<void> {
  const newMode = m.filter.mode === 'whitelist' ? 'blacklist' : 'whitelist';
  await api.post('/api/admin/config', { accountId: m.accountId, mode: newMode }, token());
  await load();
}

async function addToList(m: StoredMessage): Promise<void> {
  const isGroup = m.source === 'group';
  const mode = m.filter.mode === 'whitelist' ? 'whitelist' : 'blacklist';
  const body: Record<string, string> = { accountId: m.accountId };
  if (isGroup) body[mode === 'whitelist' ? 'addGroupWhite' : 'addGroupBlack'] = m.conversationId;
  else body[mode === 'whitelist' ? 'addUserWhite' : 'addUserBlack'] = m.senderId;
  await api.post('/api/admin/config', body, token());
  await load();
}

async function sendReply(): Promise<void> {
  if (!active.value || !replyText.value.trim()) return;
  await api.post(
    '/api/messages/reply',
    { accountId: active.value.accountId, targetId: active.value.conversationId, text: replyText.value.trim() },
    token(),
  );
  replyText.value = '';
  active.value = null;
}

watch(page, () => {
  messages.value = [];
  void load(true);
});

onMounted(async () => {
  start();
  if (getToken()) {
    unlocked.value = true;
    await load(true);
  }
  pollTimer = setInterval(() => {
    if (unlocked.value && backend.value === 'up') void load();
  }, 4000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <div v-if="backend === 'checking'" class="fi-px-panel bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">{{ t('common.backendChecking') }}</p>
    </div>

    <div v-else-if="backend === 'down'" class="fi-px-panel bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">{{ t('common.backendDown') }}</p>
    </div>

    <template v-else>
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">{{ t('messages.title') }}</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px] text-[var(--fi-warm)]">/aetherlink</span>
    </header>

    <div v-if="!unlocked" class="fi-px-panel bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">{{ t('messages.locked') }}</p>
      <div class="mt-4 flex gap-2">
        <input
          v-model="keyInput"
          type="password"
          class="mono fi-px-panel min-w-0 flex-1 bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none placeholder:text-[var(--fi-muted)] focus:border-[var(--fi-blue)]"
          :placeholder="t('common.keyPlaceholder')"
          @keyup.enter="unlock"
        />
        <button
          class="mono fi-px-btn px-4 py-2 text-sm"
          style="background: var(--fi-warm); color: #1a1208"
          @click="unlock"
        >
          {{ t('common.unlock') }}
        </button>
      </div>
      <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
    </div>

    <template v-else>
      <div class="fi-px-panel flex w-fit gap-1 bg-[var(--fi-panel)] p-1">
        <button
          class="mono border-2 px-4 py-1.5 text-xs transition"
          :class="
            page === 'filtered'
              ? 'border-[var(--fi-warm)] bg-[var(--fi-warm)]/10 text-[var(--fi-warm)]'
              : 'border-transparent text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
          @click="page = 'filtered'"
        >
          {{ t('messages.filtered') }}
        </button>        <button
          class="mono border-2 px-4 py-1.5 text-xs transition"
          :class="
            page === 'unfiltered'
              ? 'border-[var(--fi-warm)] bg-[var(--fi-warm)]/10 text-[var(--fi-warm)]'
              : 'border-transparent text-[var(--fi-muted)] hover:text-[var(--fi-text)]'
          "
          @click="page = 'unfiltered'"
        >
          {{ t('messages.unfiltered') }}
        </button>
      </div>

      <div
        ref="scroller"
        class="fi-px-panel h-[60vh] space-y-1.5 overflow-y-auto bg-[var(--fi-bg-2)]/70 p-3"
        @scroll="onScroll"
      >
        <div v-if="!messages.length" class="mono p-4 text-sm text-[var(--fi-muted)]">{{ t('messages.empty') }}</div>

        <button
          v-for="m in messages"
          :key="m.id"
          class="block w-full border-l-2 py-2 pl-3 pr-2 text-left transition hover:bg-[var(--fi-panel-2)]"
          :style="{ borderLeftColor: convBorder(m) }"
          @click="active = m"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="mono truncate text-xs" :style="{ color: convColor(m) }">
              &lt;{{ title(m) }}&gt;
            </span>
            <span class="mono shrink-0 text-[10px] text-[var(--fi-muted)]">
              {{ m.source === 'group' ? t('messages.group') : t('messages.dm') }} · {{ new Date(m.timestamp).toLocaleString() }}
            </span>
          </div>
          <p class="mt-0.5 truncate text-sm text-[var(--fi-text)]">{{ m.content }}</p>

          <div v-if="page === 'unfiltered'" class="mono mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <span class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-1.5 py-0.5 text-[var(--fi-muted)]">
              {{ t('messages.mode') }}{{ m.filter.mode === 'whitelist' ? t('messages.modeWhite') : m.filter.mode === 'blacklist' ? t('messages.modeBlack') : t('messages.modeNone') }}
            </span>
            <span class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-1.5 py-0.5 text-[var(--fi-muted)]">
              {{ t('messages.groupCheck') }}{{ m.filter.groupCheck }}
            </span>
            <span class="border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-1.5 py-0.5 text-[var(--fi-muted)]">
              {{ t('messages.userCheck') }}{{ m.filter.userCheck }}
            </span>
            <span
              class="border px-1.5 py-0.5"
              :style="
                m.filter.final === 'pass'
                  ? 'border-color:rgba(247,211,138,0.5);color:var(--fi-warm)'
                  : 'border-color:rgba(255,90,90,0.5);color:#ff7a7a'
              "
            >
              {{ t('messages.final') }}{{ m.filter.final === 'pass' ? t('messages.pass') : t('messages.block') }}
            </span>
          </div>

          <div v-if="m.mediaPaths.length" class="mt-2 flex flex-wrap gap-2">
            <img
              v-for="p in m.mediaPaths"
              :key="p"
              :src="mediaUrl(p)"
              class="h-16 w-16 border-2 border-[var(--fi-line-solid)] object-cover"
            />
          </div>
        </button>
      </div>
    </template>
    </template>

    <div
      v-if="active"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      @click.self="active = null"
    >
      <div class="fi-px-panel w-full max-w-md bg-[var(--fi-panel)] p-6">
        <h3 class="mono text-base text-[var(--fi-text)]">&lt;{{ title(active) }}&gt;</h3>
        <p class="mono mt-1 text-xs text-[var(--fi-muted)]">
          {{ t('messages.accountLine', { id: active.accountId }) }}{{ active.source === 'group' ? t('messages.groupChat') : t('messages.dmChat') }}
        </p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="mono text-xs text-[var(--fi-muted)]">{{ t('messages.replyLabel') }}</label>
            <div class="mt-1 flex gap-2">
              <input
                v-model="replyText"
                class="mono fi-px-panel min-w-0 flex-1 bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
                :placeholder="t('messages.replyPlaceholder')"
              />
              <button
                class="mono fi-px-btn px-3 py-2 text-sm"
                style="background: var(--fi-blue); color: #04101f"
                @click="sendReply"
              >
                {{ t('common.send') }}
              </button>
            </div>
          </div>

          <button
            class="mono fi-px-btn w-full bg-[var(--fi-panel-2)] px-3 py-2 text-xs text-[var(--fi-text)]"
            @click="toggleMode(active)"
          >
            {{ t('messages.modeToggle', { mode: active.filter.mode === 'whitelist' ? t('messages.modeWhiteFull') : t('messages.modeBlackFull') }) }}
          </button>

          <button
            class="mono fi-px-btn w-full bg-[var(--fi-panel-2)] px-3 py-2 text-xs text-[var(--fi-text)]"
            @click="addToList(active)"
          >
            {{ t('messages.addTarget', { target: active.source === 'group' ? t('messages.thisGroup') : t('messages.thisUser'), list: active.filter.mode === 'whitelist' ? t('messages.modeWhiteFull') : t('messages.modeBlackFull') }) }}
          </button>
        </div>

        <button class="mono mt-4 text-xs text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="active = null">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

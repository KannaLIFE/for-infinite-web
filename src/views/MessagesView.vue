<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { api, mediaUrl } from '../lib/api';
import { getToken, setToken } from '../lib/auth';
import type { StoredMessage } from '../types';

type Page = 'filtered' | 'unfiltered';

const page = ref<Page>('filtered');
const messages = ref<StoredMessage[]>([]);
const unlocked = ref(false);
const keyInput = ref('');
const unlockError = ref('');

const scroller = ref<HTMLElement | null>(null);
const nearBottom = ref(true);
let pollTimer: ReturnType<typeof setInterval> | null = null;

// 详情面板
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
      unlockError.value = '钥匙无效';
    }
  } catch {
    unlockError.value = '解锁失败';
  }
}

async function load(reset = false): Promise<void> {
  if (!unlocked.value) return;
  try {
    const r = await api.get<{ items: StoredMessage[] }>(
      `/api/messages/${page.value}`,
      token(),
    );
    // 合并去重，按时间正序（新在下）
    const map = new Map<string, StoredMessage>();
    for (const m of messages.value) map.set(m.id, m);
    for (const m of r.items) map.set(m.id, m);
    messages.value = [...map.values()].sort((a, b) => a.timestamp - b.timestamp);
    if (reset) await scrollToBottom(true);
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

// ---- 颜色：同会话同色，群聊冷色、私聊暖色 ----
const colorCache = new Map<string, string>();
function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}
function convColor(m: StoredMessage): string {
  const key = m.conversationId;
  const cached = colorCache.get(key);
  if (cached) return cached;
  const hue = m.source === 'group'
    ? 180 + (hashHue(key) % 90) // 冷色 180-270
    : 20 + (hashHue(key) % 50);  // 暖色 20-70
  const c = `hsl(${hue}, 45%, 30%)`;
  colorCache.set(key, c);
  return c;
}
function convBorder(m: StoredMessage): string {
  const key = m.conversationId;
  const hue = m.source === 'group' ? 180 + (hashHue(key) % 90) : 20 + (hashHue(key) % 50);
  return `hsl(${hue}, 60%, 55%)`;
}

function title(m: StoredMessage): string {
  return m.source === 'group'
    ? `${m.conversationName} · ${m.senderName}`
    : m.senderName;
}

// ---- 面板操作 ----
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
  // 已有 token 则尝试直接进入
  if (getToken()) {
    unlocked.value = true;
    await load(true);
  }
  pollTimer = setInterval(() => void load(), 4000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">消息</h1>
      <p class="mono mt-1 text-xs text-[var(--fi-muted)]">Aetherlink · 跨星通讯</p>
    </header>

    <!-- 解锁 -->
    <div v-if="!unlocked" class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">消息链路已上锁，请输入钥匙。</p>
      <div class="mt-4 flex gap-2">
        <input
          v-model="keyInput"
          type="password"
          class="mono flex-1 rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
          placeholder="钥匙……"
          @keyup.enter="unlock"
        />
        <button class="rounded-lg px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlock">
          解锁
        </button>
      </div>
      <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
    </div>

    <template v-else>
      <!-- 页面切换 -->
      <div class="flex rounded-lg border border-[var(--fi-line)] p-1 md:w-80">
        <button
          class="flex-1 rounded-md py-2 text-sm"
          :class="page === 'filtered' ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'"
          @click="page = 'filtered'"
        >
          过滤后
        </button>
        <button
          class="flex-1 rounded-md py-2 text-sm"
          :class="page === 'unfiltered' ? 'bg-[var(--fi-panel-2)] text-[var(--fi-warm)]' : 'text-[var(--fi-muted)]'"
          @click="page = 'unfiltered'"
        >
          未过滤
        </button>
      </div>

      <!-- 消息流 -->
      <div
        ref="scroller"
        class="h-[60vh] space-y-3 overflow-y-auto rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-4"
        @scroll="onScroll"
      >
        <div v-if="!messages.length" class="mono text-sm text-[var(--fi-muted)]">暂无消息。</div>

        <button
          v-for="m in messages"
          :key="m.id"
          class="block w-full rounded-lg border-l-4 p-4 text-left transition hover:opacity-90"
          :style="{ background: convColor(m), borderLeftColor: convBorder(m) }"
          @click="active = m"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="truncate text-sm font-medium text-white/90">{{ title(m) }}</span>
            <span class="mono shrink-0 text-[10px] text-white/50">
              {{ m.source === 'group' ? '群' : '私' }} · {{ new Date(m.timestamp).toLocaleString() }}
            </span>
          </div>
          <p class="mt-1 truncate text-sm text-white/80">{{ m.content }}</p>

          <!-- 第2页额外：三检测 -->
          <div v-if="page === 'unfiltered'" class="mono mt-2 flex flex-wrap gap-2 text-[10px]">
            <span class="rounded bg-black/20 px-1.5 py-0.5">
              模式:{{ m.filter.mode === 'whitelist' ? '白' : m.filter.mode === 'blacklist' ? '黑' : '无' }}
            </span>
            <span class="rounded bg-black/20 px-1.5 py-0.5">群检测:{{ m.filter.groupCheck }}</span>
            <span class="rounded bg-black/20 px-1.5 py-0.5">用户检测:{{ m.filter.userCheck }}</span>
            <span
              class="rounded px-1.5 py-0.5"
              :style="m.filter.final === 'pass' ? 'background:rgba(240,179,90,0.3)' : 'background:rgba(255,80,80,0.3)'"
            >
              最终:{{ m.filter.final === 'pass' ? '通过' : '拦截' }}
            </span>
          </div>

          <!-- 图片缩略 -->
          <div v-if="m.mediaPaths.length" class="mt-2 flex flex-wrap gap-2">
            <img
              v-for="p in m.mediaPaths"
              :key="p"
              :src="mediaUrl(p)"
              class="h-16 w-16 rounded object-cover"
            />
          </div>
        </button>
      </div>
    </template>

    <!-- 消息面板 -->
    <div
      v-if="active"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      @click.self="active = null"
    >
      <div class="w-full max-w-md rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6">
        <h3 class="text-base font-medium text-[var(--fi-text)]">{{ title(active) }}</h3>
        <p class="mono mt-1 text-xs text-[var(--fi-muted)]">
          账号 {{ active.accountId }} · {{ active.source === 'group' ? '群聊' : '私聊' }}
        </p>

        <div class="mt-4 space-y-3">
          <!-- 回复 -->
          <div>
            <label class="mono text-xs text-[var(--fi-muted)]">回复（发回原会话）</label>
            <div class="mt-1 flex gap-2">
              <input
                v-model="replyText"
                class="min-w-0 flex-1 rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
                placeholder="回复内容……"
              />
              <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--fi-blue); color: #fff" @click="sendReply">
                发送
              </button>
            </div>
          </div>

          <!-- 模式切换 -->
          <button
            class="w-full rounded-lg border border-[var(--fi-line)] px-3 py-2 text-sm text-[var(--fi-text)] hover:border-[var(--fi-blue)]"
            @click="toggleMode(active)"
          >
            当前模式：{{ active.filter.mode === 'whitelist' ? '白名单' : '黑名单' }}（点击切换）
          </button>

          <!-- 加入名单 -->
          <button
            class="w-full rounded-lg border border-[var(--fi-line)] px-3 py-2 text-sm text-[var(--fi-text)] hover:border-[var(--fi-warm)]"
            @click="addToList(active)"
          >
            将{{ active.source === 'group' ? '该群' : '该用户' }}加入{{ active.filter.mode === 'whitelist' ? '白名单' : '黑名单' }}
          </button>
        </div>

        <button class="mono mt-4 text-xs text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="active = null">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

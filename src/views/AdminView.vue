<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../lib/api';
import { getToken, setToken } from '../lib/auth';
import type { AccountState } from '../types';

const unlocked = ref(false);
const keyInput = ref('');
const unlockError = ref('');

const accounts = ref<AccountState[]>([]);
const keys = ref<{ date: string; messageKey: string; articleKey: string; adminKey: string } | null>(null);
const disk = ref<{ messagesBytes: number; mediaBytes: number; totalUsedBytes: number; freeBytes: number } | null>(null);
const keepDays = ref(30);
const cleanupMsg = ref('');
const showKeys = ref(false);
const lastRefresh = ref('');

const token = () => getToken() || undefined;

async function refresh(): Promise<void> {
  await loadAll();
  lastRefresh.value = new Date().toLocaleTimeString();
}

function fmtBytes(n: number): string {
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

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
      await loadAll();
    } else {
      unlockError.value = '钥匙无效';
    }
  } catch {
    unlockError.value = '解锁失败';
  }
}

async function loadAll(): Promise<void> {
  try {
    const [a, d] = await Promise.all([
      api.get<{ accounts: AccountState[] }>('/api/admin/accounts', token()),
      api.get<typeof disk.value>('/api/admin/disk', token()),
    ]);
    accounts.value = a.accounts;
    disk.value = d;
  } catch (err) {
    if ((err as { status?: number }).status === 401) unlocked.value = false;
  }
}

async function loadKeys(): Promise<void> {
  const r = await api.get<{ keys: typeof keys.value }>('/api/admin/keys', token());
  keys.value = r.keys;
  showKeys.value = true;
}

async function toggleAccount(id: string): Promise<void> {
  await api.post(`/api/admin/account/${id}/toggle`, undefined, token());
  await loadAll();
}

async function cleanup(): Promise<void> {
  const r = await api.post<{ removed: number }>('/api/admin/cleanup', { keepDays: keepDays.value }, token());
  cleanupMsg.value = `已清理 ${r.removed} 条（保留最近 ${keepDays.value} 天）。`;
  await loadAll();
}

onMounted(async () => {
  if (getToken()) {
    unlocked.value = true;
    await loadAll();
  }
});
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">后台 · 调控</h1>
      <p class="mono mt-1 text-xs text-[var(--fi-muted)]">账号状态 · 名单 · 清理 · 钥匙</p>
    </header>

    <!-- 解锁 -->
    <div v-if="!unlocked" class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">后台需管理权限，请输入钥匙。</p>
      <div class="mt-4 flex gap-2">
        <input
          v-model="keyInput"
          type="password"
          class="mono flex-1 rounded-lg border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
          placeholder="管理钥匙……"
          @keyup.enter="unlock"
        />
        <button class="rounded-lg px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlock">
          进入
        </button>
      </div>
      <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
    </div>

    <template v-else>
      <!-- 账号状态 -->
      <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">账号状态</h2>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1 text-xs text-[var(--fi-text)] hover:border-[var(--fi-blue)]"
            @click="refresh"
          >
            ⟳ 刷新检测
          </button>
        </div>
        <p v-if="lastRefresh" class="mono mb-2 text-[10px] text-[var(--fi-muted)]">
          上次刷新：{{ lastRefresh }}
        </p>
        <div class="space-y-2">
          <div v-for="a in accounts" :key="a.id" class="flex items-center gap-3">
            <span
              class="inline-block h-2 w-2 rounded-full"
              :style="a.connected ? 'background:#4ade80' : 'background:#f87171'"
            ></span>
            <span class="mono text-sm text-[var(--fi-text)]">{{ a.id }}</span>
            <span class="mono text-xs text-[var(--fi-muted)]">
              {{ a.connected ? '在线' : '离线' }} · {{ a.mode === 'whitelist' ? '白名单' : '黑名单' }}
            </span>
            <button
              class="mono ml-auto rounded border border-[var(--fi-line)] px-2 py-1 text-xs text-[var(--fi-muted)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-text)]"
              @click="toggleAccount(a.id)"
            >
              {{ a.enabled ? '停用' : '启用' }}
            </button>
          </div>
          <p v-if="!accounts.length" class="mono text-xs text-[var(--fi-muted)]">尚无账号配置。</p>
        </div>
      </section>

      <!-- 钥匙 -->
      <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">今日钥匙</h2>
        <button
          class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[var(--fi-warm)]"
          @click="loadKeys"
        >
          显示 / 刷新
        </button>
        <div v-if="showKeys && keys" class="mono mt-3 space-y-1 text-sm">
          <p class="text-[var(--fi-muted)]">日期：{{ keys.date }}</p>
          <p>消息钥匙：<span class="text-[var(--fi-warm)]">{{ keys.messageKey }}</span></p>
          <p>文章钥匙：<span class="text-[var(--fi-warm)]">{{ keys.articleKey }}</span></p>
          <p>后台钥匙：<span class="text-[var(--fi-warm)]">{{ keys.adminKey }}</span></p>
        </div>
      </section>

      <!-- 清理 + 磁盘 -->
      <section class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">存储</h2>
        <div v-if="disk" class="mono space-y-1 text-sm text-[var(--fi-muted)]">
          <p>消息占用：{{ fmtBytes(disk.messagesBytes) }}</p>
          <p>媒体占用：{{ fmtBytes(disk.mediaBytes) }}</p>
          <p>磁盘剩余：{{ fmtBytes(disk.freeBytes) }}</p>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <label class="mono text-xs text-[var(--fi-muted)]">清理未过滤（保留最近</label>
          <input
            v-model.number="keepDays"
            type="number"
            min="0"
            class="mono w-20 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-2 py-1 text-sm text-[var(--fi-text)] outline-none"
          />
          <span class="mono text-xs text-[var(--fi-muted)]">天）</span>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[#f87171]"
            @click="cleanup"
          >
            执行清理
          </button>
        </div>
        <p v-if="cleanupMsg" class="mono mt-2 text-xs text-[var(--fi-warm)]">{{ cleanupMsg }}</p>
      </section>
    </template>
  </div>
</template>

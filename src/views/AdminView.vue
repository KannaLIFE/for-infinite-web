<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { api } from '../lib/api';
import { getToken, setToken } from '../lib/auth';
import { useBackendHealth } from '../lib/backend';
import { t } from '../lib/i18n';
import type { AccountState } from '../types';

const unlocked = ref(false);
const keyInput = ref('');
const unlockError = ref('');

const { backend, start } = useBackendHealth();

const accounts = ref<AccountState[]>([]);
const keys = ref<{ date: string; messageKey: string; articleKey: string; adminKey: string } | null>(null);
const disk = ref<{ messagesBytes: number; mediaBytes: number; totalUsedBytes: number; freeBytes: number } | null>(null);
const keepDays = ref(30);
const cleanupMsg = ref('');
const showKeys = ref(false);
const lastRefresh = ref('');
let pollTimer: ReturnType<typeof setInterval> | null = null;

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

function fmtAgo(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return t('admin.waitingFirst');
  if (sec < 60) return t('admin.secsAgo', { n: Math.floor(sec) });
  if (sec < 3600) return t('admin.minsAgo', { n: Math.floor(sec / 60) });
  return t('admin.hoursAgo', { n: Math.floor(sec / 3600) });
}

function isStale(a: AccountState): boolean {
  return a.connected && a.lastMessageAgoSec !== null && a.lastMessageAgoSec !== undefined && a.lastMessageAgoSec > 3600;
}

function napcatInfo(a: AccountState): { label: string; color: string; busy: boolean } {
  if (a.offline) return { label: t('admin.napcatDropped'), color: '#ef4444', busy: false };
  switch (a.napcatState) {
    case 'running': return { label: t('admin.napcatRunning'), color: '#4ade80', busy: false };
    case 'starting': return { label: t('admin.napcatStarting'), color: '#60a5fa', busy: true };
    case 'stopping': return { label: t('admin.napcatStopping'), color: '#fbbf24', busy: true };
    case 'stopped': return { label: t('admin.napcatStopped'), color: '#f87171', busy: false };
    case 'failed': return { label: t('admin.napcatFailed'), color: '#ef4444', busy: false };
    default: return { label: t('admin.napcatUnknown'), color: '#9ca3af', busy: false };
  }
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
      unlockError.value = t('common.keyInvalid');
    }
  } catch {
    unlockError.value = t('common.unlockFailed');
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
  try {
    const r = await api.post<{ ok: boolean; enabled?: boolean; error?: string }>(
      `/api/admin/account/${id}/toggle`,
      undefined,
      token(),
    );
    if (!r.ok && r.error) {
      alert(t('admin.togglePartial', { err: r.error }));
    }
  } catch (err) {
    alert(t('admin.toggleFailed', { err: String(err) }));
  }
  await loadAll();
}

async function cleanup(): Promise<void> {
  const r = await api.post<{ removed: number }>('/api/admin/cleanup', { keepDays: keepDays.value }, token());
  cleanupMsg.value = t('admin.cleanupDone', { n: r.removed, d: keepDays.value });
  await loadAll();
}

type ArtCategory = 'blog' | 'worldview' | 'reality';
const artCategory = ref<ArtCategory>('blog');
const artList = ref<{ slug: string; title: string; locked: boolean }[]>([]);
const artForm = ref({ title: '', year: '', date: '', tags: '', excerpt: '', content: '' });
const artMsg = ref('');

async function loadArtList(): Promise<void> {
  try {
    const r = await api.get<{ items: typeof artList.value }>(
      `/api/admin/articles/${artCategory.value}`,
      token(),
    );
    artList.value = r.items;
  } catch {

  }
}

async function createArticle(): Promise<void> {
  artMsg.value = '';
  if (!artForm.value.title.trim() || !artForm.value.content.trim()) {
    artMsg.value = t('admin.artEmpty');
    return;
  }
  const body: Record<string, unknown> = {
    category: artCategory.value,
    title: artForm.value.title.trim(),
    content: artForm.value.content,
  };
  if (artCategory.value === 'worldview') body.year = Number(artForm.value.year) || 0;
  if (artCategory.value !== 'worldview' && artForm.value.date.trim()) body.date = artForm.value.date.trim();
  if (artForm.value.tags.trim()) {
    body.tags = artForm.value.tags.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (artForm.value.excerpt.trim()) body.excerpt = artForm.value.excerpt.trim();
  try {
    await api.post('/api/admin/articles', body, token());
    artMsg.value = t('admin.artCreated');
    artForm.value = { title: '', year: '', date: '', tags: '', excerpt: '', content: '' };
    await loadArtList();
  } catch (err) {
    artMsg.value = t('admin.artFailed', { err: String(err) });
  }
}

async function deleteArticle(slug: string): Promise<void> {
  if (!confirm(t('admin.deleteConfirm', { slug }))) return;
  try {
    await api.delete(`/api/admin/articles/${artCategory.value}/${slug}`, token());
    await loadArtList();
  } catch {

  }
}

onMounted(async () => {
  start();
  if (getToken()) {
    unlocked.value = true;
    await loadAll();
    await loadArtList();
  }

  pollTimer = setInterval(() => {
    if (unlocked.value && backend.value === 'up') void loadAll();
  }, 5000);
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
    <header>
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">{{ t('admin.title') }}</h1>
      <p class="mono mt-1 text-xs text-[var(--fi-muted)]">{{ t('admin.subtitle') }}</p>
    </header>

    <div v-if="!unlocked" class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">{{ t('admin.locked') }}</p>
      <div class="mt-4 flex gap-2">
        <input
          v-model="keyInput"
          type="password"
          class="mono flex-1 fi-px-panel bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
          :placeholder="t('admin.adminKeyPlaceholder')"
          @keyup.enter="unlock"
        />
        <button class="fi-px-btn px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlock">
          {{ t('admin.enter') }}
        </button>
      </div>
      <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
    </div>

    <template v-else>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">{{ t('admin.accounts') }}</h2>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1 text-xs text-[var(--fi-text)] hover:border-[var(--fi-blue)]"
            @click="refresh"
          >
            {{ t('admin.refresh') }}
          </button>
        </div>
        <p v-if="lastRefresh" class="mono mb-2 text-[10px] text-[var(--fi-muted)]">
          {{ t('admin.lastRefresh', { t: lastRefresh }) }}
        </p>
        <div class="space-y-2">
          <div v-for="a in accounts" :key="a.id" class="flex items-center gap-3">
            <span
              class="inline-block h-2 w-2"
              :style="isStale(a) ? 'background:#fbbf24' : `background:${napcatInfo(a).color}`"
            ></span>
            <span class="mono text-sm text-[var(--fi-text)]">{{ a.id }}</span>
            <span class="mono text-xs" :style="`color:${napcatInfo(a).color}`">
              {{ napcatInfo(a).label }}<template v-if="isStale(a)">{{ t('admin.maybeDropped') }}</template>
            </span>
            <span class="mono text-[10px]" :style="isStale(a) ? 'color:#fbbf24' : 'color:var(--fi-muted)'">
              {{ t('admin.lastMessage', { t: fmtAgo(a.lastMessageAgoSec) }) }}
            </span>
            <span class="mono text-[10px] text-[var(--fi-muted)]">
              {{ a.mode === 'whitelist' ? t('admin.whitelist') : t('admin.blacklist') }}
            </span>
            <button
              class="mono ml-auto rounded border border-[var(--fi-line)] px-2 py-1 text-xs text-[var(--fi-muted)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-text)] disabled:opacity-40"
              :disabled="napcatInfo(a).busy"
              @click="toggleAccount(a.id)"
            >
              {{ napcatInfo(a).busy ? '…' : a.napcatState === 'running' ? t('admin.stop') : t('admin.start') }}
            </button>
          </div>
          <p v-if="!accounts.length" class="mono text-xs text-[var(--fi-muted)]">{{ t('admin.noAccounts') }}</p>
        </div>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ t('admin.todayKeys') }}</h2>
        <button
          class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[var(--fi-warm)]"
          @click="loadKeys"
        >
          {{ t('admin.showRefresh') }}
        </button>
        <div v-if="showKeys && keys" class="mono mt-3 space-y-1 text-sm">
          <p class="text-[var(--fi-muted)]">{{ t('admin.date') }}{{ keys.date }}</p>
          <p>{{ t('admin.messageKey') }}<span class="text-[var(--fi-warm)]">{{ keys.messageKey }}</span></p>
          <p>{{ t('admin.articleKey') }}<span class="text-[var(--fi-warm)]">{{ keys.articleKey }}</span></p>
          <p>{{ t('admin.adminKey') }}<span class="text-[var(--fi-warm)]">{{ keys.adminKey }}</span></p>
        </div>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ t('admin.storage') }}</h2>
        <div v-if="disk" class="mono space-y-1 text-sm text-[var(--fi-muted)]">
          <p>{{ t('admin.msgUsage', { n: fmtBytes(disk.messagesBytes) }) }}</p>
          <p>{{ t('admin.mediaUsage', { n: fmtBytes(disk.mediaBytes) }) }}</p>
          <p>{{ t('admin.diskFree', { n: fmtBytes(disk.freeBytes) }) }}</p>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <label class="mono text-xs text-[var(--fi-muted)]">{{ t('admin.cleanupLabel') }}</label>
          <input
            v-model.number="keepDays"
            type="number"
            min="0"
            class="mono w-20 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-2 py-1 text-sm text-[var(--fi-text)] outline-none"
          />
          <span class="mono text-xs text-[var(--fi-muted)]">{{ t('admin.daysUnit') }}</span>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[#f87171]"
            @click="cleanup"
          >
            {{ t('admin.cleanup') }}
          </button>
        </div>
        <p v-if="cleanupMsg" class="mono mt-2 text-xs text-[var(--fi-warm)]">{{ cleanupMsg }}</p>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ t('admin.articles') }}</h2>

        <div class="mb-4 flex gap-2">
          <button
            v-for="c in (['blog', 'worldview', 'reality'] as ArtCategory[])"
            :key="c"
            class="mono rounded border px-3 py-1.5 text-xs"
            :class="artCategory === c ? 'border-[var(--fi-warm)] text-[var(--fi-warm)]' : 'border-[var(--fi-line)] text-[var(--fi-muted)]'"
            @click="artCategory = c; loadArtList()"
          >
            {{ c === 'blog' ? t('admin.catBlog') : c === 'worldview' ? t('admin.catWorldview') : t('admin.catReality') }}
          </button>
        </div>

        <div class="space-y-2">
          <input v-model="artForm.title" class="mono w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" :placeholder="t('admin.titlePh')" />
          <div class="flex gap-2">
            <input
              v-if="artCategory === 'worldview'"
              v-model="artForm.year"
              type="number"
              class="mono w-28 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
              :placeholder="t('admin.yearPh')"
            />
            <input
              v-else
              v-model="artForm.date"
              class="mono w-40 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
              :placeholder="t('admin.datePh')"
            />
            <input v-model="artForm.tags" class="mono min-w-0 flex-1 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" :placeholder="t('admin.tagsPh')" />
          </div>
          <input v-model="artForm.excerpt" class="mono w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" :placeholder="t('admin.excerptPh')" />
          <textarea
            v-model="artForm.content"
            rows="8"
            class="w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm leading-relaxed text-[var(--fi-text)] outline-none"
            :placeholder="t('admin.contentPh')"
          ></textarea>
          <button class="rounded-lg px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="createArticle">
            {{ t('admin.createArticle') }}
          </button>
          <p v-if="artMsg" class="mono text-xs text-[var(--fi-warm)]">{{ artMsg }}</p>
        </div>

        <div class="mt-4 space-y-1">
          <div v-for="a in artList" :key="a.slug" class="flex items-center gap-3">
            <span class="mono truncate text-sm text-[var(--fi-text)]">{{ a.title }}</span>
            <span v-if="a.locked" class="mono text-[10px] text-[var(--fi-muted)]">🔒</span>
            <span class="mono shrink-0 text-[10px] text-[var(--fi-muted)]">{{ a.slug }}</span>
            <button class="mono ml-auto rounded border border-[var(--fi-line)] px-2 py-1 text-xs text-[var(--fi-muted)] hover:border-[#f87171] hover:text-[#f87171]" @click="deleteArticle(a.slug)">
              {{ t('admin.delete') }}
            </button>
          </div>
          <p v-if="!artList.length" class="mono text-xs text-[var(--fi-muted)]">{{ t('admin.catEmpty') }}</p>
        </div>
      </section>
    </template>
    </template>
  </div>
</template>

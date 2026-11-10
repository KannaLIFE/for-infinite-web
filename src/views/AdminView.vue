<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { api } from '../lib/api';
import { getSessionToken, setSessionToken } from '../lib/auth';
import { useBackendHealth } from '../lib/backend';
import { t } from '../lib/i18n';
import type { AccountState } from '../types';

const unlocked = ref(false);
const keyInput = ref('');
const unlockError = ref('');

const { backend, start } = useBackendHealth();

const accounts = ref<AccountState[]>([]);
const disk = ref<{ messagesBytes: number; mediaBytes: number; totalUsedBytes: number; freeBytes: number } | null>(null);
const keepDays = ref(30);
const cleanupMsg = ref('');
const lastRefresh = ref('');
let pollTimer: ReturnType<typeof setInterval> | null = null;

const token = () => getSessionToken() || undefined;

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

// ---- 登录：密码 → token 存 sessionStorage（关页失效） ----
async function unlock(): Promise<void> {
  unlockError.value = '';
  try {
    const r = await api.post<{ ok: boolean; token?: string }>('/api/auth/login', {
      password: keyInput.value,
    });
    if (r.ok && r.token) {
      setSessionToken(r.token);
      unlocked.value = true;
      keyInput.value = '';
      await loadAll();
      await loadFiles();
      await loadArtList();
    } else {
      unlockError.value = t('admin.wrongPassword');
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

// ---- 文件管理（content/blog，仅 .md） ----
interface BlogFile {
  name: string;
  size: number;
  mtime: string;
}

const files = ref<BlogFile[]>([]);
const fileMsg = ref('');
const uploading = ref(false);
const quickTitle = ref('');
const quickContent = ref('');
const preview = ref<{ name: string; content: string } | null>(null);

async function loadFiles(): Promise<void> {
  try {
    const r = await api.get<{ items: BlogFile[] }>('/api/admin/files', token());
    files.value = r.items;
  } catch {
    /* ignore */
  }
}

async function onUpload(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  input.value = '';
  if (!f) return;
  if (!/\.(md|markdown)$/i.test(f.name)) {
    fileMsg.value = t('admin.mdOnly');
    return;
  }
  uploading.value = true;
  fileMsg.value = '';
  try {
    const content = await f.text();
    await api.post('/api/admin/files/upload', { name: f.name, content }, token());
    fileMsg.value = t('admin.uploadDone', { name: f.name });
    await loadFiles();
    await loadArtList();
  } catch (err) {
    const msg = (err as { message?: string }).message || '';
    fileMsg.value = msg === 'exists' ? t('admin.nameExists') : t('admin.uploadFail', { err: msg || String(err) });
  } finally {
    uploading.value = false;
  }
}

async function quickCreate(): Promise<void> {
  fileMsg.value = '';
  if (!quickTitle.value.trim() || !quickContent.value.trim()) {
    fileMsg.value = t('admin.artEmpty');
    return;
  }
  try {
    await api.post(
      '/api/admin/articles',
      { category: 'blog', title: quickTitle.value.trim(), content: quickContent.value },
      token(),
    );
    quickTitle.value = '';
    quickContent.value = '';
    fileMsg.value = t('admin.artCreated');
    await loadFiles();
    await loadArtList();
  } catch (err) {
    fileMsg.value = t('admin.artFailed', { err: String(err) });
  }
}

async function removeFile(name: string): Promise<void> {
  if (!confirm(t('admin.deleteFileConfirm', { name }))) return;
  try {
    await api.delete(`/api/admin/files/${encodeURIComponent(name)}`, token());
    fileMsg.value = t('admin.deleted');
    await loadFiles();
    await loadArtList();
  } catch {
    /* ignore */
  }
}

async function openFile(name: string): Promise<void> {
  try {
    const r = await api.get<{ name: string; content: string }>(
      `/api/admin/files/${encodeURIComponent(name)}`,
      token(),
    );
    preview.value = r;
  } catch {
    /* ignore */
  }
}

// ---- 文章管理（世界观/现实等分类） ----
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
    /* ignore */
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
    await loadFiles();
  } catch (err) {
    artMsg.value = t('admin.artFailed', { err: String(err) });
  }
}

async function deleteArticle(slug: string): Promise<void> {
  if (!confirm(t('admin.deleteConfirm', { slug }))) return;
  try {
    await api.delete(`/api/admin/articles/${artCategory.value}/${slug}`, token());
    await loadArtList();
    await loadFiles();
  } catch {
    /* ignore */
  }
}

onMounted(async () => {
  start();
  if (getSessionToken()) {
    unlocked.value = true;
    await loadAll();
    await loadFiles();
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
          :placeholder="t('admin.loginPassword')"
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
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ t('admin.files') }}</h2>
        <p class="mono mb-3 text-[10px] text-[var(--fi-muted)]">{{ t('admin.filesHint') }}</p>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-3">
            <h3 class="mono text-xs text-[var(--fi-blue)]">{{ t('admin.quickCreate') }}</h3>
            <p class="mono mt-1 text-[10px] text-[var(--fi-muted)]">{{ t('admin.quickHint') }}</p>
            <input
              v-model="quickTitle"
              class="mono mt-2 w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
              :placeholder="t('admin.titlePh')"
            />
            <textarea
              v-model="quickContent"
              rows="6"
              class="mt-2 w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel)] px-3 py-2 text-sm leading-relaxed text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
              :placeholder="t('admin.contentPh')"
            ></textarea>
            <button class="mt-2 rounded px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="quickCreate">
              {{ t('admin.create') }}
            </button>
          </div>

          <div class="flex flex-col border-2 border-[var(--fi-line-solid)] bg-[var(--fi-panel-2)] p-3">
            <h3 class="mono text-xs text-[var(--fi-violet)]">{{ t('admin.uploadMd') }}</h3>
            <label class="fi-px-btn mt-3 cursor-pointer text-center text-sm text-[var(--fi-blue)]">
              {{ uploading ? t('admin.uploading') : t('admin.uploadMd') }}
              <input type="file" accept=".md,.markdown" class="hidden" :disabled="uploading" @change="onUpload" />
            </label>
            <p class="mono mt-2 text-[10px] text-[var(--fi-muted)]">{{ t('admin.mdOnly') }}</p>
            <div class="mt-3 min-h-24 flex-1 space-y-1.5 overflow-y-auto">
              <p v-if="!files.length" class="mono text-xs text-[var(--fi-muted)]">{{ t('admin.noFiles') }}</p>
              <div
                v-for="f in files"
                :key="f.name"
                class="flex items-center gap-2 border-l-2 border-[var(--fi-blue-dim)] py-1 pl-2"
              >
                <button class="mono min-w-0 flex-1 truncate text-left text-xs text-[var(--fi-text)] hover:text-[var(--fi-blue)]" @click="openFile(f.name)">
                  {{ f.name }}
                </button>
                <span class="mono shrink-0 text-[9px] text-[var(--fi-muted)]">{{ fmtBytes(f.size) }}</span>
                <button class="mono shrink-0 text-[10px] text-[var(--fi-muted)] hover:text-[#f87171]" @click="removeFile(f.name)">
                  {{ t('admin.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="fileMsg" class="mono mt-2 text-xs text-[var(--fi-warm)]">{{ fileMsg }}</p>
      </section>

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

    <div
      v-if="preview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      @click.self="preview = null"
    >
      <div class="fi-px-panel w-full max-w-2xl bg-[var(--fi-panel)] p-6">
        <div class="flex items-start justify-between gap-4">
          <h3 class="mono truncate text-base text-[var(--fi-text)]">{{ preview.name }}</h3>
          <button class="mono text-sm text-[var(--fi-muted)] hover:text-[var(--fi-text)]" @click="preview = null">
            {{ t('common.closeX') }}
          </button>
        </div>
        <pre class="mt-3 max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--fi-text)]">{{ preview.content }}</pre>
      </div>
    </div>
  </div>
</template>

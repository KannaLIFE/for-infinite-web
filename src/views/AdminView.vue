<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
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
  if (sec === null || sec === undefined) return '绛夊緟棣栨潯娑堟伅鈥?;
  if (sec < 60) return `${Math.floor(sec)} 绉掑墠`;
  if (sec < 3600) return `${Math.floor(sec / 60)} 鍒嗛挓鍓峘;
  return `${Math.floor(sec / 3600)} 灏忔椂鍓峘;
}

function isStale(a: AccountState): boolean {
  return a.connected && a.lastMessageAgoSec !== null && a.lastMessageAgoSec !== undefined && a.lastMessageAgoSec > 3600;
}

function napcatInfo(a: AccountState): { label: string; color: string; busy: boolean } {
  if (a.offline) return { label: '宸叉帀绾匡紙闇€閲嶆壂鐧诲綍锛?, color: '#ef4444', busy: false };
  switch (a.napcatState) {
    case 'running': return { label: '姝ｅ父杩愯', color: '#4ade80', busy: false };
    case 'starting': return { label: '姝ｅ湪鍚姩', color: '#60a5fa', busy: true };
    case 'stopping': return { label: '姝ｅ湪鍏抽棴', color: '#fbbf24', busy: true };
    case 'stopped': return { label: '宸插叧闂?, color: '#f87171', busy: false };
    case 'failed': return { label: '澶辫触', color: '#ef4444', busy: false };
    default: return { label: '鐘舵€佹湭鐭?, color: '#9ca3af', busy: false };
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
      unlockError.value = '閽ュ寵鏃犳晥';
    }
  } catch {
    unlockError.value = '瑙ｉ攣澶辫触';
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
      alert(`鎿嶄綔鏈畬鍏ㄧ敓鏁堬細\n${r.error}`);
    }
  } catch (err) {
    alert(`鎿嶄綔澶辫触锛?{String(err)}`);
  }
  await loadAll();
}

async function cleanup(): Promise<void> {
  const r = await api.post<{ removed: number }>('/api/admin/cleanup', { keepDays: keepDays.value }, token());
  cleanupMsg.value = `宸叉竻鐞?${r.removed} 鏉★紙淇濈暀鏈€杩?${keepDays.value} 澶╋級銆俙;
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
    artMsg.value = '鏍囬鍜屾鏂囦笉鑳戒负绌恒€?;
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
    artMsg.value = '宸插垱寤恒€?;
    artForm.value = { title: '', year: '', date: '', tags: '', excerpt: '', content: '' };
    await loadArtList();
  } catch (err) {
    artMsg.value = `鍒涘缓澶辫触锛?{String(err)}`;
  }
}

async function deleteArticle(slug: string): Promise<void> {
  if (!confirm(`鍒犻櫎鏂囩珷 ${slug}锛焋)) return;
  try {
    await api.delete(`/api/admin/articles/${artCategory.value}/${slug}`, token());
    await loadArtList();
  } catch {

  }
}

onMounted(async () => {
  if (getToken()) {
    unlocked.value = true;
    await loadAll();
    await loadArtList();
  }

  pollTimer = setInterval(() => {
    if (unlocked.value) void loadAll();
  }, 5000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header>
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">鍚庡彴 路 璋冩帶</h1>
      <p class="mono mt-1 text-xs text-[var(--fi-muted)]">璐﹀彿鐘舵€?路 鍚嶅崟 路 娓呯悊 路 閽ュ寵</p>
    </header>

    <div v-if="!unlocked" class="rounded-xl border border-[var(--fi-line)] bg-[var(--fi-panel)] p-6">
      <p class="text-sm text-[var(--fi-muted)]">鍚庡彴闇€绠＄悊鏉冮檺锛岃杈撳叆閽ュ寵銆?/p>
      <div class="mt-4 flex gap-2">
        <input
          v-model="keyInput"
          type="password"
          class="mono flex-1 fi-px-panel bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none focus:border-[var(--fi-blue)]"
          placeholder="绠＄悊閽ュ寵鈥︹€?
          @keyup.enter="unlock"
        />
        <button class="fi-px-btn px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="unlock">
          杩涘叆
        </button>
      </div>
      <p v-if="unlockError" class="mt-2 text-xs text-red-400">{{ unlockError }}</p>
    </div>

    <template v-else>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="mono text-sm text-[var(--fi-warm)]">璐﹀彿鐘舵€?/h2>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1 text-xs text-[var(--fi-text)] hover:border-[var(--fi-blue)]"
            @click="refresh"
          >
            鉄?鍒锋柊妫€娴?          </button>
        </div>
        <p v-if="lastRefresh" class="mono mb-2 text-[10px] text-[var(--fi-muted)]">
          涓婃鍒锋柊锛歿{ lastRefresh }}
        </p>
        <div class="space-y-2">
          <div v-for="a in accounts" :key="a.id" class="flex items-center gap-3">
            <span
              class="inline-block h-2 w-2"
              :style="isStale(a) ? 'background:#fbbf24' : `background:${napcatInfo(a).color}`"
            ></span>
            <span class="mono text-sm text-[var(--fi-text)]">{{ a.id }}</span>
            <span class="mono text-xs" :style="`color:${napcatInfo(a).color}`">
              {{ napcatInfo(a).label }}<template v-if="isStale(a)"> 路 鐤戜技鎺夌嚎</template>
            </span>
            <span class="mono text-[10px]" :style="isStale(a) ? 'color:#fbbf24' : 'color:var(--fi-muted)'">
              鏈€鍚庢敹鍒帮細{{ fmtAgo(a.lastMessageAgoSec) }}
            </span>
            <span class="mono text-[10px] text-[var(--fi-muted)]">
              {{ a.mode === 'whitelist' ? '鐧藉悕鍗? : '榛戝悕鍗? }}
            </span>
            <button
              class="mono ml-auto rounded border border-[var(--fi-line)] px-2 py-1 text-xs text-[var(--fi-muted)] hover:border-[var(--fi-blue)] hover:text-[var(--fi-text)] disabled:opacity-40"
              :disabled="napcatInfo(a).busy"
              @click="toggleAccount(a.id)"
            >
              {{ napcatInfo(a).busy ? '鈥? : a.napcatState === 'running' ? '鍋滅敤' : '鍚敤' }}
            </button>
          </div>
          <p v-if="!accounts.length" class="mono text-xs text-[var(--fi-muted)]">灏氭棤璐﹀彿閰嶇疆銆?/p>
        </div>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">浠婃棩閽ュ寵</h2>
        <button
          class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[var(--fi-warm)]"
          @click="loadKeys"
        >
          鏄剧ず / 鍒锋柊
        </button>
        <div v-if="showKeys && keys" class="mono mt-3 space-y-1 text-sm">
          <p class="text-[var(--fi-muted)]">鏃ユ湡锛歿{ keys.date }}</p>
          <p>娑堟伅閽ュ寵锛?span class="text-[var(--fi-warm)]">{{ keys.messageKey }}</span></p>
          <p>鏂囩珷閽ュ寵锛?span class="text-[var(--fi-warm)]">{{ keys.articleKey }}</span></p>
          <p>鍚庡彴閽ュ寵锛?span class="text-[var(--fi-warm)]">{{ keys.adminKey }}</span></p>
        </div>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">瀛樺偍</h2>
        <div v-if="disk" class="mono space-y-1 text-sm text-[var(--fi-muted)]">
          <p>娑堟伅鍗犵敤锛歿{ fmtBytes(disk.messagesBytes) }}</p>
          <p>濯掍綋鍗犵敤锛歿{ fmtBytes(disk.mediaBytes) }}</p>
          <p>纾佺洏鍓╀綑锛歿{ fmtBytes(disk.freeBytes) }}</p>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <label class="mono text-xs text-[var(--fi-muted)]">娓呯悊鏈繃婊わ紙淇濈暀鏈€杩?/label>
          <input
            v-model.number="keepDays"
            type="number"
            min="0"
            class="mono w-20 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-2 py-1 text-sm text-[var(--fi-text)] outline-none"
          />
          <span class="mono text-xs text-[var(--fi-muted)]">澶╋級</span>
          <button
            class="mono rounded border border-[var(--fi-line)] px-3 py-1.5 text-xs text-[var(--fi-text)] hover:border-[#f87171]"
            @click="cleanup"
          >
            鎵ц娓呯悊
          </button>
        </div>
        <p v-if="cleanupMsg" class="mono mt-2 text-xs text-[var(--fi-warm)]">{{ cleanupMsg }}</p>
      </section>

      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">鏂囩珷绠＄悊</h2>

        <div class="mb-4 flex gap-2">
          <button
            v-for="c in (['blog', 'worldview', 'reality'] as ArtCategory[])"
            :key="c"
            class="mono rounded border px-3 py-1.5 text-xs"
            :class="artCategory === c ? 'border-[var(--fi-warm)] text-[var(--fi-warm)]' : 'border-[var(--fi-line)] text-[var(--fi-muted)]'"
            @click="artCategory = c; loadArtList()"
          >
            {{ c === 'blog' ? '鍗氬' : c === 'worldview' ? '涓栫晫瑙? : '鐜板疄(涓婇攣)' }}
          </button>
        </div>

        <div class="space-y-2">
          <input v-model="artForm.title" class="mono w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" placeholder="鏍囬" />
          <div class="flex gap-2">
            <input
              v-if="artCategory === 'worldview'"
              v-model="artForm.year"
              type="number"
              class="mono w-28 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
              placeholder="涓栫晫瑙傚勾"
            />
            <input
              v-else
              v-model="artForm.date"
              class="mono w-40 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none"
              placeholder="鏃ユ湡 YYYY-MM-DD"
            />
            <input v-model="artForm.tags" class="mono min-w-0 flex-1 rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" placeholder="鏍囩锛岄€楀彿鍒嗛殧" />
          </div>
          <input v-model="artForm.excerpt" class="mono w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm text-[var(--fi-text)] outline-none" placeholder="鎽樿锛堝彲閫夛級" />
          <textarea
            v-model="artForm.content"
            rows="8"
            class="w-full rounded border border-[var(--fi-line)] bg-[var(--fi-panel-2)] px-3 py-2 text-sm leading-relaxed text-[var(--fi-text)] outline-none"
            placeholder="姝ｆ枃锛圡arkdown锛夆€︹€?
          ></textarea>
          <button class="rounded-lg px-4 py-2 text-sm" style="background: var(--fi-warm); color: #1a1208" @click="createArticle">
            鍒涘缓鏂囩珷
          </button>
          <p v-if="artMsg" class="mono text-xs text-[var(--fi-warm)]">{{ artMsg }}</p>
        </div>

        <div class="mt-4 space-y-1">
          <div v-for="a in artList" :key="a.slug" class="flex items-center gap-3">
            <span class="mono truncate text-sm text-[var(--fi-text)]">{{ a.title }}</span>
            <span v-if="a.locked" class="mono text-[10px] text-[var(--fi-muted)]">馃敀</span>
            <span class="mono shrink-0 text-[10px] text-[var(--fi-muted)]">{{ a.slug }}</span>
            <button class="mono ml-auto rounded border border-[var(--fi-line)] px-2 py-1 text-xs text-[var(--fi-muted)] hover:border-[#f87171] hover:text-[#f87171]" @click="deleteArticle(a.slug)">
              鍒犻櫎
            </button>
          </div>
          <p v-if="!artList.length" class="mono text-xs text-[var(--fi-muted)]">璇ュ垎绫绘殏鏃犳枃绔犮€?/p>
        </div>
      </section>
    </template>
  </div>
</template>

import { onUnmounted, ref } from 'vue';
import { API_BASE } from './api';

export type BackendState = 'checking' | 'up' | 'down';

export function useBackendHealth(intervalMs = 10000) {
  const backend = ref<BackendState>('checking');
  let timer: ReturnType<typeof setInterval> | null = null;

  async function probe(): Promise<void> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      backend.value = res.ok ? 'up' : 'down';
    } catch {
      backend.value = 'down';
    }
  }

  function start(): void {
    void probe();
    timer = setInterval(() => void probe(), intervalMs);
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { backend, start };
}

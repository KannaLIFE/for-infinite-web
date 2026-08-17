// API 客户端：开发走 Vite 代理(/api)，生产走 VITE_API_BASE

export const API_BASE = import.meta.env.VITE_API_BASE || '';

export function mediaUrl(relPath: string): string {
  return `${API_BASE}/${relPath}`;
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `HTTP ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(p: string, token?: string) => request<T>(p, { token }),
  post: <T>(p: string, body?: unknown, token?: string) =>
    request<T>(p, { method: 'POST', body, token }),
  delete: <T>(p: string, token?: string) =>
    request<T>(p, { method: 'DELETE', token }),
};

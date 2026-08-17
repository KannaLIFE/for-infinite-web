// 授权 token 管理（localStorage）

const TOKEN_KEY = 'fi_token';
const SCOPES_KEY = 'fi_scopes';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string): void {
  localStorage.setItem(TOKEN_KEY, t);
}

/** 解锁成功后：存 token + 授权范围（message/article/admin） */
export function setAuth(t: string, scopes: string[]): void {
  localStorage.setItem(TOKEN_KEY, t);
  localStorage.setItem(SCOPES_KEY, JSON.stringify(scopes));
}

export function getScopes(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(SCOPES_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function hasScope(scope: string): boolean {
  return getScopes().includes(scope);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SCOPES_KEY);
}

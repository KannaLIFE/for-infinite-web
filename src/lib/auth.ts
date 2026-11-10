const TOKEN_KEY = 'fi_token';
const SCOPES_KEY = 'fi_scopes';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string): void {
  localStorage.setItem(TOKEN_KEY, t);
}

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

// ---- 后台登录（sessionStorage：每次打开页面需重新登录，关闭页面即失效） ----

const SESSION_TOKEN_KEY = 'fi_session_token';

export function getSessionToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(t: string): void {
  sessionStorage.setItem(SESSION_TOKEN_KEY, t);
}

export function clearSessionToken(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

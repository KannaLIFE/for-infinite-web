import { createI18n } from 'vue-i18n';
import zh from '../locales/zh';
import en from '../locales/en';

export type Locale = 'zh' | 'en';

const STORAGE_KEY = 'fi-locale';

function detect(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // localStorage unavailable — fall through to browser detection
  }
  try {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    return 'en';
  } catch {
    return 'zh';
  }
}

const initial = detect();

export const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: 'zh',
  messages: { zh, en },
});

/** Reactive translate helper — usable in templates and scripts. */
export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params);
}

export function currentLocale(): Locale {
  return i18n.global.locale.value as Locale;
}

export function setLocale(l: Locale): void {
  i18n.global.locale.value = l;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // ignore storage failures
  }
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
}

/** Pick the string matching the current locale (data-driven content). */
export function pick(zhText: string, enText?: string): string {
  if (enText && i18n.global.locale.value === 'en') return enText;
  return zhText;
}

/** Pick the list matching the current locale. */
export function pickList(zhList: string[], enList?: string[]): string[] {
  if (enList && i18n.global.locale.value === 'en') return enList;
  return zhList;
}

document.documentElement.lang = initial === 'zh' ? 'zh-CN' : 'en';

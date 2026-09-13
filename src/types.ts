export interface ArticleMeta {
  slug: string;
  title: string;
  year?: number;
  date?: string;
  tags: string[];
  category: 'blog' | 'worldview' | 'reality';
  excerpt?: string;
  locked: boolean;
  orderKey: number;
}

export interface Article extends ArticleMeta {
  content: string;
}

export interface StoredMessage {
  id: string;
  accountId: string;
  source: 'user' | 'group';
  conversationId: string;
  conversationName: string;
  senderId: string;
  senderName: string;
  content: string;
  mediaPaths: string[];
  timestamp: number;
  runId: string;
  filter: {
    mode: 'whitelist' | 'blacklist' | 'none';
    groupCheck: 'pass' | 'block' | 'n/a';
    userCheck: 'pass' | 'block' | 'n/a';
    final: 'pass' | 'block';
    reason: string;
  };
}

export interface AccountState {
  id: string;
  enabled: boolean;
  mode: 'whitelist' | 'blacklist';
  connected: boolean;

  lastMessageAt: number | null;

  lastMessageAgoSec: number | null;

  napcatState: 'running' | 'starting' | 'stopping' | 'stopped' | 'failed' | 'unknown';

  offline: boolean;

  offlineAt: number | null;
}

// 前端共享类型

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
  /** 最后一次收到消息的时间戳（ms），从未收到为 null */
  lastMessageAt: number | null;
  /** 距最后收到消息的秒数，null 表示从未收到 */
  lastMessageAgoSec: number | null;
}

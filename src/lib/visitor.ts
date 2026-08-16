// 匿名访客身份：localStorage 持久化，供 LIFE 记忆识别

const VISITOR_KEY = 'fi_visitor_id';

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

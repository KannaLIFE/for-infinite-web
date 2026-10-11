export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

export const achievements: Achievement[] = [
  { id: 'first', title: '第一束光', desc: '点亮星权穹顶的第一天。', unlocked: true },
  { id: 'boot', title: '开机成功', desc: '观测站完成首次启动。', unlocked: true },
  { id: 'life', title: '暖光苏醒', desc: '与 LIFE 完成第一次对话。', unlocked: true },
  { id: 'four', title: '四线星联', desc: '四个信号源同时在线。', unlocked: false },
  { id: 'hundred', title: '百条记录', desc: '消息归档达到一百条。', unlocked: false },
  { id: 'legend', title: '穹顶传说', desc: '……尚未解锁的未知成就。', unlocked: false },
];

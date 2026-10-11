export interface TechItem {
  name: string;
  level: number;
  kind: 'using' | 'learning';
  desc?: string;
}

export const tech: TechItem[] = [
  { name: 'C', level: 60, kind: 'using', desc: '系统与底层练习' },
  { name: 'Java', level: 55, kind: 'using', desc: '面向对象入门语言' },
  { name: 'Python', level: 50, kind: 'using', desc: '脚本与自动化' },
  { name: 'HTML / CSS', level: 65, kind: 'using', desc: '网页结构与样式' },
  { name: 'AI / 机器学习', level: 30, kind: 'learning', desc: '正在学习' },
  { name: 'LLM 应用与 Agent', level: 35, kind: 'learning', desc: '正在学习' },
  { name: '全栈（React + Node）', level: 25, kind: 'learning', desc: '正在学习' },
];

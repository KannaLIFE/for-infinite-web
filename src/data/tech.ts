export interface TechItem {
  name: string;
  nameEn?: string;
  level: number;
  kind: 'using' | 'learning';
  desc?: string;
  descEn?: string;
}

export const tech: TechItem[] = [
  { name: 'C', level: 60, kind: 'using', desc: '系统与底层练习', descEn: 'Systems & low-level practice' },
  { name: 'Java', level: 55, kind: 'using', desc: '面向对象入门语言', descEn: 'My OOP starting language' },
  { name: 'Python', level: 50, kind: 'using', desc: '脚本与自动化', descEn: 'Scripting & automation' },
  { name: 'HTML / CSS', level: 65, kind: 'using', desc: '网页结构与样式', descEn: 'Web structure & styling' },
  { name: 'AI / 机器学习', nameEn: 'AI / ML', level: 30, kind: 'learning', desc: '正在学习', descEn: 'Currently learning' },
  { name: 'LLM 应用与 Agent', nameEn: 'LLM Apps & Agents', level: 35, kind: 'learning', desc: '正在学习', descEn: 'Currently learning' },
  { name: '全栈（React + Node）', nameEn: 'Full-stack (React + Node)', level: 25, kind: 'learning', desc: '正在学习', descEn: 'Currently learning' },
];

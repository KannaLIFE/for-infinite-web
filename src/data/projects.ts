export interface Project {
  name: string;
  desc?: string;
  cover?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

export const projects: Project[] = [
  {
    name: '示例项目',
    desc: '在这里描述你的项目。',
    tags: ['示例'],
    links: [{ label: 'GitHub', url: 'https://github.com/kannalife' }],
  },
];

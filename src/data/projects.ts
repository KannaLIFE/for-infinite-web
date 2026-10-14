export interface Project {
  name: string;
  nameEn?: string;
  desc?: string;
  descEn?: string;
  cover?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

export const projects: Project[] = [
  {
    name: '示例项目',
    nameEn: 'Example Project',
    desc: '在这里描述你的项目。',
    descEn: 'Describe your project here.',
    tags: ['示例'],
    links: [{ label: 'GitHub', url: 'https://github.com/kannalife' }],
  },
];

export interface FriendLink {
  name: string;
  desc?: string;
  cover?: string;
  avatar?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

export const friends: FriendLink[] = [
  {
    name: '示例友链',
    desc: '在这里描述你的朋友。',
    tags: ['示例'],
    links: [{ label: '主页', url: 'https://example.com' }],
  },
];

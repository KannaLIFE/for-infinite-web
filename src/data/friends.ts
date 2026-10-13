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
    name: '数字田园的悠然漫步',
    desc: '采菊东篱下，悠然见南山。',
    avatar: 'https://blog.gardenwalk.moe/wp-content/uploads/1737602734-icon.png',
    links: [{ label: '主页', url: 'https://www.gardenwalk.moe' }],
  },
];

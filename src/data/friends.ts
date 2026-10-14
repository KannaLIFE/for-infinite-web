export interface FriendLink {
  name: string;
  nameEn?: string;
  desc?: string;
  descEn?: string;
  cover?: string;
  avatar?: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

export const friends: FriendLink[] = [
  {
    name: '数字田园的悠然漫步',
    nameEn: 'A Leisurely Stroll in the Digital Garden',
    desc: '采菊东篱下，悠然见南山。',
    descEn: 'Picking chrysanthemums by the eastern hedge, I gaze at the southern hills.',
    cover: 'covers/friend-gardenwalk.webp',
    avatar: 'https://blog.gardenwalk.moe/wp-content/uploads/1737602734-icon.png',
    links: [{ label: '主页', url: 'https://www.gardenwalk.moe' }],
  },
  {
    name: 'dekxi',
    desc: 'CS student · full-stack app builder · roblox studio dev · UI / Visual Design',
    cover: 'covers/friend-dekxi.jpg',
    avatar: 'https://avatars.githubusercontent.com/u/201718391?v=4',
    links: [{ label: '主页', url: 'https://dekxi-atelier.vercel.app/' }],
  },
];

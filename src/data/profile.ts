export interface AboutItem {
  name: string;
  img?: string;
  desc?: string;
}

export interface AboutSection {
  key: string;
  title: string;
  items: AboutItem[];
}

export const profile = {
  name: 'KannaLIFE',
  handle: '@kannalife',
  tagline: '你好！',
  intro:
    '我是 KannaLIFE，一个还在成长中的开发者。想学更多东西，交更多朋友。',
  motto: 'FOR INFINITE',
  mottoSub: '星权穹顶 · 观测站',
  avatar: 'avatar.jpg',
  status: '观测站运行中',
  statusNote: '正在学习 LLM 应用与 Agent',
  ghUser: 'kannalife',
  discordId: '',

  socials: [
    { label: 'GitHub', url: 'https://github.com/kannalife' },
    { label: 'Email', url: 'mailto:jinshihuabei@gmail.com' },
    { label: 'Bluesky', url: 'https://bsky.app/profile/in-life-k.bsky.social' },
    { label: 'X', url: 'https://x.com/IN_LIFE_K' },
  ],

  pills: [
    '开发者',
    '学习者',
    'AI 探索中',
    '开源爱好者',
  ],

  clocks: [
    { label: '北京', offset: 8 },
    { label: '洛杉矶', offset: -8 },
    { label: '伦敦', offset: 0 },
    { label: '东京', offset: 9 },
    { label: '纽约', offset: -5 },
    { label: '悉尼', offset: 10 },
  ],

  about: [
    {
      key: 'shows',
      title: 'shows · 影视',
      items: [
        { name: '神探夏洛克', img: '/covers/sherlock.jpg', desc: '' },
        { name: '是，大臣', img: '/covers/yesminister.jpg', desc: '' },
        { name: '是，首相', img: '/covers/yesprimeminister.jpg', desc: '' },
        { name: 'Alan Becker 火柴人动画', img: '', desc: '' },
        { name: '星球大战', img: '/covers/starwars.jpg', desc: '' },
        { name: 'Harry Potter', img: '/covers/harrypotter.png', desc: '' },
      ],
    },
    {
      key: 'games',
      title: 'games · 游戏',
      items: [
        { name: 'Minecraft', img: '', desc: '' },
        { name: 'Mindustry', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1127400/header.jpg', desc: '' },
        { name: 'Stellaris', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/281990/header.jpg', desc: '' },
        { name: 'Dancing Line', img: '/covers/dancingline.png', desc: '' },
        { name: 'Among Us', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg', desc: '' },
        { name: 'Phigros', img: '', desc: '' },
        { name: 'Clash Royale', img: '/covers/clashroyale.png', desc: '' },
        { name: 'Seven years later', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1562920/header.jpg', desc: '' },
      ],
    },
    {
      key: 'vtubers',
      title: 'vtubers · 主播',
      items: [
        { name: 'vedal987（Neuro-sama）', img: '', desc: '' },
        { name: '各类切片（英文圈为主）', img: '', desc: '' },
      ],
    },
    {
      key: 'vocaloid',
      title: 'vocaloid · 术力口',
      items: [
        { name: 'YES or NO（雨衣 × 重音テト）', img: '', desc: '' },
        { name: 'Fake Dance（雨衣 × 重音テト）', img: '', desc: '' },
        { name: 'MESMERIZER（Bao & Neuro 英语翻唱）', img: '', desc: '' },
      ],
    },
    {
      key: 'music',
      title: 'music · 音乐',
      items: [
        { name: 'Hans Zimmer（汉斯·季默）', img: '/covers/hanszimmer.jpg', desc: '' },
        { name: 'Ludwig Göransson（信条 Tenet 配乐）', img: '/covers/ludwig.jpg', desc: '' },
        { name: '按精选集听歌', img: '', desc: '' },
      ],
    },
    {
      key: 'others',
      title: 'others · 其他',
      items: [
        { name: '写作（世界观创作）', img: '', desc: '' },
        { name: '板绘（数位板）', img: '', desc: '' },
        { name: '乐曲创作', img: '', desc: '' },
        { name: '学日语（想开始）', img: '', desc: '' },
      ],
    },
  ] as AboutSection[],

  byf: [
    '目前忙于学业，回复可能较慢。',
    '关注后我会回查你的账号：发言涉及极端政治或偏激内容的，可能会被我屏蔽。',
    '与我交流可用中文或英文（Chinese & English both welcome）。',
  ],
  dni: [] as string[],

  reachout: '欢迎合作与交流：开源项目、网站开发、有趣的 AI 想法。',

  techStack: [
    'C',
    'Java',
    'Python',
    'HTML',
    'CSS',
  ],

  learning: [
    'AI/机器学习',
    'LLM 应用与 Agent',
    '全栈（React + Node)'
  ],

  interests: [] as string[],

  friends: [
    { name: '示例友链', url: 'https://example.com', desc: '一个示例' },
  ],

  bannerUrl: '',
};

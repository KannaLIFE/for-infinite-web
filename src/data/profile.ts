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
        { name: '神探夏洛克', img: '/covers/shows-sherlock-s1.webp', desc: '《神探夏洛克》是BBC出品的英剧，把福尔摩斯的故事背景从19世纪搬到了21世纪的繁华大都市：这一次夏洛克·福尔摩斯（本尼迪克特·康伯巴奇饰）与好友约翰·华生（马丁·弗瑞曼饰）接连经历离奇自杀案、黑帮走私案和倒计时炸弹案——每个案件看似独立其实都有联系，幕后黑手莫里亚蒂（安德鲁·斯科特饰）正浮出水面。' },
        { name: '是，大臣', img: '/covers/shows-ministry.webp', desc: '本剧叙述在野党影子内阁成员Jim Hacker在帮助本党大选获胜后出任行政事务部（DAA）大臣，从此面对以部秘书Sir Humphrey Appleby为首的公务员体系；政客与公务员之间既有互相捂盖子，也有互相揭老底，英国政治体制的种种弊端与黑幕在大量喜剧情节中展现在观众眼前。' },
        { name: '是，首相', img: '/covers/shows-prime.webp', desc: '理论告诉我们权力越大责任越大，事情越多麻烦越多——老熟人吉姆·哈克终于入主唐宁街十号，成为英国首相！在内阁秘书汉弗莱·阿普比爵士与私人秘书伯纳·伍利的辅佐下，明暗之间棋逢对手，首相的政治生涯注定不亚于大臣。' },
        { name: 'Alan Becker 火柴人动画', img: '/covers/alanbecker.webp', desc: 'Alan Becker 和他的团队制作火柴人动画：故事就发生在电脑的桌面屏幕上，全程没有对白，却充满幽默与情感；成名作《Animator vs. Animation》系列让「电脑里的火柴人」成为一代网络经典。' },
        { name: '星球大战', img: '/covers/shows-starwars.png', desc: '' },
        { name: 'Harry Potter', img: '/covers/shows-hp.png', desc: '' },
      ],
    },
    {
      key: 'games',
      title: 'games · 游戏',
      items: [
        { name: 'Minecraft', img: '/covers/minecraft.png', desc: '微软旗下 Mojang Studios 开发的沙盒游戏：在方块世界里探索、采集、建造与生存冒险。' },
        { name: 'Mindustry', img: '/covers/mindustry.jpg', desc: '一款结合即时战略与塔防要素的开放式工厂管理游戏。' },
        { name: 'Stellaris', img: '/covers/stellaris.jpg', desc: 'Paradox 出品的科幻大型战略游戏：探索浩瀚银河，与外星种族互动，扩大你帝国的影响力。' },
        { name: 'Dancing Line', img: '/covers/dancingline.jpg', desc: '随着音乐引导一条无限延伸的线条穿过不同环境，点一下屏幕以转弯，避开障碍物。' },
        { name: 'Among Us', img: '/covers/amongus.jpg', desc: '4 到 15 名玩家的派对游戏，相互合作与背叛……一切都发生在太空之中！' },
        { name: 'Phigros', img: '/covers/phigros.webp', desc: '鸽游开发发行的非商业音乐游戏，带有收集和解谜要素。' },
        { name: 'Clash Royale', img: '/covers/clashroyale.webp', desc: 'Supercell 开发的即时战略手游：收集卡牌组建牌组，在几分钟的对战中攻守对决。' },
        { name: 'Seven years later', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1562920/library_600x900.jpg', desc: '生活片段故事风格的冒险游戏，3D 像素画面与时间跳跃元素，陪伴 Haruto 寻找七年前失去的记忆。' },
        { name: '魔法少女的魔女审判', img: '/covers/witchtrial.jpg', desc: '魔法辩论×悬疑 ADV：在残酷的死亡游戏中击破魔法与谎言的幻影，揪出混入少女之中的“魔女”。' },
        { name: 'PEAK', img: '/covers/peak.jpg', desc: '需要细致合作的登山游戏：作为流落神秘岛屿的探险家，唯一获救的希望是登上那座巍峨的山峰。' },
      ],
    },
    {
      key: 'vtubers',
      title: 'vtubers · 主播',
      items: [
        { name: 'vedal987（Neuro-sama）', img: '/covers/neurosama.png', desc: '' },
        { name: '各类切片（英文圈为主）', img: '', desc: '' },
      ],
    },
    {
      key: 'vocaloid',
      title: 'vocaloid · 术力口',
      items: [
        { name: 'YES or NO（雨衣 × 重音テト）', img: '/covers/yesorno.jpg', desc: '' },
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

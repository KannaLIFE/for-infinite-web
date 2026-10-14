export interface AboutItem {
  name: string;
  nameEn?: string;
  img?: string;
  desc?: string;
  descEn?: string;
  yt?: string;
  en?: string;
  site?: string;
}

export interface AboutSection {
  key: string;
  title: string;
  titleEn?: string;
  items: AboutItem[];
}

export const profile = {
  name: 'KannaLIFE',
  handle: '@kannalife',
  tagline: '你好！',
  taglineEn: 'Hello!',
  intro:
    '我是 KannaLIFE，一个还在成长中的开发者。想学更多东西，交更多朋友。',
  introEn:
    "I'm KannaLIFE, a developer still growing — learning more, and making more friends.",
  motto: 'FOR INFINITE',
  mottoSub: '星权穹顶 · 观测站',
  mottoSubEn: 'Stellar Dome · Observatory',
  avatar: 'avatar.jpg',
  status: '观测站运行中',
  statusEn: 'Station operational',
  statusNote: '正在学习 LLM 应用与 Agent',
  statusNoteEn: 'Learning LLM apps & agents',
  ghUser: 'kannalife',
  discordId: '1475618125973164072',

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
  pillsEn: [
    'Developer',
    'Learner',
    'Exploring AI',
    'Open-source fan',
  ],

  clocks: [
    { label: '北京', en: 'Beijing', offset: 8 },
    { label: '洛杉矶', en: 'Los Angeles', offset: -8 },
    { label: '伦敦', en: 'London', offset: 0 },
    { label: '东京', en: 'Tokyo', offset: 9 },
    { label: '纽约', en: 'New York', offset: -5 },
    { label: '悉尼', en: 'Sydney', offset: 10 },
  ],

  about: [
    {
      key: 'shows',
      title: 'shows · 影视',
      titleEn: 'shows · TV & Film',
      items: [
        { name: '神探夏洛克', nameEn: 'Sherlock', img: '/covers/shows-sherlock-s1.webp', en: 'Sherlock', desc: '《神探夏洛克》是BBC出品的英剧，把福尔摩斯的故事背景从19世纪搬到了21世纪的繁华大都市：这一次夏洛克·福尔摩斯（本尼迪克特·康伯巴奇饰）与好友约翰·华生（马丁·弗瑞曼饰）接连经历离奇自杀案、黑帮走私案和倒计时炸弹案——每个案件看似独立其实都有联系，幕后黑手莫里亚蒂（安德鲁·斯科特饰）正浮出水面。', descEn: "BBC's modern-day take on Sherlock Holmes: the great detective (Benedict Cumberbatch) and Dr. John Watson (Martin Freeman) are pulled through bizarre suicides, smuggling rings and countdown bombings in 21st-century London — each case seemingly separate, yet all connected to a single mastermind: Moriarty (Andrew Scott)." },
        { name: '是，大臣', nameEn: 'Yes Minister', img: '/covers/shows-ministry.webp', en: 'Yes Minister', desc: '本剧叙述在野党影子内阁成员Jim Hacker在帮助本党大选获胜后出任行政事务部（DAA）大臣，从此面对以部秘书Sir Humphrey Appleby为首的公务员体系；政客与公务员之间既有互相捂盖子，也有互相揭老底，英国政治体制的种种弊端与黑幕在大量喜剧情节中展现在观众眼前。', descEn: "After helping his party win the election, shadow-cabinet minister Jim Hacker takes over the Department of Administrative Affairs — and walks straight into the civil service machine led by Sir Humphrey Appleby. Politician and civil servant alternately cover for and expose each other, as the absurdities of British politics unfold in classic comedy." },
        { name: '是，首相', nameEn: 'Yes, Prime Minister', img: '/covers/shows-prime.webp', en: 'Yes, Prime Minister', desc: '理论告诉我们权力越大责任越大，事情越多麻烦越多——老熟人吉姆·哈克终于入主唐宁街十号，成为英国首相！在内阁秘书汉弗莱·阿普比爵士与私人秘书伯纳·伍利的辅佐下，明暗之间棋逢对手，首相的政治生涯注定不亚于大臣。', descEn: "Theory says more power means more responsibility, and more matters mean more trouble — old friend Jim Hacker has finally moved into 10 Downing Street as Prime Minister! Advised by Cabinet Secretary Sir Humphrey Appleby and Principal Private Secretary Bernard Woolley, his career at the top promises to be no easier than his days as a minister." },
        { name: 'Alan Becker 火柴人动画', nameEn: 'Alan Becker Animations', img: '/covers/alanbecker-banner.webp', en: 'Alan Becker', desc: 'Alan Becker 和他的团队制作火柴人动画：故事就发生在电脑的桌面屏幕上，全程没有对白，却充满幽默与情感；成名作《Animator vs. Animation》系列让「电脑里的火柴人」成为一代网络经典。', descEn: "Alan Becker and his team craft stick-figure animation: stories that take place right on a computer desktop, with no dialogue, yet full of humor and heart. The iconic 'Animator vs. Animation' series made 'stick figures inside your computer' an internet classic." },
        { name: '星球大战前传3：西斯的复仇', nameEn: 'Star Wars: Episode III – Revenge of the Sith', img: '/covers/shows-starwars.webp', en: 'Star Wars: Episode III – Revenge of the Sith', desc: '星球大战前传终章：克隆战争三年后共和国即将胜利，欧比-旺与阿纳金奉命营救被劫持的帕尔帕庭议长；阿纳金因预见妻子之死而逐渐倒向黑暗面，一场针对绝地武士与共和国的阴谋就此展开。', descEn: "The final chapter of the Star Wars prequels: three years into the Clone Wars, victory is near — Obi-Wan and Anakin are sent to rescue the captured Chancellor Palpatine. Haunted by visions of his wife's death, Anakin drifts toward the dark side, and a conspiracy against the Jedi and the Republic begins to unfold." },
        { name: '哈利·波特与死亡圣器（上）', nameEn: 'Harry Potter and the Deathly Hallows: Part 1', img: '/covers/shows-hp.webp', en: 'Harry Potter and the Deathly Hallows: Part 1', desc: '邓布利多死后，伏地魔与食死徒入侵魔法学校，邪恶阴云笼罩魔法世界。17 岁的哈利与罗恩、赫敏在逃亡中按邓布利多的嘱托寻找魂器；死亡圣器的面纱渐渐揭开，最后的决战即将到来。', descEn: "After Dumbledore's death, Voldemort and the Death Eaters tighten their grip on the wizarding world. Seventeen-year-old Harry, with Ron and Hermione, flees to hunt the Horcruxes as Dumbledore instructed; the veil over the Deathly Hallows slowly lifts, and the final battle draws near." },
        { name: '信条', nameEn: 'Tenet', img: '/covers/shows-tenet.webp', en: 'Tenet', desc: '世界存亡危在旦夕，“信条”一词是惟一的线索与武器。主人公穿梭于全球各地，开展特工活动，力求揭示“信条”之谜，并完成一项超越了真实时间的神秘任务。这项任务并非时间之旅，而是【时空逆转】。', descEn: "The world's survival hangs by a thread — 'Tenet' is the only clue and the only weapon. The Protagonist races across the globe on covert missions to unravel the mystery of Tenet and complete a task that transcends real time: not time travel, but time inversion." },
        { name: '奥本海默', nameEn: 'Oppenheimer', img: '/covers/shows-oppenheimer.webp', en: 'Oppenheimer', desc: '克里斯托弗·诺兰自编自导《奥本海默》：聚焦基里安·墨菲饰演的“原子弹之父”罗伯特·奥本海默。改编自普利策获奖传记《美国普罗米修斯：罗伯特·奥本海默的胜利与悲剧》。一部史诗级惊悚片——一个神秘之人必须冒着毁灭世界的危险来拯救世界。', descEn: "Christopher Nolan's 'Oppenheimer' centers on Cillian Murphy as Robert Oppenheimer, 'father of the atomic bomb', adapted from the Pulitzer-winning biography 'American Prometheus'. An epic thriller about a mysterious man who must risk destroying the world in order to save it." },
      ],
    },
    {
      key: 'games',
      title: 'games · 游戏',
      titleEn: 'games · Games',
      items: [
        { name: 'Minecraft', img: '/covers/minecraft.png', site: 'https://www.minecraft.net', desc: '微软旗下 Mojang Studios 开发的沙盒游戏：在方块世界里探索、采集、建造与生存冒险。', descEn: "Mojang Studios' sandbox game under Microsoft: explore, gather, build and survive in a world of blocks." },
        { name: 'Mindustry', img: '/covers/mindustry.jpg', site: 'https://mindustrygame.github.io', desc: '一款结合即时战略与塔防要素的开放式工厂管理游戏。', descEn: 'An open-ended factory management game blending real-time strategy with tower defense.' },
        { name: 'Stellaris', img: '/covers/stellaris.jpg', site: 'https://www.paradoxinteractive.com/games/stellaris/about', desc: 'Paradox 出品的科幻大型战略游戏：探索浩瀚银河，与外星种族互动，扩大你帝国的影响力。', descEn: "Paradox's grand sci-fi strategy: explore the galaxy, meet alien races, and expand your empire's influence." },
        { name: 'Dancing Line', img: '/covers/dancingline.jpg', site: 'https://store.steampowered.com/app/4395300/', desc: '随着音乐引导一条无限延伸的线条穿过不同环境，点一下屏幕以转弯，避开障碍物。', descEn: 'Guide an endlessly extending line through different environments in time with the music — tap to turn, dodge the obstacles.' },
        { name: 'Among Us', img: '/covers/amongus.jpg', site: 'https://www.innersloth.com/games/among-us/', desc: '4 到 15 名玩家的派对游戏，相互合作与背叛……一切都发生在太空之中！', descEn: 'A party game for 4–15 players of cooperation and betrayal… all in space!' },
        { name: 'Phigros', img: '/covers/phigros.webp', site: 'https://pigeon-games.com', desc: '鸽游开发发行的非商业音乐游戏，带有收集和解谜要素。', descEn: 'A non-commercial rhythm game by Pigeon Games, with collectible and puzzle elements.' },
        { name: 'Clash Royale', img: '/covers/clashroyale.webp', site: 'https://clashroyale.com', desc: 'Supercell 开发的即时战略手游：收集卡牌组建牌组，在几分钟的对战中攻守对决。', descEn: "Supercell's real-time strategy mobile game: collect cards, build your deck, and duel in minutes-long battles." },
        { name: 'Seven years later', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1562920/library_600x900.jpg', site: 'https://store.steampowered.com/app/1562920/', desc: '生活片段故事风格的冒险游戏，3D 像素画面与时间跳跃元素，陪伴 Haruto 寻找七年前失去的记忆。', descEn: 'A slice-of-life adventure with 3D pixel art and time-jump elements — accompany Haruto in search of the memories he lost seven years ago.' },
        { name: '魔法少女的魔女审判', nameEn: 'Witch Trial of the Magical Girls', img: '/covers/witchtrial.jpg', site: 'https://store.steampowered.com/app/3101040/', desc: '魔法辩论×悬疑 ADV：在残酷的死亡游戏中击破魔法与谎言的幻影，揪出混入少女之中的“魔女”。', descEn: "Magic debate × mystery ADV: in a deadly game, shatter the illusions of magic and lies, and unmask the 'witch' hiding among the girls." },
        { name: 'PEAK', img: '/covers/peak.jpg', site: 'https://store.steampowered.com/app/3527290/', desc: '需要细致合作的登山游戏：作为流落神秘岛屿的探险家，唯一获救的希望是登上那座巍峨的山峰。', descEn: 'A climbing game demanding careful cooperation: as explorers stranded on a mysterious island, your only hope of rescue is to scale that towering peak.' },
      ],
    },
    {
      key: 'vtubers',
      title: 'vtubers · 主播',
      titleEn: 'vtubers · Streamers',
      items: [
        { name: 'vedal987（Neuro-sama）', nameEn: 'vedal987 (Neuro-sama)', img: '/covers/neurosama-banner.webp', desc: '', site: 'https://www.twitch.tv/vedal987' },
      ],
    },
    {
      key: 'vocaloid',
      title: 'vocaloid · 术力口',
      titleEn: 'vocaloid · Vocaloid',
      items: [
        { name: 'YES or NO（雨衣 × 重音テト）', nameEn: 'YES or NO (Raincoat × Kasane Teto)', img: '', desc: '', yt: 'IJoMYSNsgEo' },
        { name: 'Fake Dance（雨衣 × 重音テト）', nameEn: 'Fake Dance (Raincoat × Kasane Teto)', img: '', desc: '', yt: '2HRW4aNgx6U' },
        { name: 'MESMERIZER（Bao & Neuro 英语翻唱）', nameEn: 'MESMERIZER (English cover by Bao & Neuro)', img: '', desc: '', yt: 'qhmeWiZg3cA' },
      ],
    },
  ] as AboutSection[],

  byf: [
    '目前忙于学业，回复可能较慢。',
    '关注后我会回查你的账号：发言涉及极端政治或偏激内容的，可能会被我屏蔽。',
    '与我交流可用中文或英文（Chinese & English both welcome）。',
  ],
  byfEn: [
    'Busy with school — replies may be slow.',
    'I may check your account after you follow: extreme politics or radical content might get you blocked.',
    'You can talk to me in Chinese or English (both welcome).',
  ],
  dni: [] as string[],

  reachout: '欢迎合作与交流：开源项目、网站开发、有趣的 AI 想法。',
  reachoutEn: 'Open to collaboration: open-source projects, website development, interesting AI ideas.',

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
  learningEn: [
    'AI/ML',
    'LLM apps & agents',
    'Full-stack (React + Node)',
  ],

  bannerUrl: 'https://kannalife.github.io/for-infinite-web/banner.webp',
};

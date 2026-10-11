export interface ServiceRow {
  type: string;
  scope: string;
  price: string;
}

export const services = {
  status: 'open',
  tagline: '目前不接新委托，开放状态以后更新。',

  rows: [
    { type: '小工具脚本', scope: 'Python / Shell 自动化', price: '面议' },
    { type: '静态网页', scope: '单页 / 多页展示站', price: '面议' },
    { type: '网页改版', scope: '样式与布局重构', price: '面议' },
  ] as ServiceRow[],

  rushNote: '加急（48 小时内）+ 20~30%',
  turnaroundNote: '工期：1 周起',

  dos: ['清晰的需求说明', '参考图 / 参考站', '预留充足沟通时间'],
  donts: ['需求反复横跳', '没有截止期的"随便"', '要求直接抄他人成品'],

  terms: [
    '开工前需 50% 定金，交付前结清尾款。',
    '工期视需求复杂度而定，约 1 周起步。',
    '交付后小修免费，大改另议。',
    '成果默认可署名展示，除非另有约定。',
  ],

  faq: [
    { question: '怎么联系？', answer: '主页的联系方式里发邮件，附上需求说明。' },
    { question: '接什么类型的活？', answer: '以脚本、静态站、网页改版为主，其他可谈。' },
  ],
};

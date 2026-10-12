export interface ServiceRow {
  type: string;
  scope: string;
  price: string;
  discounted?: string;
}

export const services = {
  status: 'closed' as 'open' | 'closed',
  tagline: '服务内容整理中，敬请期待。',
  discountNote: '',

  rows: [] as ServiceRow[],

  rushNote: '',
  turnaroundNote: '',

  dos: [] as string[],
  donts: [] as string[],

  terms: [] as string[],

  faq: [] as { question: string; answer: string }[],
};

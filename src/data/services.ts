export interface ServiceRow {
  type: string;
  typeEn?: string;
  scope: string;
  scopeEn?: string;
  price: string;
  discounted?: string;
}

export const services = {
  status: 'closed' as 'open' | 'closed',
  tagline: '服务内容整理中，敬请期待。',
  taglineEn: 'Services are being organized — stay tuned.',
  discountNote: '',
  discountNoteEn: '',

  rows: [] as ServiceRow[],

  rushNote: '',
  rushNoteEn: '',
  turnaroundNote: '',
  turnaroundNoteEn: '',

  dos: [] as string[],
  dosEn: [] as string[],
  donts: [] as string[],
  dontsEn: [] as string[],

  terms: [] as string[],
  termsEn: [] as string[],

  faq: [] as { question: string; questionEn?: string; answer: string; answerEn?: string }[],
};

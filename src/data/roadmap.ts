export interface RoadmapItem {
  text: string;
  status: 'done' | 'now' | 'next';
}

export const roadmap: { phase: string; items: RoadmapItem[] }[] = [
  {
    phase: '已点亮',
    items: [
      { text: '前端站点上线', status: 'done' },
      { text: '末地风像素主题', status: 'done' },
    ],
  },
  {
    phase: '进行中',
    items: [
      { text: '后端迁移新家', status: 'now' },
      { text: '内容填充与打磨', status: 'now' },
    ],
  },
  {
    phase: '未来',
    items: [
      { text: '像素字体子集化提速', status: 'next' },
      { text: '更多隐藏彩蛋', status: 'next' },
    ],
  },
];

// 时间换算：世界观年（0 年 = 2008 年 6 月；1 年 = 现实 1 个月）

export function toWorldYear(date: Date): number {
  return (date.getFullYear() - 2008) * 12 + (date.getMonth() - 5);
}

export function nowWorldYear(): number {
  return toWorldYear(new Date());
}

/** 世界观年 → 大致真实年份（仅用于展示辅助） */
export function worldYearToReal(year: number): string {
  const total = year + 2008 * 12 + 5; // 还原为总月数
  const y = Math.floor(total / 12);
  const m = total % 12;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

export function toWorldYear(date: Date): number {
  return (date.getFullYear() - 2008) * 12 + (date.getMonth() - 5);
}

export function nowWorldYear(): number {
  return toWorldYear(new Date());
}

export function worldYearToReal(year: number): string {
  const total = year + 2008 * 12 + 5;
  const y = Math.floor(total / 12);
  const m = total % 12;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

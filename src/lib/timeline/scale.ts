import { scaleLinear } from 'd3-scale';

export type YearScale = ReturnType<typeof scaleLinear>;

export function createYearScale(domain: [number, number], range: [number, number]): YearScale {
  return scaleLinear().domain(domain).range(range).nice() as YearScale;
}

export function formatYear(year: number): string {
  const abs = Math.abs(year);
  if (year < 0) return `${abs} BCE`;
  return `${abs} CE`;
}

export function formatYearShort(year: number): string {
  const abs = Math.abs(year);
  const suffix = year < 0 ? ' BCE' : ' CE';
  if (abs >= 1000) return `${abs}${suffix}`;
  const decade = Math.floor(abs / 10) * 10;
  return `${decade}'${suffix}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

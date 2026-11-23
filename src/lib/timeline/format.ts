export function fmtYear(y: number): string {
  return y < 0 ? `${-y} BCE` : `${y} CE`;
}

export function fmtRange(start: number, end: number): string {
  return `${fmtYear(start)} &ndash; ${fmtYear(end)} (${Math.abs(end - start)} years)`;
}

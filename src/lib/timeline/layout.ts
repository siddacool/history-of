import type { TimelineEvent, TimelineEra } from './types.js';
import { formatYear } from './scale.js';
import type { YearScale } from './scale.js';

export const LOD = {
  weight3: 0,
  weight2: 0.008,
  weight1: 0.04,
} as const;

export const TICK_TARGET_PX = 110;
export const LABEL_ROW_HEIGHT = 22;
export const LABEL_PADDING = 6;
export const STEM_LENGTH = 16;
export const DOT_RADIUS = 3.5;
export const ERA_BAR_HEIGHT = 24;
export const ERA_LANE_GAP = 6;

export interface ComputedTick {
  year: number;
  label: string;
  x: number;
}

export interface PlacedEvent {
  event: TimelineEvent;
  x: number;
  labelWidth: number;
  row: number;
  hitBox: { x0: number; y0: number; x1: number; y1: number };
}

export interface PlacedEra {
  era: TimelineEra;
  lane: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  hitBox: { x0: number; y0: number; x1: number; y1: number };
  labelFit: boolean;
}

export interface LayoutResult {
  ticks: ComputedTick[];
  events: PlacedEvent[];
  eras: PlacedEra[];
  numEraLanes: number;
  yearRange: [number, number];
}

export function niceTickStep(domainSpan: number, availablePx: number): number {
  const targetCount = availablePx / TICK_TARGET_PX;
  const rawStep = domainSpan / targetCount;
  if (rawStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const candidates = [1, 2, 5, 10];
  let step = magnitude * 10;
  for (const c of candidates) {
    const s = c * magnitude;
    if (s >= rawStep) {
      step = s;
      break;
    }
  }
  return step;
}

export function computeTicks(
  scale: YearScale,
  visibleDomain: [number, number],
  availablePx: number,
): ComputedTick[] {
  const [v0, v1] = visibleDomain;
  const step = niceTickStep(v1 - v0, availablePx);
  const start = Math.ceil(v0 / step) * step;
  const end = Math.floor(v1 / step) * step;
  const ticks: ComputedTick[] = [];
  for (let y = start; y <= end; y += step) {
    if (y === 0) continue;
    ticks.push({
      year: y,
      label: formatYear(y),
      x: scale(y),
    });
  }
  return ticks;
}

function packEraLanes(
  eras: TimelineEra[],
  scale: YearScale,
): { lane: number; x0: number; x1: number }[] {
  const sorted = [...eras].sort((a, b) => a.start - b.start || a.end - b.end);
  const laneEnds: number[] = [];
  const result: { lane: number; x0: number; x1: number }[] = [];

  for (const era of sorted) {
    let placed = -1;
    for (let li = 0; li < laneEnds.length; li++) {
      if (laneEnds[li] <= era.start) {
        placed = li;
        break;
      }
    }
    if (placed === -1) {
      placed = laneEnds.push(era.end) - 1;
    } else {
      laneEnds[placed] = era.end;
    }
    result.push({ lane: placed, x0: scale(era.start), x1: scale(era.end) });
  }
  return result;
}

export function layout(
  events: TimelineEvent[],
  eras: TimelineEra[],
  scale: YearScale,
  visibleDomain: [number, number],
  viewportPx: number,
  titleWidth: (title: string) => number,
): LayoutResult {
  const [v0, v1] = visibleDomain;
  const ticks = computeTicks(scale, visibleDomain, viewportPx);

  const pxPerYear = viewportPx / (v1 - v0);

  // Binary search visible range (events pre-sorted by year)
  const lo = events.findIndex((e) => e.year >= v0);
  const hi = events.findLastIndex((e) => e.year <= v1);
  const candidates = lo === -1 || hi === -1 ? [] : events.slice(lo, hi + 1);

  const rowMaxRight: number[] = [];
  const placedEvents: PlacedEvent[] = [];

  for (const ev of candidates) {
    if (ev.year < v0 || ev.year > v1) continue;
    if (ev.weight === 2 && pxPerYear < LOD.weight2) continue;
    if (ev.weight === 1 && pxPerYear < LOD.weight1) continue;

    const x = scale(ev.year);
    const labelWidth = titleWidth(ev.title);
    const halfW = labelWidth / 2;
    const labelX0 = x - halfW;
    const labelX1 = x + halfW;

    let placedRow = -1;
    for (let r = 0; r < rowMaxRight.length; r++) {
      if (labelX0 >= rowMaxRight[r] + LABEL_PADDING) {
        placedRow = r;
        rowMaxRight[r] = labelX1;
        break;
      }
    }
    if (placedRow === -1) {
      placedRow = rowMaxRight.push(labelX1) - 1;
    }

    placedEvents.push({
      event: ev,
      x,
      labelWidth,
      row: placedRow,
      hitBox: { x0: x - 12, y0: -STEM_LENGTH - DOT_RADIUS, x1: x + 12, y1: DOT_RADIUS },
    });
  }

  const lanePlacements = packEraLanes(eras, scale);
  const numEraLanes =
    lanePlacements.length > 0 ? Math.max(...lanePlacements.map((p) => p.lane)) + 1 : 0;

  const placedEras: PlacedEra[] = eras.map((era, i) => {
    const p = lanePlacements[i];
    const x0 = p.x0;
    const x1 = p.x1;
    const barWidth = x1 - x0;
    const labelWidth = titleWidth(era.title);
    const labelFit = labelWidth + 10 <= barWidth;
    const y0 = p.lane * (ERA_BAR_HEIGHT + ERA_LANE_GAP);
    const y1 = y0 + ERA_BAR_HEIGHT;
    return { era, lane: p.lane, x0, x1, y0, y1, hitBox: { x0, y0, x1, y1 }, labelFit };
  });

  return {
    ticks,
    events: placedEvents,
    eras: placedEras,
    numEraLanes,
    yearRange: [v0, v1],
  };
}

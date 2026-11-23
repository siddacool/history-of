<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '@flightlesslabs/dodo-ui';
  import Icon from '@iconify/svelte';
  import { createYearScale } from './scale.js';
  import { fmtYear } from './format.js';
  import { layout, LABEL_ROW_HEIGHT, DOT_RADIUS, ERA_BAR_HEIGHT, ERA_LANE_GAP } from './layout.js';
  import type { TimelineEvent, TimelineEra, SelectedItem } from './types.js';
  import eventsData from '../data/events.json';
  import erasData from '../data/eras.json';
  import InfoPanel from './InfoPanel.svelte';

  const events: TimelineEvent[] = eventsData as TimelineEvent[];
  const eras: TimelineEra[] = erasData as TimelineEra[];

  let canvas: HTMLCanvasElement | null = null;
  let W = 0,
    H = 0;
  let cx = 0,
    s = 0.08;
  const MINY = -3500,
    MAXY = 2100;
  let sel = $state<SelectedItem>(null);

  function toY(px: number) {
    return (px - W / 2) / s + cx;
  }

  function fitAll() {
    s = Math.max(W / (MAXY - MINY + 300), 0.02);
    cx = (MINY + MAXY) / 2;
    draw();
  }

  function resize() {
    if (!canvas) return;
    const d = window.devicePixelRatio || 1;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * d;
    canvas.height = H * d;
    const g = canvas.getContext('2d')!;
    g.setTransform(d, 0, 0, d, 0, 0);
    draw();
  }

  const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  let lastHits: { x0: number; y0: number; x1: number; y1: number; item: SelectedItem }[] = [];

  function applyTheme() {
    const root = document.documentElement;
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dodo-theme--dark', dark);
    draw();
  }

  function draw() {
    if (!canvas) return;
    const g = canvas.getContext('2d')!;
    const bg = css('--dodo-color-neutral-50') || '#faf8f4';
    const fg = css('--dodo-color-neutral-900') || '#1f1d1a';
    const mut = css('--dodo-color-neutral-500') || '#6f6a62';
    const line = css('--dodo-color-neutral-200') || '#cfc8bb';
    const acc = css('--dodo-color-primary-600') || '#b4442b';

    g.clearRect(0, 0, W, H);
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // Axis at 30% from top
    const ay = Math.round(H * 0.3);
    const hits: { x0: number; y0: number; x1: number; y1: number; item: SelectedItem }[] = [];

    const scale = createYearScale([MINY, MAXY], [0, W]);
    scale.domain([toY(0), toY(W)]);

    const visibleDomain: [number, number] = [toY(0), toY(W)];
    const titleWidth = (t: string) => g.measureText(t).width;
    const result = layout(events, eras, scale, visibleDomain, W, titleWidth);

    // axis + ticks
    g.strokeStyle = line;
    g.fillStyle = mut;
    g.font = '11px system-ui,sans-serif';
    g.textAlign = 'center';
    g.lineWidth = 1;
    for (const t of result.ticks) {
      const x = Math.round(t.x) + 0.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H);
      g.globalAlpha = 0.35;
      g.stroke();
      g.globalAlpha = 1;
      g.fillText(t.label, x, ay + 14);
    }
    g.strokeStyle = fg;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, ay);
    g.lineTo(W, ay);
    g.stroke();

    // eras (below axis)
    g.textAlign = 'left';
    g.font = '12px system-ui,sans-serif';
    const laneHeight = ERA_BAR_HEIGHT + ERA_LANE_GAP;
    for (const pe of result.eras) {
      const e = pe.era;
      if (pe.x1 < 0 || pe.x0 > W) continue;
      const y = ay + 28 + pe.lane * laneHeight;
      const h = ERA_BAR_HEIGHT,
        l = Math.max(pe.x0, -5),
        r = Math.min(pe.x1, W + 5);
      const hue = (pe.lane * 47 + 10) % 360;
      const isSel = sel?.type === 'era' && sel.id === e.id;
      g.fillStyle = `hsla(${hue},55%,55%,${isSel ? 0.95 : 0.7})`;
      g.beginPath();
      g.roundRect(l, y, r - l, h, 5);
      g.fill();
      g.save();
      g.beginPath();
      g.rect(l, y, r - l, h);
      g.clip();
      g.fillStyle = '#111';
      g.fillText(e.title, Math.max(l, 0) + 6, y + 14);
      g.restore();
      hits.push({ x0: l, y0: y, x1: r, y1: y + h, item: { type: 'era', id: e.id } });
    }

    // events (above axis)
    g.font = '12px system-ui,sans-serif';
    const minW = s > 0.3 ? 1 : s > 0.06 ? 2 : 3;
    for (const pe of result.events) {
      const e = pe.event;
      const px = pe.x;
      if (px < -250 || px > W + 10) continue;
      const isSel = sel?.type === 'event' && sel.id === e.id;
      g.fillStyle = acc;
      g.beginPath();
      g.arc(px, ay, isSel ? 6 : DOT_RADIUS, 0, 7);
      g.fill();
      hits.push({
        x0: px - 8,
        y0: ay - 8,
        x1: px + 8,
        y1: ay + 8,
        item: { type: 'event', id: e.id },
      });
      if (e.weight < minW && !isSel) continue;
      const tw = pe.labelWidth;
      const ly = ay - 26 - pe.row * LABEL_ROW_HEIGHT;
      g.strokeStyle = acc;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(px + 0.5, ay);
      g.lineTo(px + 0.5, ly + 18);
      g.stroke();
      g.fillStyle = isSel ? acc : bg;
      g.strokeStyle = acc;
      g.beginPath();
      g.roundRect(px - 4, ly, tw + 16, 20, 5);
      g.fill();
      g.stroke();
      g.fillStyle = isSel ? '#fff' : fg;
      g.fillText(e.title, px + 4, ly + 14);
      hits.push({
        x0: px - 4,
        y0: ly,
        x1: px + tw + 16,
        y1: ly + 20,
        item: { type: 'event', id: e.id },
      });
    }

    lastHits = hits;

    g.fillStyle = mut;
    g.textAlign = 'right';
    g.font = '11px system-ui,sans-serif';
    g.fillText(
      fmtYear(Math.round(toY(0))) + '  to  ' + fmtYear(Math.round(toY(W))),
      W - 10,
      H - 10,
    );
  }

  function zoom(f: number, mx?: number) {
    const m = mx == null ? W / 2 : mx;
    const yr = toY(m);
    s = Math.min(60, Math.max(Math.max(W / 12000, 0.01), s * f));
    cx = yr - (m - W / 2) / s;
    draw();
  }

  function pick(mx: number, my: number) {
    for (let i = lastHits.length - 1; i >= 0; i--) {
      const h = lastHits[i];
      if (mx >= h.x0 && mx <= h.x1 && my >= h.y0 && my <= h.y1) return h.item;
    }
    return null;
  }

  function show(item: SelectedItem) {
    sel = item;
    draw();
  }

  let down: { x: number } | null = null;
  let moved = 0;

  onMount(() => {
    if (!canvas) return;
    resize();
    fitAll();
    applyTheme();

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      down = { x: e.clientX };
      moved = 0;
      canvas!.setPointerCapture(e.pointerId);
      canvas!.classList.add('drag');
    });
    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      down.x = e.clientX;
      moved += Math.abs(dx);
      cx -= dx / s;
      draw();
    });
    canvas.addEventListener('pointerup', (e: PointerEvent) => {
      canvas!.classList.remove('drag');
      if (down && moved < 4) {
        const r = canvas!.getBoundingClientRect();
        show(pick(e.clientX - r.left, e.clientY - r.top));
      }
      down = null;
    });
    canvas.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        const r = canvas!.getBoundingClientRect();
        zoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left);
      },
      { passive: false },
    );

    window.addEventListener('resize', () => {
      resize();
      fitAll();
    });

    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
  });
</script>

<div class="shell">
  <div class="toolbar">
    <Button onclick={fitAll} compact aria-label="Fit all" title="Fit all" variant="text">
      <Icon icon="mdi:zoom-fit" />
    </Button>
  </div>

  <div class="wrap">
    <canvas
      bind:this={canvas}
      style="width:100%;height:100%;display:block;cursor:grab;"
      class="canvas"
    ></canvas>
  </div>

  <InfoPanel {sel} on:close={() => show(null)} />
</div>

<style>
  .shell {
    margin: 0;
    padding: 0;
    position: fixed;
    inset: 0;
    background: var(--dodo-color-neutral-50, #faf8f4);
    color: var(--dodo-color-neutral-900, #1f1d1a);
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
    overflow: hidden;
  }
  .toolbar {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  .wrap {
    position: absolute;
    top: 52px;
    bottom: 52px;
    left: 0;
    right: 0;
    overflow: hidden;
  }
  .canvas {
    cursor: grab;
    touch-action: none;
  }
</style>

<script lang="ts">
  import type { SelectedItem, TimelineEvent, TimelineEra } from '../timeline/types.js';
  import eventsData from '../data/events.json';
  import erasData from '../data/eras.json';

  let { selected, onclose }: { selected: SelectedItem; onclose: () => void } = $props();

  const events = eventsData as TimelineEvent[];
  const eras = erasData as TimelineEra[];

  const item = $derived.by(() => {
    if (!selected) return null;
    if (selected.type === 'event') return events.find((e) => e.id === selected.id) ?? null;
    return eras.find((e) => e.id === selected.id) ?? null;
  });

  function formatYear(year: number): string {
    const abs = Math.abs(year);
    return year < 0 ? `${abs} BCE` : `${abs} CE`;
  }

  function isEvent(item: TimelineEvent | TimelineEra): item is TimelineEvent {
    return 'year' in item;
  }

  function formatRange(item: TimelineEvent | TimelineEra): string {
    if (isEvent(item)) return formatYear(item.year);
    const start = formatYear(item.start);
    const end = formatYear(item.end);
    const dur = Math.abs(item.end - item.start);
    return `${start} \u2013 ${end} (${dur} years)`;
  }
</script>

<div class="details-overlay" onclick={onclose}>
  <div class="details-panel" onclick={(e) => e.stopPropagation()}>
    <button class="close-btn" onclick={onclose}>×</button>
    {#if item}
      <h2>{item.title}</h2>
      <p class="year">{formatRange(item)}</p>
      {#if item.description}
        <p class="desc">{item.description}</p>
      {/if}
      {#if item.tags && item.tags.length}
        <div class="tags">
          {#each item.tags as tag (tag)}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .details-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    z-index: 50;
    backdrop-filter: blur(4px);
  }
  .details-panel {
    background: var(--panel, #ffffff);
    color: var(--panel-foreground, #090909);
    border: 1px solid var(--border, #e4e4e7);
    border-radius: 12px;
    padding: 24px;
    width: min(420px, 92vw);
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.35);
  }
  .close-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    background: none;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: var(--muted-foreground, #71717a);
    padding: 2px 8px;
    border-radius: 6px;
  }
  .close-btn:hover {
    background: var(--muted, #f4f4f5);
  }
  h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
  }
  .year {
    color: var(--muted-foreground, #71717a);
    font-size: 13px;
    margin: 0 0 12px 0;
    font-weight: 600;
  }
  .desc {
    color: var(--foreground, #090909);
    font-size: 14px;
    line-height: 1.55;
    margin: 0 0 14px 0;
  }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .tag {
    background: var(--muted, #f4f4f5);
    color: var(--muted-foreground, #475569);
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 11px;
    font-weight: 600;
  }
</style>

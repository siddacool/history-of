<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SelectedItem, TimelineEvent, TimelineEra } from './types.js';
  import eventsData from '../data/events.json';
  import erasData from '../data/eras.json';
  import { fmtYear, fmtRange } from './format.js';

  const dispatch = createEventDispatcher<{ close: void }>();

  let { sel }: { sel: SelectedItem } = $props();

  const events: TimelineEvent[] = eventsData as TimelineEvent[];
  const eras: TimelineEra[] = erasData as TimelineEra[];

  function selectedTitle() {
    if (!sel) return '';
    if (sel.type === 'event') return events.find((e) => e.id === sel.id)?.title ?? '';
    return eras.find((e) => e.id === sel.id)?.title ?? '';
  }

  function selectedRange() {
    if (!sel) return '';
    if (sel.type === 'event') {
      const e = events.find((ev) => ev.id === sel.id);
      return e ? fmtYear(e.year) : '';
    }
    const era = eras.find((e) => e.id === sel.id);
    if (!era) return '';
    return fmtRange(era.start, era.end);
  }

  function selectedDesc() {
    if (!sel) return '';
    if (sel.type === 'event') {
      const e = events.find((ev) => ev.id === sel.id);
      return e?.description ?? '';
    }
    return eras.find((e) => e.id === sel.id)?.description ?? '';
  }

  function selectedImage() {
    if (!sel) return '';
    if (sel.type === 'event') {
      const e = events.find((ev) => ev.id === sel.id);
      return e?.image ?? '';
    }
    return eras.find((e) => e.id === sel.id)?.image ?? '';
  }
</script>

<div class="info-panel">
  {#if sel}
    <div class="info-header">
      {#if sel.type === 'event'}
        <span class="info-tag">Event</span>
      {:else}
        <span class="info-tag">Era</span>
      {/if}
      <button class="close-btn" onclick={() => dispatch('close')} title="Close">×</button>
    </div>
    <h2>{selectedTitle()}</h2>
    <p class="info-range">{selectedRange()}</p>
    {#if selectedImage()}
      <img class="info-img" src={selectedImage()} alt={selectedTitle()} />
    {/if}
    <div class="info-desc" style="max-height: 200px; overflow-y: auto;">
      {selectedDesc()}
    </div>
  {:else}
    <div class="info-empty">
      <span>Select an event or era</span>
      <p>Details appear here.</p>
    </div>
  {/if}
</div>

<style>
  .info-panel {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    padding: 16px;
    border: 1px solid var(--dodo-color-neutral-200, #cfc8bb);
    border-radius: 12px;
    background: var(--dodo-color-white, #fff);
    z-index: 10;
    max-height: 260px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .info-panel .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .info-panel .info-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dodo-color-primary-600, #b4442b);
    font-weight: 600;
    background: var(--dodo-color-primary-50, #f3e8f0);
    padding: 2px 8px;
    border-radius: 4px;
  }
  .info-panel .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    color: var(--dodo-color-neutral-400, #9a948a);
    padding: 0 4px;
  }
  .info-panel .close-btn:hover {
    color: var(--dodo-color-neutral-900, #1f1d1a);
  }
  .info-panel h2 {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--dodo-color-neutral-900, #1f1d1a);
  }
  .info-panel .info-range {
    margin: 0 0 4px 0;
    font-size: 12px;
    color: var(--dodo-color-neutral-500, #6f6a62);
    font-weight: 500;
  }
  .info-panel .info-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--dodo-color-neutral-700, #3a373d);
    margin: 0;
    overflow-y: auto;
    padding-right: 4px;
  }
  .info-panel .info-img {
    width: 100%;
    max-height: 160px;
    object-fit: cover;
    border-radius: 8px;
    margin: 8px 0;
    background: var(--dodo-color-neutral-50, #faf8f4);
  }
  .info-panel .info-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--dodo-color-neutral-500, #6f6a62);
    font-size: 13px;
    gap: 4px;
  }
  .info-panel .info-empty p {
    margin: 0;
    font-size: 11px;
    color: var(--dodo-color-neutral-400, #9a948a);
  }
</style>

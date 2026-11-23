<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Orientation, Theme } from './types.js';

  const dispatch = createEventDispatcher<{
    themeChange: Theme;
    orientationChange: Orientation;
    close: void;
  }>();

  let { theme, orientation }: { theme: Theme; orientation: Orientation } = $props();

  function setTheme(next: Theme) {
    dispatch('themeChange', next);
    dispatch('close');
  }

  function setOrientation(next: Orientation) {
    dispatch('orientationChange', next);
    dispatch('close');
  }
</script>

<div class="settings-overlay" onclick={() => dispatch('close')}>
  <div class="settings-panel" onclick={(e) => e.stopPropagation()}>
    <h3>Settings</h3>
    <div class="settings-section">
      <label>Theme</label>
      <div class="settings-options">
        <button class={theme === 'auto' ? 'active' : ''} onclick={() => setTheme('auto')}>
          Auto
        </button>
        <button class={theme === 'light' ? 'active' : ''} onclick={() => setTheme('light')}>
          Light
        </button>
        <button class={theme === 'dark' ? 'active' : ''} onclick={() => setTheme('dark')}>
          Dark
        </button>
      </div>
    </div>
    <div class="settings-section">
      <label>Orientation</label>
      <button
        class={orientation === 'horizontal' ? 'active' : ''}
        onclick={() => setOrientation('horizontal')}
      >
        Horizontal
      </button>
      <button
        class={orientation === 'vertical' ? 'active' : ''}
        onclick={() => setOrientation('vertical')}
      >
        Vertical
      </button>
    </div>
    <button class="btn settings-close" onclick={() => dispatch('close')}>Done</button>
  </div>
</div>

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    z-index: 50;
    backdrop-filter: blur(4px);
  }
  .settings-panel {
    background: var(--dodo-color-white, #fff);
    color: var(--dodo-color-neutral-900, #1f1d1a);
    border: 1px solid var(--dodo-color-neutral-200, #cfc8bb);
    border-radius: 12px;
    padding: 24px;
    width: min(320px, 92vw);
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.35);
  }
  .settings-panel h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }
  .settings-section {
    margin-bottom: 16px;
  }
  .settings-section:last-child {
    margin-bottom: 0;
  }
  .settings-section label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dodo-color-neutral-500, #6f6a62);
    margin-bottom: 8px;
  }
  .settings-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .settings-options button {
    background: var(--dodo-color-neutral-50, #faf8f4);
    color: var(--dodo-color-neutral-700, #3a373d);
    border: 1px solid var(--dodo-color-neutral-200, #cfc8bb);
    border-radius: 8px;
    padding: 8px 12px;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
  }
  .settings-options button.active {
    background: var(--dodo-color-primary-600, #b4442b);
    color: #fff;
    border-color: var(--dodo-color-primary-600, #b4442b);
  }
  .settings-options button:hover:not(.active) {
    border-color: var(--dodo-color-primary-600, #b4442b);
  }
  .settings-close {
    margin-top: 16px;
    width: 100%;
    justify-content: center;
  }
</style>

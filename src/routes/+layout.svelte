<script lang="ts">
  import { browser } from '$app/env';
  import '@flightlesslabs/dodo-ui/styles/global.css';

  let dark = $state(browser ? matchMedia('(prefers-color-scheme: dark)').matches : false);

  function applyTheme() {
    if (!browser) return;
    const root = document.documentElement;
    root.classList.toggle('dodo-theme--dark', dark);
  }

  $effect(() => {
    if (!browser) return;
    applyTheme();
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      dark = mq.matches;
      applyTheme();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });
</script>

<div class="app" style="position:fixed;inset:0;">
  <main class="page">
    <slot />
  </main>
</div>

<style>
  :global(html) {
    background: var(--dodo-color-neutral-50);
    color: var(--dodo-color-neutral-900);
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
    height: 100%;
  }
  :global(body) {
    margin: 0;
    background: inherit;
    color: inherit;
    height: 100%;
  }
  .app {
    height: 100%;
    width: 100%;
  }
  .page {
    height: 100%;
    width: 100%;
  }
</style>

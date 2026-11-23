<script lang="ts">
  import Timeline from '../lib/timeline/Timeline.svelte';
</script>

<div class="page-wrap">
  <Timeline orientation="horizontal" />
</div>

<style>
  .page-wrap {
    height: calc(100vh - 48px);
    width: 100vw;
  }
</style>

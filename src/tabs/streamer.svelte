<style src="../styles/streamer.scss"></style>

<script lang="ts">
	import Toggle from "../components/Toggle.svelte";
	import { hideBalance } from "../data/hide-balance";
</script>

<div class="options">
	<div class="option">
		<div class="label">Hide Balance</div>
		<Toggle bind:value={$hideBalance} />
	</div>
</div>
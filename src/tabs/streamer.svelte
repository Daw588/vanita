<style src="../styles/streamer.scss"></style>

<script lang="ts">
	import Toggle from "../components/toggle.svelte";
	import { hideBalance } from "../data/hide-balance";
	import { hideAds } from "../data/hide-ads";
</script>

<div class="options">
	<div class="option">
		<div class="label">Hide Balance</div>
		<Toggle bind:value={$hideBalance} />
	</div>
	<div class="option">
		<div class="label">Hide Advertisements</div>
		<Toggle bind:value={$hideAds} />
	</div>
</div>
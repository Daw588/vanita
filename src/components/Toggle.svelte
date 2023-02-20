<style src="../styles/toggle.scss"></style>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let value = false;

	const dispatch = createEventDispatcher<{ toggled: boolean }>();

	$: {
		dispatch("toggled", value);
	}
</script>

<label class="switch">
	<input type="checkbox" bind:checked={value} />
	<span class="slider" />
</label>

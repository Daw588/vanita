<script lang="ts">
	// import PrimaryButton from "../src/components/core/PrimaryButton.svelte";
	import Button from "../src/components/core/Button.svelte";
</script>

<div class="list">
	<Button />
</div>

<style lang="scss">
	:global(body) {
		background-color: #1e1e1e;
	}

	.list {
		display: flex;
		gap: 8px;
	}
</style>

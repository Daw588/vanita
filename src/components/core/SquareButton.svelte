<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let icon: string;

	type Events = {
		click: void
	}

	const dispatch = createEventDispatcher<Events>();

	function onClick() {
		dispatch("click");
	}
</script>

<button class="root" on:click={onClick}>
	<div class="icon">
		<span class="material-symbols-rounded">{icon}</span>
	</div>
</button>

<style lang="scss">
	.root {
		all: unset;

		&:focus {
			outline: revert;
		}

		&:hover {
			border-color: #4b4b4b;
		}

		padding: 4px;

		background-color: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(15px);
		border-radius: 4px;
		border: 1px solid transparent;
		transition:
			border-color 100ms ease
			opacity 100ms ease;

		cursor: pointer;

		.icon {
			display: flex;
			height: 18px;

			span {
				font-size: 18px;
			}
		}
	}
</style>
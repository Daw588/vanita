<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		open: boolean,
		onDismiss: () => void,
		children: Snippet
	}

	let { open, children, onDismiss }: Props = $props();
</script>

<div class="root" data-open={open}>
	<div class="sidebar">
		{@render children()}
	</div>
	<button class="backdrop" onclick={onDismiss} aria-label="Side drawer backdrop"></button>
</div>

<style lang="scss">
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;

		min-width: 100px;
		height: 100%;

		background-color: #171717;
		border-right: 1px solid #3a3a3a;
		z-index: 7;

		display: flex;

		// &[data-open=true] {
			
		// }

		transition: transform 100ms ease;
	}

	.backdrop {
		all: unset;

		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 6;

		width: 100%;
		height: 100%;

		background-color: rgba(0, 0, 0, 0.5);
		
		transition:
			opacity 100ms ease,
			visibility 100ms ease;
	}

	.root[data-open=false] {
		.sidebar {
			transform: translateX(-100%);
		}

		.backdrop {
			display: none;
			opacity: 1;
		}
	}
</style>

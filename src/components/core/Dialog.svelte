<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { openDialogs } from "../../lib/stores";

	const DEFAULT_Z_INDEX = 10;

	type Events = {
		dismiss: void
	}

	const dispatch = createEventDispatcher<Events>();

	export let open: boolean;
	export let zIndex: number | undefined = undefined;

	let initialOpenState: boolean | null = false;

	function onDialogOpened() {
		// If there is 0 dialogs opened, the z-index should match the default
		// When there is more dialogs opened, z-index + # of dialogs opened
		// This should ensure that latest dialog opened is always on top of everything
		zIndex = DEFAULT_Z_INDEX + $openDialogs;
		openDialogs.set($openDialogs + 1);
		// console.log("Dialog opened", $openDialogs, zIndex);
	}

	function onDialogClosed() {
		openDialogs.set($openDialogs - 1);
		// console.log("Dialog closed", $openDialogs, zIndex);
	}

	function dialogOpenStateChanged() {
		if (open) {
			onDialogOpened();
		} else {
			onDialogClosed();
		}
	}

	function dismiss() {
		dispatch("dismiss");
	}

	// Make sure we don't catch the initial state as a change
	// We don't want to initialize with negative amount of dialogs opened
	$: if (open !== initialOpenState) {
		initialOpenState = null; // Initial state is cleared, everything from now on is considered a change
		dialogOpenStateChanged();
	}
</script>

<div class="root" data-visible={open} style="z-index:{zIndex ?? DEFAULT_Z_INDEX};">
	<button class="backdrop" on:click={dismiss}></button>
	<div class="window">
		<slot></slot>
	</div>
</div>

<style lang="scss">
	.root {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		transition:
				visibility 120ms ease;

		&[data-visible=true] {
			visibility: visible;

			.window {
				transform: translateY(0);
			}
		}

		&[data-visible=false] {
			visibility: collapse;

			.window {
				transform: translateY(-100vh);
			}
		}

		.backdrop {
			all: unset;

			position: fixed;
			top: 0;
			left: 0;

			width: 100%;
			height: 100%;

			background-color: rgba(0, 0, 0, 0.5);
		}

		.window {
			z-index: 12;
			transition: transform 120ms ease-out;
		}
	}
</style>
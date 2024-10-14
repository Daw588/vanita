<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		label: string,
		children: Snippet
	}

	let { label, children }: Props = $props();

	let root: HTMLDivElement;
	let expanded = $state<boolean>(false);

	function toggle() {
		expanded = !expanded;
	}

	function onClicked(event: MouseEvent) { 
		if (!root.contains(event.target as Node | null)){
			// Clicked outside the div
			expanded = false;
		}
	}

	$effect(() => {
		if (expanded) {
			window.addEventListener("mousedown", onClicked);
		} else {
			window.removeEventListener("mousedown", onClicked);
		}
	});
</script>

<div class="root" bind:this={root}>
	<button class="button" onclick={toggle}>
		<div class="label">{label}</div>
		<div class="icon">
			<span class="material-symbols-rounded">{expanded ? "arrow_drop_up" : "arrow_drop_down"}</span>
		</div>
	</button>
	<div class="tray" data-expanded={expanded}>
		{@render children()}
	</div>
</div>

<style lang="scss">
	.root {
		position: relative;

		.button {
			all: unset;

			display: flex;
			flex-direction: row;
			gap: 5px;
			align-items: center;

			border: 1px solid #3a3a3a;
			border-radius: 4px;
			height: 27px;

			// cursor: pointer;

			&:hover {
				background-color: rgba(255, 255, 255, 0.05);
				border-color: #4b4b4b;
			}

			.label {
				flex-grow: 1;
				margin-left: calc(6px * 2);
			}

			.icon {
				display: flex;
				align-items: center;
				text-align: center;
				height: 18px;
				width: 18px;
				margin-right: 6px;

				span {
					width: 0;
					left: 0;
					font-size: 24px;
				}
			}
		}

		.tray {
			position: absolute;
			bottom: 0;
			right: 0;
			transform: translateY(calc(100% + 5px)); // TODO: Move the margin of 5px to the "bottom" property

			&[data-expanded=true] {
				visibility: visible;
			}

			&[data-expanded=false] {
				display: none;
				visibility: collapse;
			}

			box-shadow: 8.0px 16.0px 16.0px hsl(0deg 0% 0% / 0.25); // Elevation
			background-color: #171717;
			border: 1px solid #4b4b4b;
			border-radius: 8px;

			display: flex;
			flex-direction: column;
			gap: 3px;
			padding: 3px;
			min-width: 200px;
			z-index: 6;
		}
	}
</style>

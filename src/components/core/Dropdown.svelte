<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		label: string,
		anchor: "left" | "right",
		grow?: boolean,
		expanded?: boolean,
		children: Snippet
	}

	let { label, children, anchor, grow = false, expanded = $bindable(false) }: Props = $props();

	let root: HTMLDivElement;

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

<div>
	<div class="root" bind:this={root} data-anchor={anchor} data-expanded={expanded} data-grow={grow}>
		<button class="button" onclick={toggle}>
			<div class="label">{label}</div>
			<div class="icon">
				<span class="material-symbols-rounded">arrow_drop_down</span>
			</div>
		</button>
		<div class="tray">
			{@render children()}
		</div>
	</div>
</div>

<style lang="scss">
	.root {
		position: relative;
		display: flex;

		.button {
			all: unset;

			display: flex;
			flex-direction: row;
			gap: 5px;
			align-items: center;

			border: 1px solid #3a3a3a;
			border-radius: 4px;
			height: 27px;

			cursor: pointer;

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
				justify-content: center;
				height: 18px;
				width: 18px;
				margin-right: 6px;
				transition: transform 100ms ease;
				font-size: 24px;
			}
		}

		.tray {
			position: absolute;

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

		&[data-grow=true] {
			.button {
				flex-grow: 1;
			}
		}

		&[data-expanded=true] {
			.tray {
				visibility: visible;
			}

			.button .icon {
				transform: rotate(180deg);
			}
		}

		&[data-expanded=false] {
			.tray {
				display: none;
				visibility: collapse;
			}
		}

		&[data-anchor=left] {
			.tray {
				top: calc(100% + 5px);
				left: 0;
				// transform: translateY(calc(100% + 5px));
			}
		}

		&[data-anchor=right] {
			.tray {
				bottom: 0;
				right: 0;
				transform: translateY(calc(100% + 5px)); // TODO: Move the margin of 5px to the "bottom" property
			}
		}
	}
</style>

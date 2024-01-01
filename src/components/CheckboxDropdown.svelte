<script lang="ts">
	import Checkbox from "./Checkbox.svelte";

	type Item = {
		label: string,
		checked: boolean
	}

	export let items: Item[];
	export let label: string;
	export let emptyMessage: string; // e.g., "No items found"

	let root: HTMLDivElement;
	let expanded = false;

	function toggle() {
		expanded = !expanded;
	}

	function onClicked(event: MouseEvent) { 
		if (!root.contains(event.target as any)){
			// Clicked outside the div
			expanded = false;
		}
	}

	$: {
		if (expanded) {
			window.addEventListener("click", onClicked);
		} else {
			window.removeEventListener("click", onClicked);
		}
	}
</script>

<div class="root" bind:this={root}>
	<button class="button" on:click={toggle}>
		<div class="label">{label}</div>
		<div class="icon">
			<span class="material-symbols-rounded">{expanded ? "arrow_drop_up" : "arrow_drop_down"}</span>
		</div>
	</button>
	<div class="tray" data-expanded={expanded}>
		{#each items as item (item.label)}
			<div class="item">
				<Checkbox bind:checked={item.checked} />
				<div class="label">{item.label}</div>
			</div>
		{/each}

		{#if items.length === 0}
			<div class="info">{emptyMessage}</div>
		{/if}
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
			transform: translateY(calc(100% + 5px));

			&[data-expanded=true] {
				visibility: visible;
			}

			&[data-expanded=false] {
				display: none;
				visibility: collapse;
			}

			background-color: #171717;
			border: 1px solid #4b4b4b;
			border-radius: 8px;

			display: flex;
			flex-direction: column;
			gap: 3px;
			padding: 3px;
			min-width: 200px;
			z-index: 6;

			.item {
				display: flex;
				flex-direction: row;
				gap: 10px;
				align-items: center;
				padding: 5px;
				border-radius: 4px;
				font-size: 14px;
			}

			.info {
				padding: 8px;
				font-size: 14px;
				line-height: 1.4;
				color: #999999;
			}
		}
	}
</style>

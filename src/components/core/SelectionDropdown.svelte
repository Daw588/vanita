<script lang="ts" generics="T extends string">
	import Dropdown from "./Dropdown.svelte";

	type Props = {
		options: T[],
		selectionIndex?: number,
		selection: T,
		anchor: "left" | "right",
		grow?: boolean
	}

	let { selectionIndex = 0, options, selection = $bindable(), anchor, grow = false }: Props = $props();
	
	let expanded = $state(false);

	function select(index: number) {
		selectionIndex = index;
		selection = options[index]!;
		expanded = false; // collapse
	}

	let label = $derived(options[selectionIndex]!);
</script>

<Dropdown label={label} anchor={anchor} grow={grow} bind:expanded={expanded}>
	<div class="options">
		{#each options as option, i (option)}
			<button class="option" onclick={() => select(i)}>{option}</button>
		{/each}
	</div>
</Dropdown>

<style lang="scss">
	.options {
		display: flex;
		flex-direction: column;
		// gap: 3px;
		padding: 1px;

		.option {
			all: unset;

			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 6px; // 8px
			flex-grow: 1;
			font-size: 14px;

			padding: 6px; // 8px
			border-radius: 4px;
			cursor: pointer;

			&:hover {
				background-color: rgba(255, 255, 255, 0.1);
			}
		}
	}
</style>

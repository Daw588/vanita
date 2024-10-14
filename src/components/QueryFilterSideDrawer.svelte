<script lang="ts">
	import { SORT_ORDER, SORT_TYPE, type SortOrder, type SortType } from "../modules/wardrobe/outfits";
	import Checkbox from "./core/Checkbox.svelte";
	import SelectionDropdown from "./core/SelectionDropdown.svelte";
	import SideDrawer from "./core/SideDrawer.svelte";

	type Props = {
		open: boolean,
		hideUnused: boolean,
		selectedSortType: SortType,
		selectedSortOrder: SortOrder
	}

	let {
		open = $bindable(),
		hideUnused = $bindable(),
		selectedSortType = $bindable(),
		selectedSortOrder = $bindable()
	}: Props = $props();
</script>

<SideDrawer open={open} onDismiss={() => open = false}>
	<div class="root">
		<div class="option column">
			<div class="label">Sort Type</div>
			<SelectionDropdown
				anchor="left"
				options={[...SORT_TYPE]}
				grow={true}
				bind:selection={selectedSortType} />
		</div>

		<div class="option column">
			<div class="label">Sort Order</div>
			<SelectionDropdown
				anchor="left"
				options={[...SORT_ORDER]}
				grow={true}
				bind:selection={selectedSortOrder} />
		</div>

		<div class="option row">
			<Checkbox bind:checked={hideUnused} />
			<div class="label">Hide Unused Outfits</div>
		</div>
	</div>
</SideDrawer>

<style lang="scss">
	.root {
		// display: flex;
		padding: 15px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 200px;

		.option {
			display: flex;
			gap: 5px;

			&.column {
				flex-direction: column;
				justify-content: center;
			}

			&.row {
				align-items: center;
			}
		}
	}
</style>

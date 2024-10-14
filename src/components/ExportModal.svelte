<script lang="ts">
	import { promptToSaveFile } from "../lib/browser";
	import type { Wardrobe } from "../modules/wardrobe/codec/v0";
	import { exportWardrobe } from "../modules/wardrobe/itself";
	import Dialog from "./core/Dialog.svelte";
	import PrimaryButton from "./core/PrimaryButton.svelte";
	import SquareButton from "./core/SquareButton.svelte";

	type Props = {
		open: boolean,
		wardrobe: Wardrobe,
		onClose: () => void
	}

	let { open, wardrobe, onClose }: Props = $props();

	let selectedIndex = $state<number>(0);

	function onExportBtnClick() {
		onClose();

		if (selectedIndex === 0) { // Vanita (binary) export
			const data = exportWardrobe("binary", wardrobe);
			if (data) {
				promptToSaveFile(`${Date.now().toString()}.vanita`, data);
			} else {
				// TODO: Let the user know what went wrong, right now nothing will happen
				// and it will confuse the user
			}
		} else if (selectedIndex === 1) { // JSON export
			const data = exportWardrobe("json", wardrobe);
			if (data) {
				promptToSaveFile(`${Date.now().toString()}.json`, data);
			} else {
				// TODO: Let the user know what went wrong, right now nothing will happen
				// and it will confuse the user
			}
		}
	}
</script>

<Dialog open={open}>
	<div class="root">
		<div class="header">
			<div class="label">Export Outfits</div>
			<SquareButton icon="close" onClick={onClose} />
		</div>
		<div class="notice">
			JSON (.json) save imports, including restore points, will soon be unsupported.
			Please use the binary (.vanita) format. JSON exports will still be available.
		</div>
		<div class="options">
			<button class="option{selectedIndex === 0 ? ' selected' : ''}" onclick={() => selectedIndex = 0}>
				<div class="heading">Binary (.vanita)</div>
				<div class="description">Highly efficient binary format specifically designed for storing outfits. Suitable for backups.</div>
			</button>
			<button class="option{selectedIndex === 1 ? ' selected' : ''}" onclick={() => selectedIndex = 1}>
				<div class="heading">JSON (.json)</div>
				<div class="description">Human-readable file format for storing all kinds of data.</div>
			</button>
		</div>
		<div class="choices">
			<PrimaryButton label="Cancel" kind="neutral" onClick={onClose} />
			<PrimaryButton label="Export" kind="positive" onClick={onExportBtnClick} />
		</div>
	</div>
</Dialog>

<style lang="scss">
	@use "sass:color";

	.root {
		display: flex;
		flex-direction: column;
		gap: 12px;

		font-size: 14px;

		background-color: #242424;
		border-radius: 8px;
		border: 1px solid #424242;
		width: 400px;
		// height: 400px;
		padding: 14px;

		.header {
			padding: 5px;
			display: flex;
			flex-direction: row;
			align-items: center;

			.label {
				font-size: 18px;
				font-weight: 500;
				flex-grow: 1;
			}
		}
		
		.notice {
			background-color: rgba(255, 183, 0, 0.25);
			border: 1px solid rgba(255, 183, 0, 0.5);
			padding: 8px;
			font-size: 14px;
			border-radius: 6px;
			line-height: 1.25;
		}

		// .block {
		// 	display: inline-flex;
		// 	padding: 2px 4px;
		// 	border: 1px solid rgba(0, 0, 0, 0.5);
		// 	background-color: rgba(0, 0, 0, 0.25);
		// 	border-radius: 6px;
		// }

		.options {
			display: flex;
			flex-direction: column;
			gap: 8px;

			.option {
				all: unset;

				display: flex;
				flex-direction: column;
				gap: 6px;

				padding: 10px;
				border: 1px solid #424242;
				border-radius: 8px;

				transition: border-color 80ms ease-out;
				cursor: pointer;
				user-select: none;

				&:hover {
					border-color: color.scale(#424242, $lightness: 20%);
				}

				&.selected {
					border-color: #2866df;
				}

				.heading {
					// font-size: 16px;
					font-weight: 500;
				}

				.description {
					line-height: 1.25;
					color: #a9a9a9;
				}
			}
		}

		.choices {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: right;
			gap: 8px;
		}

		// .point {
		// 	display: flex;
		// 	flex-direction: row;
		// 	gap: 4px;
		// 	padding: 2px;
		// 	align-items: center;

		// 	&.good {
		// 		color: #34a853;
		// 	}

		// 	&.bad {
		// 		color: #ea4335;
		// 	}
		// }
	}
</style>

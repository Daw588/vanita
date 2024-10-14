<script lang="ts" module>
	export type InvalidAsset = {
		id: number,
		name: string,
		thumbnail?: string
	}
</script>

<script lang="ts">
	import Dialog from "./core/Dialog.svelte";
	import PrimaryButton from "./core/PrimaryButton.svelte";

	type Props = {
		assets: InvalidAsset[],
		open: boolean
	}

	let { open, assets }: Props = $props();
</script>

<Dialog open={open}>
	<div class="invalid-outfit-assets-dialog">
		<div class="title">Failed to equip certain assets</div>
		<div class="description">Roblox server refused to equip the listed assets below. Make sure that you own those assets before retrying.</div>
		<div class="assets">
			{#each assets as asset}
				<a class="asset" href="https://www.roblox.com/catalog/{asset.id}" target="_blank" aria-label={asset.name}>
					<img class="thumbnail" src={asset.thumbnail} alt="Thumbnail" width={75} height={75} />
					<!-- <div class="label">{asset.name}</div> -->
				</a>
			{/each}
		</div>
		<div>
			<PrimaryButton label="Understood" grow={true} onClick={() => open = false} />
		</div>
	</div>
</Dialog>

<style lang="scss">
	.invalid-outfit-assets-dialog {
		display: flex;
		flex-direction: column;
		gap: 10px;

		font-size: 14px;

		background-color: #242424;
		border-radius: 8px;
		border: 1px solid #424242;
		padding: 15px;
		width: min-content;

		.title {
			font-size: 16px;
			font-weight: 500;
		}

		.description {
			line-height: 1.4;
			color: #a9a9a9;
		}

		.assets {
			display: flex;
			flex-direction: row;
			align-content: flex-start;
			flex-wrap: wrap;
			gap: 5px;

			height: 200px;
			width: calc((75px + 10px) * 4);
			padding-right: 5px;
			overflow-y: auto;

			.asset {
				display: flex;
				flex-direction: column;
				gap: 5px;

				.thumbnail {
					width: 75px;
					height: 75px;
					
					border-radius: 8px;
					border: 1px solid #3a3a3a;
					cursor: pointer;

					&:hover {
						border-color: #2866df;
					}
				}

				// .label {
				// 	max-width: 100px;
				// 	display: none;
				// }
			}
		}
	}
</style>

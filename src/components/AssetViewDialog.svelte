<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Outfit } from "../lib/defs";
	import type RBXApi from "../lib/rbxapi";
	import { formatNumber } from "../lib/util";
	import Dialog from "./core/Dialog.svelte";
	import SquareButton from "./core/SquareButton.svelte";
	import ExpandableActionsButton from "./core/ExpandableActionsButton.svelte";
	import CircularProgressBar from "./core/CircularProgressBar.svelte";

	export let open: boolean;
	export let outfit: Outfit | undefined;
	export let rbxapi: RBXApi;

	type Events = {
		close: void
	}

	const dispatch = createEventDispatcher<Events>();

	let currentCostInRobux = 0;
	let numberOfOffSaleAssets = 0;
	let loadingTotalCostInRobux = false;
	let loadingAssets = false;
	let wornAssets: Awaited<ReturnType<RBXApi["getCatalogAssetDetails"]>> = [];
	let assetThumbnails: Awaited<ReturnType<RBXApi["getAssetThumbnail"]>> = [];

	async function doOpen() {
		if (!outfit) {
			return;
		}

		loadingTotalCostInRobux = true;
		loadingAssets = true;

		// Calculate the value of the item
		const assets = await rbxapi.getCatalogAssetDetails(outfit.character.assets.map(v => v.id));
		wornAssets = assets;

		assetThumbnails = await rbxapi.getAssetThumbnail({
			assetIds: outfit.character.assets.map(v => v.id),
			format: "Png",
			isCircular: false,
			returnPolicy: "PlaceHolder",
			size: "110x110"
		});

		loadingAssets = false;
		
		// console.log(assets);

		let totalPrice = 0;
		let totalOfOffSaleAssets = 0;

		for await (const asset of assets) {
			// Calculate the cost
			if (asset.price) {
				totalPrice += asset.price;
			} else if (asset.lowestPrice) {
				totalPrice += asset.lowestPrice;
			} else if (asset.lowestResalePrice) {
				totalPrice += asset.lowestResalePrice;
			}

			if (asset.isOffSale && asset.creatorName === "Roblox" && asset.creatorType === "User") {
				// Probably a bundle
				const bundles = await rbxapi.getBundleFromAsset(asset.id);
				if (bundles.success) {
					if (bundles.value.length > 0) {
						// This asset is a bundle
						const bundle = bundles.value[0];
						if (!bundle.product.isForSale) {
							totalOfOffSaleAssets++;
						}

						totalPrice += bundle.product.priceInRobux;
					}
				}
			} else {
				// Not a bundle
				// Calculate number of off sale assets
				if (asset.isOffSale) {
					totalOfOffSaleAssets++;
				}
			}
		}

		currentCostInRobux = totalPrice;
		numberOfOffSaleAssets = totalOfOffSaleAssets;

		loadingTotalCostInRobux = false;
	}

	function doClose() {
		dispatch("close");
	}

	async function copyLinksToClipboard() {
		await navigator.clipboard.writeText(
			wornAssets.map(asset => `${asset.name} - https://www.roblox.com/catalog/${asset.id}`).join("\n")
		);
	}

	$: if (open) {
		doOpen();
	}
</script>

<Dialog open={open} on:dismiss={doClose}>
	<div class="surface">
		<div class="header">
			<div class="title">Assets</div>
			<SquareButton icon="close" on:click={doClose} />
		</div>
		<div class="assets">
			{#if loadingAssets}
				<div class="loading">
					<CircularProgressBar />
					<div>Retrieving information...</div>
				</div>
			{:else}
				{#each wornAssets as asset (asset.id)}
					{@const assetPrice = asset.price || asset.lowestPrice || asset.lowestResalePrice || 0}
					<div class="asset">
						<a href="https://www.roblox.com/catalog/{asset.id}" target="_blank">
							<img class="thumbnail" src={assetThumbnails.find(v => v.targetId === asset.id)?.imageUrl} width={110} height={110} alt="Thumbnail" />
						</a>
						<div class="side">
							<div class="name">{asset.name}</div>
							<div class="price">
								{#if asset.isOffSale}
									Off Sale
								{:else}
									<img src="/robux.svg" width={24} height={24} alt="Robux currency icon" />
									{formatNumber(assetPrice)}
								{/if}
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
		<div class="overview">
			<div class="property">
				<div class="value">
					<img src="/robux.svg" width={24} height={24} alt="Robux currency icon" />
					{loadingTotalCostInRobux ? "Retrieving information..." : formatNumber(currentCostInRobux)}
				</div>
			</div>
			<ExpandableActionsButton direction="up" actions={[
				{
					label: "Copy Links",
					icon: "content_copy",
					dangerous: false,
					onTriggered: copyLinksToClipboard
				}
			]} />
			<!-- <div class="property">
				<div class="key">Off Sale:</div>
				<div class="value">{numberOfOffSaleAssets}</div>
			</div> -->
		</div>
	</div>
</Dialog>

<style lang="scss">
	.surface {
		background-color: #171717;
		border: 1px solid #3a3a3a;
		border-radius: 8px;
		padding: 10px;
		// margin: 15px;

		display: flex;
		flex-direction: column;

		font-size: 14px;

		.header {
			padding: 5px;
			display: flex;
			flex-direction: row;
			align-items: center;

			.title {
				font-size: 18px;
				font-weight: 500;
				flex-grow: 1;
			}
		}

		.overview {
			padding: 5px;

			display: flex;
			flex-direction: row;
			gap: 5px;

			.property {
				display: flex;
				align-items: center;
				gap: 5px;
				flex-grow: 1;

				.value {
					display: flex;
					align-items: center;
				}
			}
		}

		.assets {
			padding: 5px;
			padding-right: 10px;

			display: flex;
			flex-direction: column;
			gap: 10px;

			height: 400px;
			width: 400px;
			overflow-y: auto;

			&:has(.loading) {
				align-items: center;
				justify-content: center;
			}

			.loading {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 5px;
			}

			.asset {
				display: flex;
				flex-direction: row;
				gap: 10px;

				.thumbnail {
					width: 110px;
					height: 110px;
					
					border-radius: 8px;
					border: 1px solid #3a3a3a;
					cursor: pointer;

					&:hover {
						border-color: #2866df;
					}
				}

				.side {
					display: flex;
					flex-direction: column;
					gap: 8px;

					.name {
						font-size: 18px;
						font-weight: 500;
					}

					.price {
						display: flex;
						align-items: center;
						font-size: 16px;
						// gap: 5px;
					}
				}
			}
		}
	}
</style>
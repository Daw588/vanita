<script lang="ts">
	import { unregisterTag, type LoadedOutfit, type QueryTag, type TagQueryMode } from "../modules/wardrobe/outfits";
	import Checkbox from "./core/Checkbox.svelte";
	import Dropdown from "./core/Dropdown.svelte";

	type Props = {
		tags: QueryTag[],
		mode: TagQueryMode,
		outfits: LoadedOutfit[]
	}

	let { tags, mode = $bindable("and"), outfits }: Props = $props();

	let sortedTags = $derived.by(() => {
		return tags.toSorted((a, b) => a.label.localeCompare(b.label));
	});

	function tagRemoveBtnClicked(tagId: number) {
		unregisterTag(outfits, tags, tagId);
	}
</script>

<Dropdown label="Tags">
	<div class="tray">
		{#if tags.length === 0}
			<div class="info">You haven't created any tags yet</div>
		{:else}
			<div class="logic-mode-switch">
				<button class="and{mode === "and" ? " selected" : ""}" onclick={() => mode = "and"}>AND</button>
				<button class="or{mode === "or" ? " selected" : ""}" onclick={() => mode = "or"}>OR</button>
			</div>
			<div class="items">
				{#each sortedTags as tag, tagId (tag.label)}
					<div class="item">
						<Checkbox bind:checked={tag.checked} />
						<div class="label">{tag.label}</div>
						<button class="remove" onclick={() => tagRemoveBtnClicked(tagId)}>
							<div class="icon">
								<span class="material-symbols-rounded">close</span>
							</div>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Dropdown>

<style lang="scss">
	.tray {
		.info {
			padding: 8px;
			font-size: 14px;
			line-height: 1.4;
			color: #999999;
		}

		.items {
			display: flex;
			flex-direction: column;
			
			// Allow for infinite amount of tags regardless of the available space to display them
			max-height: 400px;
			overflow-y: auto;

			.item {
				display: flex;
				flex-direction: row;
				gap: 10px;
				align-items: center;
				padding: 5px;
				border-radius: 4px;
				font-size: 14px;

				.label {
					flex-grow: 1;
				}

				&:has(.remove:hover) .label {
					color: #ee474a;
					text-decoration: line-through;
				}

				.remove {
					all: unset;

					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;

					cursor: pointer;
					padding: 1px;
					// border: 1px solid #eee;
					border-radius: 100%;

					&:hover {
						color: #ee474a;
						background-color: rgba(199, 38, 54, 0.1);
					}

					.icon {
						display: flex;
						height: 18px;

						span {
							font-size: 18px;
						}
					}
				}
			}
		}

		.logic-mode-switch {
			display: flex;
			border-radius: 8px;
			cursor: pointer;
			margin: 5px;
			font-weight: 500;

			.and, .or {
				all: unset;
				flex-grow: 1;
				padding: 5px;
				display: flex;
				align-items: center;
				justify-content: center;

				&.selected {
					border-color: #2866df;
				}
				
				&:not(.selected):hover {
					background-color: rgba(255, 255, 255, 0.05);
					border-color: #4b4b4b;
				}
			}
			
			.and {
				border-top-left-radius: 8px;
				border-bottom-left-radius: 8px;

				border-left: 1px solid #3a3a3a;
				border-top: 1px solid #3a3a3a;
				border-bottom: 1px solid #3a3a3a;

				&.selected {
					border-right: 1px solid #2866df;
				}
			}

			.or {
				border-top-right-radius: 8px;
				border-bottom-right-radius: 8px;

				border-right: 1px solid #3a3a3a;
				border-top: 1px solid #3a3a3a;
				border-bottom: 1px solid #3a3a3a;

				&.selected {
					border-left: 1px solid #2866df;
				}
			}
		}
	}
</style>

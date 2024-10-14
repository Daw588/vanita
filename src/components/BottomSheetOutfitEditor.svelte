<script lang="ts">
	import { tick } from "svelte";

	import { type Option, overwrite, timeAgo } from "../modules/util";

	import TextField from "./core/TextField.svelte";
	import SquareButton from "./core/SquareButton.svelte";
	import ExpandableActionsButton from "./core/ExpandableActionsButton.svelte";
	import PrimaryButton from "./core/PrimaryButton.svelte";
	import { Snackbar } from "../modules/snackbar";
	import type { RBXApi } from "../modules/rbxapi";
	import Dialog from "./core/InfoDialog.svelte";
	import AssetViewDialog from "./AssetViewDialog.svelte";
	import { addTagToOutfit, overwriteOutfit, saveAsRobloxOutfit, type LoadedOutfit, type QueryTag } from "../modules/wardrobe/outfits";

	type Props = {
		open: boolean,
		outfit: LoadedOutfit | null,
		rbxapi: Option<RBXApi>,
		userId: Option<number>,
		allTags: QueryTag[],
		onClose: () => void,
		onDeleteOutfit: (outfit: LoadedOutfit) => void,
		onDuplicateOutfit: (outfit: LoadedOutfit) => void
	}

	let { open, outfit, rbxapi, userId, allTags, onClose, onDeleteOutfit, onDuplicateOutfit }: Props = $props();

	let isEditingName = $state(false);
	let nameLabel = $state<HTMLInputElement>();
	let tagName = $state("");

	// This is the outfit that is currently being edited
	// This can be later set to outfit = editedOutfit to commit changes
	let editedOutfit = $state<Option<LoadedOutfit>>(null);

	let now = $state(Date.now());

	let deleteOutfitDialogVisible = $state(false);
	let closeWithoutSavingChangesDialogVisible = $state(false);

	let assetViewDialog = $state({
		open: false
	});

	// type Events = {
	// 	close: void,
	// 	deleteOutfit: Outfit,
	// 	duplicateOutfit: Outfit
	// }

	// const dispatch = createEventDispatcher<Events>();

	function backdropClicked() {
		if (hasMadeChanges()) {
			// The user should not lose their changes if they unintentionally clicked out
			closeWithoutSavingChangesDialogVisible = true;
		} else {
			close(); // Nothing to save
		}
	}

	function saveButtonClicked() {
		save();
		close();
	}

	function close() {
		isEditingName = false;
		loadOutfit(); // Clear out unsaved data by loading the latest state of currently loaded outfit
		onClose();
	}

	function hasMadeChanges() {
		return JSON.stringify(outfit) !== JSON.stringify(editedOutfit);
	}

	async function onEditOutfitNameButtonClicked() {
		if (isEditingName) {
			isEditingName = false;
		} else {
			isEditingName = true;

			// Wait for DOM to be updated before we focus (we don't want to focus when the label is still disabled)
			await tick();

			nameLabel!.focus(); // Force the user to focus on the input so that they can begin typing right away
			nameLabel!.setSelectionRange(-1, -1); // Put caret (blinking vertical line) at the end of the text
		}
	}

	function onNameLabelKeyPress(event: KeyboardEvent & {currentTarget: EventTarget & HTMLInputElement; }) {
		if (event.key === "Enter") {
			isEditingName = false;
		}
	}

	function tryAddTag() {
		if (!editedOutfit) {
			return;
		}

		const result = addTagToOutfit(editedOutfit, allTags, tagName);
		if (result.success) {
			tagName = "";
		} else {
			if (result.error.kind === "LimitExceeded") {
				Snackbar.show("You cannot associate more than 255 tags with the outfit", 4);
			} else if (result.error.kind === "AlreadyExists") {
				Snackbar.show("The tag is already associated with the outfit", 4);
			} else if (result.error.kind === "RegistryError") {
				if (result.error.error.kind === "LimitExceeded") {
					Snackbar.show("Reached limit of 255 tags", 4);
				} else if (result.error.error.kind === "TooLong") {
					Snackbar.show("The tag name exceeds the 255 character limit", 4);
				}
			}
		}
	}

	function removeTag(index: number) {
		if (!editedOutfit) {
			return;
		}
		editedOutfit.tags.splice(index, 1);
	}

	async function loadOutfit() {
		if (outfit) {
			editedOutfit = structuredClone($state.snapshot(outfit)); // Clone to avoid sharing reference
			now = Date.now(); // Date to use for "now" when dealing with "modified" and "created" timestamps
		}
	}

	async function onOverwriteOutfit() {
		if (!editedOutfit || userId === null || rbxapi === null) {
			return;
		}
		await overwriteOutfit(rbxapi, editedOutfit, userId);
	}

	async function onSaveAsRobloxOutfit() {
		if (!editedOutfit || rbxapi === null) {
			return;
		}

		const success = await saveAsRobloxOutfit(rbxapi, editedOutfit);
		if (success) {
			Snackbar.show("Successfuly created a Roblox outfit", 3);
		} else {
			Snackbar.show("Failed to created a Roblox outfit", 3);
		}
	}

	function deleteOutfit() {
		if (outfit) {
			onDeleteOutfit(outfit);
			close();
		}
	}

	function duplicateOutfit() {
		if (outfit) {
			onDuplicateOutfit(outfit);
			close();
		}
	}

	function save() {
		if (outfit && editedOutfit) {
			overwrite(outfit, $state.snapshot(editedOutfit));
			outfit.modified = Date.now(); // Update the time when the outfit was last modified
		}
	}

	$effect(() => {
		if (outfit) { // When outfit is set/changed, update the variables
			loadOutfit();
		}
	});

	// $inspect(editedOutfit);

	// $effect(() => {
	// 	console.debug("tags changed", allTags);
	// });

	// List of tags that are associated with the outfit
	let listOfTags = $derived.by(() => {
		if (!editedOutfit) {
			return [];
		}

		return editedOutfit.tags
			.map((tagId, index) => ({ ...allTags[tagId]!, index }))
			.toSorted((a, b) => a.label.localeCompare(b.label));
	});
</script>

<div class="root" data-open={open}>
	{#if editedOutfit && rbxapi}
		<AssetViewDialog open={assetViewDialog.open} outfit={editedOutfit} rbxapi={rbxapi} onClose={() => assetViewDialog.open = false} />
	{/if}

	<Dialog
		title="Deletion Confirmation"
		description="The current outfit that you are editing will be permanently deleted. This action is irreversible. Are you sure?"
		visible={deleteOutfitDialogVisible}
		actions={[
			{
				label: "Yes, Delete This Outfit",
				kind: "negative",
				onClick: () => {
					deleteOutfitDialogVisible = false;
					deleteOutfit();
				}
			},
			{
				label: "Cancel",
				kind: "neutral",
				onClick: () => {
					deleteOutfitDialogVisible = false;
				}
			},
		]} />

	<Dialog
		title="Close Without Saving Confirmation"
		description="You are about to close the editor without saving your changes. This action is irreversible. Are you sure?"
		visible={closeWithoutSavingChangesDialogVisible}
		actions={[
			{
				label: "Yes, Discard My Changes",
				kind: "negative",
				onClick: () => {
					closeWithoutSavingChangesDialogVisible = false;
					close();
				}
			},
			{
				label: "Cancel",
				kind: "neutral",
				onClick: () => {
					closeWithoutSavingChangesDialogVisible = false;
				}
			},
		]} />

	<button class="backdrop" onclick={backdropClicked} aria-label="Modal backdrop"></button>

	{#if editedOutfit}
		<div class="tray">
			<div class="left">
				<img class="main" src={editedOutfit.thumbnailUrl} alt="avatar" />
				<div class="actions">
					<PrimaryButton label="Save" icon="save" onClick={saveButtonClicked} grow={true} />
					<ExpandableActionsButton direction="up" actions={[
						{
							label: "View Assets",
							icon: "apparel",
							dangerous: false,
							onTriggered: () => assetViewDialog.open = true
						},
						{
							label: "Save as Roblox outfit",
							icon: "save_as",
							dangerous: false,
							onTriggered: onSaveAsRobloxOutfit
						},
						{
							label: "Export",
							icon: "output",
							dangerous: false,
							onTriggered: () => {
								// TODO: Implement
								// if (editedOutfit) {
								// 	util.exportOutfits([editedOutfit]);
								// }
							},
						},
						{
							label: "Overwrite",
							icon: "draw",
							dangerous: false,
							onTriggered: onOverwriteOutfit,
						},
						{
							label: "Duplicate",
							icon: "content_copy",
							dangerous: false,
							onTriggered: duplicateOutfit,
						},
						{
							label: "Delete",
							icon: "delete_forever",
							dangerous: true,
							onTriggered: () => deleteOutfitDialogVisible = true
						}
					]} />
				</div>
			</div>
			<div class="right">
				<div class="name">
					<input
						class="label"
						type="text"
						disabled={!isEditingName}
						maxlength={25}
						bind:this={nameLabel}
						bind:value={editedOutfit.name}
						onkeydown={onNameLabelKeyPress}
						data-is-editing={isEditingName} />
					<SquareButton icon={isEditingName ? "done" : "edit"} onClick={onEditOutfitNameButtonClicked} />
				</div>
				<div class="side">
					<div class="properties">
						<div class="property">
							<div class="key">Created:</div>
							<div class="value">{timeAgo(editedOutfit.created, now)}</div>
						</div>
						<div class="property">
							<div class="key">Modified:</div>
							<div class="value">{editedOutfit.modified === 0 ? "never" : timeAgo(editedOutfit.modified, now)}</div>
						</div>
						<div class="property">
							<div class="key">Last Used:</div>
							<div class="value">{editedOutfit.lastUsed === 0 ? "never" : timeAgo(editedOutfit.lastUsed, now)}</div>
						</div>
						<div class="property">
							<div class="key">Used:</div>
							<div class="value">{editedOutfit.useCount} time{editedOutfit.useCount === 1 ? "" : "s"}</div>
						</div>
					</div>
					<!-- <div class="section">
						<div class="header">Assets</div>
						<div class="property">
							<div class="key">Current Cost:</div>
							<div class="value">
								<img src="/robux.svg" width={24} height={24} alt="Robux currency icon" />
								{util.formatNumber(currentCostInRobux)}
							</div>
						</div>
					</div> -->
					<div class="section tags">
						<div class="header">Tags</div>
						<!-- allTags.filter(tag => !editedOutfit?.tags.includes(allTags.indexOf(tag)) && tag.toLocaleLowerCase().includes(tagName.toLocaleLowerCase())).splice(0, 4) -->
						<TextField
							icon="sell"
							placeholder="Add a tag..."
							maxLength={25}
							autocomplete={true}
							suggestions={[]}
							onEnter={tryAddTag}
							bind:value={tagName} />
						<div class="list">
							<!-- We wrap tags in objects with their original index, because their index will change after we sort them alphabetically -->
							{#each listOfTags as tag}
								<div class="tag">
									<div class="content">{tag.label}</div>
									<button class="remove" onclick={() => removeTag(tag.index)}>
										<div class="icon">
											<span class="material-symbols-rounded">close</span>
										</div>
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.root {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: end;
		z-index: 5;
		
		transition:
			opacity 100ms ease,
			visibility 100ms ease,
			backdrop-filter 100ms ease;

		&[data-open=true] {
			visibility: visible;
			opacity: 1;

			.backdrop {
				backdrop-filter: blur(5px);
			}

			.tray {
				transform: translateY(0);
			}
		}

		&[data-open=false] {
			visibility: collapse;
			opacity: 0;

			.backdrop {
				backdrop-filter: blur(0);
			}
			
			.tray {
				transform: translateY(100%);
			}
		}
	}

	.backdrop {
		all: unset;

		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 6;

		width: 100%;
		height: 100%;

		background-color: rgba(0, 0, 0, 0.5);
	}

	.tray {
		z-index: 7;

		padding: 15px;
		margin: 15px;

		display: flex;
		flex-direction: row;
		flex-grow: 1;
		gap: 15px;

		border-radius: 8px;

		background-color: #171717;
		border: 1px solid #3a3a3a;
		
		transition: transform 150ms ease;

		.left {
			display: flex;
			flex-direction: column;
			gap: 15px;

			.main {
				width: 250px;
				height: 250px;
			}

			.actions {
				display: flex;
				flex-direction: row;
				gap: 15px;
				width: 100%;
			}
		}

		.right {
			display: flex;
			flex-direction: column;
			flex-grow: 1;
			gap: 15px;

			.side {
				display: flex;
				flex-direction: column;
				gap: 15px;
				height: 100%;
				max-height: 250px;
				overflow-y: auto;
			}

			.name {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 15px;

				.label {
					all: unset;

					font-size: 20px;
					font-weight: 500;
					width: 100%;
					height: 100%;
					border-bottom: 1px solid transparent;
					cursor: text;

					&[data-is-editing=true] {
						border-bottom-color: #3a3a3a;
					}
				}
			}

			.properties {
				display: flex;
				flex-direction: column;
				gap: 8px;

				.property {
					display: flex;
					flex-direction: row;
					// align-items: center;
					gap: 5px;
					font-size: 14px;

					.key {
						color: #a9a9a9;
					}

					.value {
						// display: flex;
						// flex-direction: row;
						// align-items: center;
						color: #fefefe;
					}
				}
			}

			.section {
				display: flex;
				flex-direction: column;
				gap: 15px;

				.header {
					font-size: 16px;
					font-weight: 500;
				}
			}

			.tags {
				.list {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 4px;

					.tag {
						display: flex;
						flex-direction: row;
						gap: 4px;
						padding: 4px 8px;
						user-select: none;

						background-color: #242424;
						border-radius: 4px;

						.content {
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: center;
							
							font-size: 14px;
						}

						&:has(.remove:hover) .content {
							color: #ee474a;
							text-decoration: line-through;
						}

						.remove {
							all: unset;

							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: center;

							// cursor: pointer;
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
			}
		}
	}
</style>

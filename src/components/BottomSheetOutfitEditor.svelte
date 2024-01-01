<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";

	import * as defs from "../lib/defs";
	import * as util from "../lib/util";

	import TextField from "./TextField.svelte";
	import SquareButton from "./SquareButton.svelte";
	import ExpandableActionsButton from "./ExpandableActionsButton.svelte";
	import PrimaryButton from "./PrimaryButton.svelte";
	import { Snackbar } from "../lib/snackbar";
	import RBXApi from "../lib/rbxapi";
	import Dialog from "./Dialog.svelte";
	import deepMerge from "lodash.merge";

	export let open: boolean = false;
	export let outfit: defs.Outfit | undefined;
	export let rbxapi: RBXApi;
	export let userId: number;

	let isEditingName: boolean = false;
	let nameLabel: HTMLInputElement;
	let tagName: string = "";

	// This is the outfit that is currently being edited
	// This can be later set to outfit = editedOutfit to commit changes
	let editedOutfit: defs.Outfit | undefined;

	let now = Date.now();

	let deleteOutfitDialogVisible = false;
	let closeWithoutSavingChangesDialogVisible = false;

	type Events = {
		close: void,
		deleteOutfit: defs.Outfit
	}

	const dispatch = createEventDispatcher<Events>();

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
		dispatch("close");
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

			nameLabel.focus(); // Force the user to focus on the input so that they can begin typing right away
			nameLabel.setSelectionRange(-1, -1); // Put caret (blinking vertical line) at the end of the text
		}
	}

	function onNameLabelKeyPress(event: KeyboardEvent & {currentTarget: EventTarget & HTMLInputElement; }) {
		if (event.key === "Enter") {
			isEditingName = false;
		}
	}

	function addTag() {
		if (!editedOutfit) {
			return;
		}

		if (editedOutfit.tags.indexOf(tagName) === -1) {
			editedOutfit.tags.push(tagName);
			tagName = "";
			editedOutfit = editedOutfit; // Trigger UI refresh
		} else {
			// Tag already exists!
			// TODO: Perhaps an error message?
		}
	}

	function removeTag(name: string) {
		if (!editedOutfit) {
			return;
		}

		const index = editedOutfit.tags.indexOf(name);
		if (index !== -1) {
			editedOutfit.tags.splice(index, 1);
			editedOutfit = editedOutfit; // Trigger UI refresh
		}
	}

	function loadOutfit() {
		if (outfit) {
			editedOutfit = structuredClone(outfit); // Clone to avoid sharing reference
			now = Date.now(); // Date to use for "now" when dealing with "modified" and "created" timestamps
		}
	}

	async function overwriteOutfit() {
		if (!editedOutfit) {
			return;
		}

		const avatarData = await rbxapi.getCurrentAvatar();
		const avatarUrl = await rbxapi.getAvatarThumbnail(userId);

		editedOutfit.character = {
			bodyColors: avatarData.bodyColors,
			assets: avatarData.assets.map(v => {
				return {
					id: v.id,
					meta: v.meta
				};
			}),
			avatarType: avatarData.playerAvatarType,
			scales: avatarData.scales
		};

		editedOutfit.thumbnailUrl = avatarUrl;

		editedOutfit = editedOutfit; // Trigger UI refresh
	}

	async function saveAsRobloxOutfit() {
		if (!editedOutfit) {
			return;
		}

		await rbxapi.createOutfit({
			assets: editedOutfit.character.assets,
			bodyColors: editedOutfit.character.bodyColors,
			name: editedOutfit.name,
			outfitType: "Avatar",
			playerAvatarType: editedOutfit.character.avatarType,
			scale: editedOutfit.character.scales
		});

		Snackbar.show("Successfuly created a Roblox outfit", 3);
	}

	function deleteOutfit() {
		if (outfit) {
			dispatch("deleteOutfit", outfit);
			close();
		}
	}

	function save() {
		if (outfit) {
			(outfit.character as any) = {}; // Some keys may not be properly overwritten, empty them
			deepMerge(outfit, structuredClone(editedOutfit)); // Overwrite object without losing reference
			outfit.modified = Date.now(); // Update the time when the outfit was last modified
		}
	}

	$: if (outfit) { // When outfit is set/changed, update the variables
		loadOutfit();
	}
</script>

<div class="root" data-open={open}>
	<Dialog
		title="Deletion Confirmation"
		description="The current outfit that you are editing will be permanently deleted. This action is irreversible. Are you sure?"
		visible={deleteOutfitDialogVisible}
		actions={[
			{
				label: "Yes, Delete This Outfit",
				kind: "danger",
				onClick: () => {
					deleteOutfitDialogVisible = false;
					deleteOutfit();
				}
			},
			{
				label: "Cancel",
				kind: "normal",
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
				kind: "danger",
				onClick: () => {
					closeWithoutSavingChangesDialogVisible = false;
					close();
				}
			},
			{
				label: "Cancel",
				kind: "normal",
				onClick: () => {
					closeWithoutSavingChangesDialogVisible = false;
				}
			},
		]} />

	<button class="backdrop" on:click={backdropClicked}></button>

	{#if editedOutfit}
		<div class="tray">
			<div class="left">
				<img class="main" src={editedOutfit.thumbnailUrl} alt="avatar" />
				<div class="actions">
					<PrimaryButton label="Save" icon="save" on:click={saveButtonClicked} grow={true} />
					<ExpandableActionsButton direction="up" actions={[
						{
							icon: "save_as",
							label: "Save as Roblox outfit",
							dangerous: false,
							onTriggered: saveAsRobloxOutfit
						},
						{
							icon: "draw",
							label: "Overwrite",
							dangerous: false,
							onTriggered: overwriteOutfit,
						},
						{
							icon: "delete_forever",
							label: "Delete",
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
						on:keydown={onNameLabelKeyPress}
						data-is-editing={isEditingName} />
					<SquareButton icon={isEditingName ? "done" : "edit"} on:click={onEditOutfitNameButtonClicked} />
				</div>
				<div class="properties">
					<div class="property">
						<div class="key">Created:</div>
						<div class="value">{util.timeAgo(editedOutfit.created, now)}</div>
					</div>
					<div class="property">
						<div class="key">Modified:</div>
						<div class="value">{editedOutfit.modified === 0 ? "never" : util.timeAgo(editedOutfit.modified, now)}</div>
					</div>
					<div class="property">
						<div class="key">Last Used:</div>
						<div class="value">{editedOutfit.lastUsed === 0 ? "never" : util.timeAgo(editedOutfit.lastUsed, now)}</div>
					</div>
					<div class="property">
						<div class="key">Used:</div>
						<div class="value">{editedOutfit.useCount} time{editedOutfit.useCount === 1 ? "" : "s"}</div>
					</div>
				</div>
				<div class="tags">
					<div class="header">Tags</div>
					<TextField icon="sell" placeholder="Add a tag..." maxLength={25} bind:value={tagName} on:enter={addTag} />
					<div class="list">
						{#each editedOutfit.tags as tag}
							<div class="tag">
								<div class="content">{tag}</div>
								<button class="remove" on:click={() => removeTag(tag)}>
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
					gap: 5px;
					font-size: 14px;

					.key {
						color: #a9a9a9;
					}

					.value {
						color: #fefefe;
					}
				}
			}

			.tags {
				display: flex;
				flex-direction: column;
				gap: 15px;

				.header {
					font-size: 16px;
					font-weight: 500;
				}

				.list {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 5px;

					.tag {
						display: flex;
						flex-direction: row;
						gap: 5px;
						padding: 5px 8px;

						background-color: #242424;
						border-radius: 4px;

						.content {
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: center;
							
							font-size: 14px;
						}

						.remove {
							all: unset;

							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: center;

							cursor: pointer;

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
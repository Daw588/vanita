<script lang="ts">
	import { onMount } from "svelte";
	import zod from "zod";
	import to from "./lib/to";

	import * as util from "./lib/util";
	import * as defs from "./lib/defs";
	import * as browser from "./lib/browser";
	import RBXApi from "./lib/rbxapi";
	import { Snackbar } from "./lib/snackbar";

	import Dialog from "./components/Dialog.svelte";
	import CircularProgressBar from "./components/CircularProgressBar.svelte";
	import PrimaryButton from "./components/PrimaryButton.svelte";
	import BottomSheetOutfitEditor from "./components/BottomSheetOutfitEditor.svelte";
	import ExpandableActionsButton from "./components/ExpandableActionsButton.svelte";
	import CheckboxDropdown from "./components/CheckboxDropdown.svelte";
	import TextField from "./components/TextField.svelte";
	import SquareButton from "./components/SquareButton.svelte";
	import Snackbars from "./components/Snackbars.svelte";

	let rbxapi: RBXApi;
	let textboxContent = "";

	let outfits: defs.Outfit[] = [];
	let filteredOutfits: defs.Outfit[] = [];
	let queryTags: { label: string, checked: boolean }[] = [];
	let userid: number;
	let lastSaved = 0;

	// Related to wear outfit functionality
	let loadingAvatar = false;
	let loadingAvatarThumbnailUrl = "";
	let loadingAvatarName = "";

	let outfitToEdit: defs.Outfit;
	let editingOutfit = false;

	let deleteAllOutfitsDialogVisible = false;
	let migrationDialogVisible = false;

	let outfitProblemDialogVisible = false;
	let outfitProblemDialogMessage = "";

	/**
	 * Whether the current active tab is currently on roblox.com
	 */
	let isTabOnRobloxSite = true;

	const extensionLogo = chrome.runtime.getURL("logo.png");

	type ErrorDialog = {
		/**
		 * Whether the dialog is in visible, or hidden state.
		 */
		visible: boolean,

		/**
		 * Meaningful non-technical error message that the user will be given.
		 */
		userFacingMessage?: string,

		/**
		 * Technical details regarding the issue that occured. In other words, the raw error message.
		 */
		errorData?: string,

		title?: string
	}

	let errorDialog: ErrorDialog = {
		visible: false,
	};
	
	let storageUsageText = "";

	async function saveOutfits() {
		await chrome.storage.local.set({ "outfits/v1": defs.Outfits.parse(outfits) });
		lastSaved = Date.now();
		storageUsageText = await getStorageUsageText();
	}

	async function getLegacyOutfits(): Promise<unknown[]> {
		const data = await chrome.storage.local.get("outfit-list");
		const normalized = data["outfit-list"] || [];
		return normalized;
	}

	async function loadOutfits() {
		const data = await chrome.storage.local.get("outfits/v1");
		const normalized = data["outfits/v1"] || [];
		outfits = defs.Outfits.parse(normalized);

		const legacyData = await getLegacyOutfits();
		if (legacyData.length !== 0) {
			// There is old data present, migrate it
			// Validate legacy data
			const legacyOutfits = zod.array(defs.LegacyOutfit).parse(legacyData);
			const migratedOutfits: defs.Outfit[] = [];

			const now = Date.now();

			// Transform legacy data to the new format
			for await (const legacyOutfit of legacyOutfits) {
				const thumbnailBase64 = await browser.fetchImageBase64(legacyOutfit.thumbnailUrl);
				migratedOutfits.push({
					name: legacyOutfit.data.name,
					character: {
						assets: legacyOutfit.data.assetIds.map(assetId => {
							return {
								id: assetId
							};
						}),
						avatarType: legacyOutfit.data.playerAvatarType,
						bodyColors: legacyOutfit.data.bodyColors,
						scales: legacyOutfit.data.scale
					},
					thumbnailUrl: thumbnailBase64,
					useCount: 0,
					lastUsed: 0, // 0 is basically "never"
					modified: 0,
					created: now,
					tags: [],
				});
			}

			// Validate migrated data
			const validatedMigratedOutfits = defs.Outfits.parse(migratedOutfits);

			// Put all the migrated outfits in front of the existing outfit list
			outfits.unshift(...validatedMigratedOutfits);
			outfits = outfits; // Refresh UI

			migrationDialogVisible = true;

			// Save migration
			await saveOutfits();

			// Finally, delete the legacy data
			await chrome.storage.local.remove("outfit-list");
		}

		// for (const outfit of normalized) {
		// 	outfit.tags = [];
		// 	outfit.modified = Date.now();
		// 	outfit.useCount = 0;
		// }
		// console.log(normalized);

		storageUsageText = await getStorageUsageText();
	}

	async function getStorageUsageText() {
		const bytesUsed = await chrome.storage.local.getBytesInUse();
		const hasUnlimitedStorage = await chrome.permissions.contains({
			permissions: ["unlimitedStorage"]
		});

		if (hasUnlimitedStorage) {
			return util.formatBytes(bytesUsed);
		} else {
			const quota = chrome.storage.local.QUOTA_BYTES;
			const lower = util.formatBytes(bytesUsed);
			const upper = util.formatBytes(quota);
			const percentage = ((bytesUsed / quota) * 100).toFixed(2);
			return `${lower}/${upper} (${percentage}%);`
		}
	}

	async function isRobloxTab() {
		const currentTab = await browser.getCurrentTab();
		if (currentTab && currentTab.url) {
			const tabUrl = new URL(currentTab.url);
			if (tabUrl.hostname.endsWith(".roblox.com")) {
				return true;
			}
		}
		return false;
	}

	async function addCurrentOutfit() {
		// Do not accept empty name
		if (textboxContent.trim() === "") {
			Snackbar.show("Can't create outfit with empty name!", 3);
			return;
		}

		const avatar = await rbxapi.getCurrentAvatar();
		const thumbnailUrl = await rbxapi.getAvatarThumbnail(userid);
		const thumbnailBase64 = await browser.fetchImageBase64(thumbnailUrl);
		const now = Date.now();

		const newOutfit = {
			name: textboxContent,
			created: now,
			lastUsed: 0, // 0 is basically "never"
			modified: 0,
			tags: [],
			useCount: 0,
			character: {
				bodyColors: avatar.bodyColors,
				avatarType: avatar.playerAvatarType,
				scales: avatar.scales,
				assets: avatar.assets.map(v => {
					return {
						id: v.id,
						meta: v.meta
					};
				})
			},
			thumbnailUrl: thumbnailBase64
		};

		// Validate new outfit before attempting to save it
		const outfitParseResult = defs.Outfit.safeParse(newOutfit);
		if (outfitParseResult.success) {
			// Valid!!!
			outfits.unshift(newOutfit);
			outfits = outfits;
			textboxContent = "";
			await saveOutfits();
		} else {
			// Not valid? oof
			// Don't save, let the user know something is wrong
			errorDialog = {
				visible: true,
				title: "There was a problem with your outfit",
				userFacingMessage: `Outfit data did not pass the validation step. If Roblox isn't down, this is likely a bug and you should report it on <a href="https://github.com/Daw588/vanita/issues" target="_blank">GitHub</a> as an issue. Make sure to include the message below:`,
				errorData: outfitParseResult.error.message
			};
		}
	}

	async function deleteAllOutfits() {
		outfits = [];
		await saveOutfits();
	}

	async function wearOutfit(outfit: defs.Outfit) {
		loadingAvatarThumbnailUrl = outfit.thumbnailUrl;
		loadingAvatarName = outfit.name;
		
		loadingAvatar = true;

		await rbxapi.setPlayerAvatarType(outfit.character.avatarType);
		await rbxapi.setBodyColors(outfit.character.bodyColors);
		await rbxapi.setScales(outfit.character.scales);

		const setWearingAssets = await rbxapi.setWearingAssets(outfit.character.assets);
		if (!setWearingAssets.success) {
			if (setWearingAssets.errors) {
				for (const error of setWearingAssets.errors) {
					if (error.code === 0) {
						const assets = structuredClone(outfit.character.assets);

						for (const validationError of JSON.parse(error.message).ValidationErrors) {
							if (validationError.Message === "MissingMeta") {
								const targetAssetId = parseInt(validationError.FieldData);
								const asset = assets.find(asset => asset.id === targetAssetId);
								if (asset) {
									// Add the missing metadata
									asset.meta = {
										order: 0,
										version: 0,
										puffiness: 0
									}
								}
							}
						}

						outfitProblemDialogMessage = "Your outfit has one or more layered clothing assets that have missing metadata. Generic metadata has been attached to affected assets; clothing order will not match. Your avatar may not look as expected. It's recommended that you change order of your layered clothing assets, and overwrite the outfit.";
						outfitProblemDialogVisible = true;

						// Attempt to set assets again
						await rbxapi.setWearingAssets(assets);
					}
				}
			}

			if (setWearingAssets.invalidAssetIds) {
				const {invalidAssetIds} = setWearingAssets;

				const assetWording = invalidAssetIds.length === 1 ? "asset" : "assets";
				const hasOrHave = invalidAssetIds.length === 1 ? "has" : "been";

				const listOfAffectedAssets = invalidAssetIds
					.map(assetId => `<a href="https://www.roblox.com/catalog/${assetId}" target="_blank">${assetId}</a>`).join(",");

				outfitProblemDialogMessage = `Your outfit has ${invalidAssetIds.length} ${assetWording} that cannot be equipped. The affected ${assetWording} (${listOfAffectedAssets}) ${hasOrHave} been taken off. Your outfit may not look as expected.`;
				outfitProblemDialogVisible = true;

				// Remove invalid assets
				const assets = outfit.character.assets.filter(asset => !invalidAssetIds.includes(asset.id));
				await rbxapi.setWearingAssets(assets);
			}
		}

		await browser.reloadActiveTab();

		// TODO: Check each request to make sure that it was successful
		// TODO: Make request to validate whether the avatar that is being applied matches the avatar returned by the Roblox API
		// TODO: ^^^ This is important because sometimes the apply feature is not successful, and we don't want to make the user click multiple times as this is bad UX

		loadingAvatar = false;
		outfit.useCount++; // Outfit has been used
		outfit.lastUsed = Date.now();
		
		await saveOutfits();
	}

	async function promptToEditOutfit(outfit: defs.Outfit) {
		outfitToEdit = outfit;
		editingOutfit = true;
	}

	async function deleteOutfit(target: defs.Outfit) {
		const index = outfits.findIndex(outfit => outfit === target); // Find object with same reference
		if (index !== -1) {
			outfits.splice(index, 1);
			outfits = outfits; // Re-render
			Snackbar.show(`Successfuly deleted "${target.name}"`, 2);
		}
	}

	async function exportOutfits() {
		const [err] = await to(browser.saveJsonFile("vanita-outfits-" + Date.now(), JSON.stringify(outfits)));
		if (err) {
			Snackbar.show(err.message, 3);
		} else {
			Snackbar.show(`Exported all ${outfits.length} outfits`, 3);
		}
	}

	async function importOutfits() {
		const files = await browser.promptFilePicker({
			accept: "application/JSON"
		});

		const file = files[0];
		if (file) {
			const str = await browser.readFileAsString(file);
			const json = JSON.parse(str);
			const importedOutfits = defs.Outfits.parse(json);
			outfits.unshift(...importedOutfits);
			outfits = outfits;

			Snackbar.show(`Imported ${importedOutfits.length} outfits`, 3);
			await saveOutfits();
		}
	}

	async function closeOutfitEditor() {
		editingOutfit = false;
		outfits = outfits; // Refresh the outfits data, it might have changed
		await saveOutfits();
	}

	$: {
		let filtered = outfits;
		
		const normalizedQuery = textboxContent.trim().toLowerCase();
		const selectedQueryTags = queryTags.filter(v => v.checked);
		
		if (normalizedQuery !== "") {
			filtered = filtered.filter(outfit => {
				const normalizedName = outfit.name.toLowerCase();

				if (normalizedName.includes(normalizedQuery)) {
					return true;
				}

				return false;
			});
		}

		if (selectedQueryTags.length !== 0) {
			filtered = filtered.filter(outfit => {
				const found = outfit.tags.some(outfitTag =>
					queryTags.some(queryTag => queryTag.label === outfitTag && queryTag.checked)
				);
				return found;
			});
		}

		filteredOutfits = filtered;
	}

	$: {
		const newQueryTags = outfits.flatMap(outfit => {
			return outfit.tags.map(tag => {
				return {
					label: tag,
					checked: false
				}
			});
		});

		let changed = false;

		// If found that newQueryTags don't have the current query tag, remove it
		// AKA: Remove no longer used tags
		for (const queryTag of queryTags) {
			if (!newQueryTags.some(v => v.label === queryTag.label)) {
				const index = queryTags.findIndex(v => v.label === queryTag.label);
				if (index) {
					queryTags.splice(index, 1);
					changed = true;
				}
			}
		}

		// If found that queryTags don't have the new query tag, add it
		// AKA: Add tags that are now in use
		for (const queryTag of newQueryTags) {
			if (!queryTags.some(v => v.label === queryTag.label)) {
				queryTags.push(queryTag);
				changed = true;
			}
		}

		if (changed) {
			queryTags = queryTags;
		}
	}

	onMount(async () => {
		if (!await isRobloxTab()) {
			// Not a Roblox tab, so we can't access the Roblox API
			// Let the user know that they need to activate this extension on the roblox site
			isTabOnRobloxSite = false;
			return;
		}

		rbxapi = await RBXApi.fromCurrentSession();
		userid = (await rbxapi.getAuthenticatedUser()).id;
		await loadOutfits();
	});
</script>

<div class="root">
	{#if isTabOnRobloxSite}
		<div class="test">
			<div class="loading" data-open={loadingAvatar}>
				<div class="outfit">
					<div class="thumbnail">
						<img class="main" src={loadingAvatarThumbnailUrl} alt="Loading avatar" />
						<img class="reflection" src={loadingAvatarThumbnailUrl} alt="Loading avatar" />
					</div>
					<div class="name">{loadingAvatarName}</div>
				</div>
				<div class="progress">
					<CircularProgressBar />
					<div class="label">Configuring your avatar, please wait...</div>
				</div>
			</div>

			<Dialog
				title="Deletion Confirmation"
				description="All of your outfits will be permanently deleted. This action is irreversible. Are you sure?"
				visible={deleteAllOutfitsDialogVisible}
				actions={[
					{
						label: "Yes, Delete All Outfits",
						kind: "danger",
						onClick: () => {
							deleteAllOutfitsDialogVisible = false;
							deleteAllOutfits();
							Snackbar.show("All outfits have been deleted", 3);
						}
					},
					{
						label: "Cancel",
						kind: "normal",
						onClick: () => {
							deleteAllOutfitsDialogVisible = false;
						}
					},
				]} />

			<Dialog
				title="Migration Notice"
				description="All of your outfits have been successfully migrated to a new format. Be aware, the legacy outfits use thumbnails with lower resolution, and thus they will appear blurry in some parts of this extension where higher resolution is required. You can re-add your outfits to fully migrate them."
				visible={migrationDialogVisible}
				actions={[
					{
						label: "Understood",
						kind: "normal",
						onClick: () => {
							migrationDialogVisible = false;
						}
					},
				]} />

			<Dialog
				title={errorDialog.title ?? ""}
				description={`${errorDialog.userFacingMessage}<br/><br/><code>${errorDialog.errorData}</code>` ?? ""}
				visible={errorDialog.visible}
				actions={[
					{
						label: "Understood",
						kind: "normal",
						onClick: () => {
							errorDialog.visible = false;
						}
					},
				]}
				allowHTML={true} />

			<Dialog
				title="There was a problem with your outfit"
				description={outfitProblemDialogMessage}
				visible={outfitProblemDialogVisible}
				actions={[
					{
						label: "Understood",
						kind: "normal",
						onClick: () => {
							outfitProblemDialogVisible = false;
						}
					},
				]}
				allowHTML={true} />
			
			<BottomSheetOutfitEditor
				rbxapi={rbxapi}
				userId={userid}
				outfit={outfitToEdit}
				open={editingOutfit}
				on:close={closeOutfitEditor}
				on:deleteOutfit={event => deleteOutfit(event.detail)} />

			<div class="top">
				<div class="search">
					<TextField icon="search" placeholder="Enter desired outfit name" bind:value={textboxContent} />
				</div>
				<PrimaryButton label="Add" icon="add" on:click={addCurrentOutfit} />
				<CheckboxDropdown bind:items={queryTags} label="Tags" emptyMessage="You haven't created any tags yet" />
				<ExpandableActionsButton direction="down" actions={[
					{
						label: "Import",
						icon: "input",
						dangerous: false,
						onTriggered: importOutfits
					},
					{
						label: "Export",
						icon: "output",
						dangerous: false,
						onTriggered: exportOutfits
					},
					{
						label: "Delete All",
						icon: "delete_forever",
						dangerous: true,
						onTriggered: () => deleteAllOutfitsDialogVisible = true
					},
				]} />
			</div>

			<div class="list">
				<div class="fade"></div>
				<div class="outfits">
					{#each filteredOutfits as outfit}
						<div class="outfit">
							<img
								class="thumbnail"
								src={outfit.thumbnailUrl}
								alt="Thumbnail of {outfit.name} outfit" />
							
							<span class="tooltip">{outfit.name}</span>
							<button class="outfit-button" on:click={() => wearOutfit(outfit)} />
							<div class="configure">
								<SquareButton icon="edit" on:click={() => promptToEditOutfit(outfit)} />
							</div>
						</div>
					{/each}
				</div>
				<div class="notice">
					{#if outfits.length === 0}
						<div class="message">You haven't created any outfits yet.</div>
					{/if}

					{#if outfits.length > 0 && filteredOutfits.length === 0}
						<div class="message">None of your outfits matched your query.</div>
					{/if}
				</div>
			</div>

			<div class="bottom">
				<div class="left">
					<div>{storageUsageText}</div>
					<div>-</div>
					<div>{lastSaved === 0 ? "No changes were made" : `Saved changes ${util.timeAgo(lastSaved, Date.now())}`}</div>
				</div>
				<div class="right">
					<div>{util.formatNumber(outfits.length)} outfits</div>
				</div>
			</div>
		</div>

		<Snackbars />
	{:else}
		<div class="foreign-tab-warning">
			<img src={extensionLogo} alt="Logo of the extension" />
			<div class="heading">Vanita only works on roblox.com</div>
			<a class="link" href="https://www.roblox.com/" target="_blank">
				<PrimaryButton label="Take me to Roblox" />
			</a>
		</div>
	{/if}
</div>

<style lang="scss">
	@keyframes popout {
		from { transform: scale(0) }
		80% { transform: scale(1.1) }
		to { transform: scale(1) }
	}

	@keyframes shake {
		0% { transform: translate(1px, 1px) rotate(0deg); }
		10% { transform: translate(-1px, -2px) rotate(-1deg); }
		20% { transform: translate(-3px, 0px) rotate(1deg); }
		30% { transform: translate(3px, 2px) rotate(0deg); }
		40% { transform: translate(1px, -1px) rotate(1deg); }
		50% { transform: translate(-1px, 2px) rotate(-1deg); }
		60% { transform: translate(-3px, 1px) rotate(0deg); }
		70% { transform: translate(3px, 1px) rotate(-1deg); }
		80% { transform: translate(-1px, -1px) rotate(1deg); }
		90% { transform: translate(1px, 2px) rotate(0deg); }
		100% { transform: translate(1px, -2px) rotate(-1deg); }
	}

	.root {
		width: 568px;
		min-height: 568px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.foreign-tab-warning {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		font-size: 16px;
		gap: 15px;

		.heading {
			font-size: 18px;
			font-weight: 600;
		}

		.link {
			all: unset;
			margin-top: 15px;
		}
	}

	// data-open={bool} trait implementation
	.loading {
		&[data-open=true] { visibility: visible; }
		&[data-open=false] { display: none; }
	}

	.loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
		z-index: 6;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 25px;

		.outfit {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 15px;

			.thumbnail {
				position: relative;
				width: 250px;
				height: 250px;

				.reflection {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;

					-webkit-box-reflect:
						below -20px linear-gradient(to bottom, rgba(0, 0 , 0, 0) 70%, rgba(0, 0, 0, 0.2));
					
					z-index: 1;
				}

				.main {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;

					filter: drop-shadow(0 0 50px rgba(255, 255, 255, 0.5));
					z-index: 2;
				}
			}

			.name {
				font-size: 28px;
				font-weight: 700;
			}
		}

		.progress {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 15px;

			.label {
				font-size: 16px;
			}
		}
	}

	.test {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 568px;
		padding: 10px;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;

		.search {
			flex-grow: 1;
		}
	}
	
	.list {
		position: relative;
		
		.fade {
			content: "";
			width: calc(100% - 10px);
			height: 100%;
			position: absolute;
			left: 0;
			top: 0;
			background: linear-gradient(transparent 95%, #171717);
			pointer-events: none;
			z-index: 4;
		}

		.notice {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			.message {
				font-size: 14px;
				color: #999999;
			}
		}
	}

	.outfits {
		margin-top: 10px;
		height: 500px;
		object-fit: cover;
		overflow-y: auto;
		overflow-x: hidden;

		display: grid;

		grid-template-columns:
			var(--thumbnail-size)
			var(--thumbnail-size)
			var(--thumbnail-size)
			var(--thumbnail-size);

		align-content: start;

		gap: 10px;
		padding-bottom: calc(100% - 95%);

		.outfit {
			width: var(--thumbnail-size);
			height: var(--thumbnail-size);

			position: relative;
			border-radius: 8px;

			.tooltip {
				position: absolute;
				bottom: 0;
				left: 0;
				margin: 4px;
				padding: 4px;
				padding-left: 6px;
				padding-right: 6px;
				background-color: rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(15px);
				border-radius: 4px;
				font-size: 12px;
				opacity: 0;
				transition: opacity 100ms ease;
				text-wrap: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
				max-width: calc(var(--thumbnail-size) - (4px * 2));
				z-index: 1;
			}

			.configure {
				position: absolute;
				right: 0;
				top: 0;
				margin: 4px;
				// opacity: 0;
				visibility: hidden;
				z-index: 4;
			}

			.outfit-button {
				all: unset;

				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 2;
			}

			&:hover, &:has(.outfit-button:focus-visible) {
				.configure {
					// opacity: 1;
					visibility: visible;
					animation: popout 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
				}
			}

			&:has(.outfit-button:focus-visible) {
				box-shadow: 0 0 3pt 2pt #679aff;
			}

			&:has(.outfit-button:hover), &:has(.outfit-button:focus-visible) {
				.tooltip {
					opacity: 1;
					animation: popout 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
				}

				.thumbnail {
					// animation: shake 90ms ease;
					background: radial-gradient(transparent, rgba(255, 255, 255, 0.01));
					filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.3));
				}
			}

			.thumbnail {
				// background-color: #2f3133;
				border-radius: 8px;
				transition: background 300ms linear;
				border: 1px solid #3a3a3a;
				width: var(--thumbnail-size);
				height: var(--thumbnail-size);
				transition:
					filter 100ms ease,
					background-color 50ms ease;
			}

			display: flex;
			flex-direction: column;
			cursor: pointer;
		}
	}

	.bottom {
		display: flex;
		flex-direction: row;
		margin-top: 10px;

		.left {
			display: flex;
			flex-direction: row;
			gap: 5px;
			flex-grow: 1;
		}

		.right {
			display: flex;
			flex-direction: row;
			gap: 5px;
		}
	}
</style>

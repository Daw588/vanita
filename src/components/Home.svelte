<script lang="ts">
	import { onMount } from "svelte";

	import { formatBytes, formatNumber, timeAgo, toDesiredImageCodec, type Option } from "../modules/util";
	import { fetchImageBase64, promptFilePicker, reloadActiveTab, sendToServiceWorker } from "../lib/browser";
	import { currentPage } from "../modules/stores";
	import { RBXApi } from "../modules/rbxapi";
	import { Snackbar } from "../modules/snackbar";
	// import { promptLackOfAuthForCloudProvider } from "../modules/shared";
	import { read, write } from "../modules/wardrobe/browser-storage";

	import InfoDialog from "./core/InfoDialog.svelte";
	import PrimaryButton from "./core/PrimaryButton.svelte";
	import BottomSheetOutfitEditor from "./BottomSheetOutfitEditor.svelte";
	import ExpandableActionsButton from "./core/ExpandableActionsButton.svelte";
	import TextField from "./core/TextField.svelte";
	import { AvatarType, outfitSchema, type Outfit, type Wardrobe } from "../modules/wardrobe/codec/v0";
	import { getUserIdFromCurrentProfilePage } from "../modules/util";
	import { deleteOutfit, duplicateOutfit, rbxToVec3, wearOutfit, type LoadedOutfit, type QueryTag, type TagQueryMode } from "../modules/wardrobe/outfits";
	import { hex2rgb } from "../lib/color";
	import ExportModal from "./ExportModal.svelte";
	import { clamp } from "../lib/math";
	import TagManagementDropdown from "./TagManagementDropdown.svelte";
	import { promptLackOfAuthForCloudProvider } from "../modules/shared";
	import { importWardrobe } from "../modules/wardrobe/itself";
	import OutfitSquare from "./OutfitSquare.svelte";
	import OutfitOperationOverlay from "./OutfitOperationOverlay.svelte";
	import InvalidOutfitAssetsModal, { type InvalidAsset } from "./InvalidOutfitAssetsModal.svelte";

	let userIdFromCurrentProfilePage = $state<Option<number>>(null);
	let rbxapi = $state<Option<RBXApi>>(null);
	let textboxContent = $state<string>("");

	let goutfits = $state<LoadedOutfit[]>([]);
	let gwardrobe = $state<Option<Wardrobe>>(null);

	let filteredOutfits = $state<LoadedOutfit[]>([]);
	let queryTags = $state<QueryTag[]>([]);
	let tagQueryMode = $state<TagQueryMode>("and"); // $state<TagQueryMode>("and");
	let authenticatedUserId = $state<Option<number>>(null);
	let lastSaved = $state<number>(0); // 0 means never
	let exportAllOutfitsModalOpen = $state<boolean>(false);

	// Related to wear outfit functionality
	let avatarLoadingOverlayEnabled = $state<boolean>(false);
	let avatarLoadingOverlayData = $state({
		thumbnail: "",
		name: "",
		message: ""
	});

	let outfitToEdit = $state<Option<LoadedOutfit>>(null);
	let editingOutfit = $state<boolean>(false);

	// let invalidOutfitAssetsDialog = $state<{ open: boolean, assets: { id: number, name: string, thumbnailUrl?: string }[] }>({
	// 	open: false,
	// 	assets: []
	// });

	let invalidOutfitAssetsModalList = $state<InvalidAsset[]>([]);
	let invalidOutfitAssetsModalOpen = $state<boolean>(false);

	let deleteAllOutfitsDialogVisible = $state<boolean>(false);

	let outfitProblemDialogVisible = $state<boolean>(false);
	let outfitProblemDialogMessage = $state<string>("");

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

	let errorDialog = $state<ErrorDialog>({
		visible: false,
	});
	
	let saveSize = $state<number>(0);

	async function createOutfitFromUserId(userId: number) {
		// const avatar = await rbxapi.getCurrentAvatar();

		const thumbnailUrl = await rbxapi!.getAvatarThumbnail(userId);
		const thumbnailBase64 = await fetchImageBase64(thumbnailUrl);

		const thumbnailBlob = await toDesiredImageCodec(thumbnailBase64!, "image/webp", 0.9);
		const thumbnailURL = URL.createObjectURL(thumbnailBlob);
		const thumbnail = await thumbnailBlob.arrayBuffer();

		avatarLoadingOverlayData.thumbnail = thumbnailURL;

		const avatar = await rbxapi!.getAvatarFromUserId(userId);
		const now = Date.now();

		console.debug("received avatar", avatar);

		const newOutfit: Outfit = {
			name: textboxContent,
			created: now,
			lastUsed: 0, // 0 is basically "never"
			modified: 0,
			useCount: 0,
			tags: [],

			width: avatar.scales.width,
			height: avatar.scales.height,
			head: avatar.scales.head,
			depth: avatar.scales.depth,
			proportion: avatar.scales.proportion,
			bodyType: avatar.scales.bodyType,
			avatarType: avatar.playerAvatarType === "R15" ? AvatarType.R15 : AvatarType.R6,

			headColor: hex2rgb(avatar.bodyColor3s.headColor3)!,
			torsoColor: hex2rgb(avatar.bodyColor3s.torsoColor3)!,
			leftArmColor: hex2rgb(avatar.bodyColor3s.leftArmColor3)!,
			rightArmColor: hex2rgb(avatar.bodyColor3s.rightArmColor3)!,
			leftLegColor: hex2rgb(avatar.bodyColor3s.leftLegColor3)!,
			rightLegColor: hex2rgb(avatar.bodyColor3s.rightLegColor3)!,

			assets: avatar.assets.map(asset => {
				if (asset.meta) {
					return {
						hasMetadata: true,
						id: asset.id,
						puffiness: clamp(asset.meta.puffiness ?? 1, -100, 100),
						order: clamp(asset.meta.order ?? 0, 0, 255),

						// biome-ignore lint/suspicious/noExplicitAny: temporary
						position: rbxToVec3((asset.meta as any).position),
						// biome-ignore lint/suspicious/noExplicitAny: temporary
						rotation: rbxToVec3((asset.meta as any).rotation),
						// biome-ignore lint/suspicious/noExplicitAny: temporary
						scale: rbxToVec3((asset.meta as any).scale),
					};
				}

				return {
					hasMetadata: false,
					id: asset.id
				};
			}),

			// character: {
			// 	bodyColors: avatar.bodyColors,
			// 	avatarType: avatar.playerAvatarType,
			// 	scales: avatar.scales,
			// 	assets: avatar.assets.map(v => {
			// 		return {
			// 			id: v.id,
			// 			meta: v.meta
			// 		};
			// 	})
			// },
			thumbnail
		};

		console.debug("new outfit", newOutfit);

		// Validate new outfit before attempting to save it
		const outfitParseResult = outfitSchema.safeParse(newOutfit);
		if (outfitParseResult.success) {
			// Valid!!!
			goutfits.unshift({
				...outfitParseResult.data,
				thumbnailUrl: URL.createObjectURL(thumbnailBlob)
			});

			// goutfits = goutfits;
			textboxContent = "";
			// await saveOutfits();
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

	async function addOutfit() {
		// Do not accept empty name
		if (textboxContent.trim() === "") {
			Snackbar.show("Can't create outfit with empty name!", 3);
			return;
		}

		avatarLoadingOverlayData = {
			message: userIdFromCurrentProfilePage ? "Creating outfit for the avatar on the page, please wait..." : "Creating outfit for your avatar, please wait...",
			name: textboxContent,
			thumbnail: ""
		};
		avatarLoadingOverlayEnabled = true;

		// TODO: This is not right, I think? Needs to be looked into
		await createOutfitFromUserId(userIdFromCurrentProfilePage ?? authenticatedUserId!);

		avatarLoadingOverlayEnabled = false;
	}

	async function deleteAllOutfits() {
		goutfits = [];
		// await saveOutfits();
	}

	// TODO: This function needs some refactoring, but for now it's acceptable I suppose
	async function doWearOutfit(outfit: LoadedOutfit) {
		avatarLoadingOverlayData = {
			thumbnail: URL.createObjectURL(new Blob([outfit.thumbnail])),
			name: outfit.name,
			message: "Configuring your avatar, please wait..."
		};
		avatarLoadingOverlayEnabled = true;

		let fatalProblem = false;

		await wearOutfit(rbxapi!, outfit, async (problem) => {
			if (problem.issue === "metdata") {
				outfitProblemDialogMessage = "Your outfit has one or more layered clothing assets that have missing metadata. Generic metadata has been attached to affected assets; clothing order will not match. Your avatar may not look as expected. It's recommended that you change order of your layered clothing assets, and overwrite the outfit.";
				outfitProblemDialogVisible = true;
			} else if (problem.issue === "invalid_asset") {
				fatalProblem = true;

				const assetsDetails = await rbxapi!.getCatalogAssetDetails(problem.invalidAssetIds);
				const assetsThumbnails = await rbxapi!.getAssetThumbnail({
					assetIds: problem.invalidAssetIds,
					format: "Png",
					isCircular: false,
					returnPolicy: "PlaceHolder",
					size: "75x75"
				});

				invalidOutfitAssetsModalList = assetsDetails.map(assetDetails => (
					{
						name: assetDetails.name,
						id: assetDetails.id,
						thumbnailUrl: assetsThumbnails.find(thumbnail => thumbnail.targetId === assetDetails.id)?.imageUrl
					}
				));
				invalidOutfitAssetsModalOpen = true;
			}
		});

		if (fatalProblem) {
			avatarLoadingOverlayEnabled = false;
		} else {
			await reloadActiveTab();

			// TODO: Check each request to make sure that it was successful
			// TODO: Make request to validate whether the avatar that is being applied matches the avatar returned by the Roblox API
			// TODO: ^^^ This is important because sometimes the apply feature is not successful, and we don't want to make the user click multiple times as this is bad UX

			avatarLoadingOverlayEnabled = false;
			outfit.useCount++; // Outfit has been used
			outfit.lastUsed = Date.now();

			// await saveOutfits();
		}
	}

	async function promptToEditOutfit(outfit: LoadedOutfit) {
		outfitToEdit = outfit;
		editingOutfit = true;
	}

	async function importOutfits() {
		const files = await promptFilePicker({
			accept: [".json", ".vanita"]
		});

		for await (const file of files) {
			await importWardrobe(file, queryTags, goutfits);
		}

		// const file = files[0];
		// if (file) {
		// 	const str = await readFileAsString(file);
		// 	const json = JSON.parse(str);
		// 	const importedOutfits = defs.Outfits.parse(json);
		// 	outfits.unshift(...importedOutfits);
		// 	outfits = outfits;

		// 	Snackbar.show(`Imported ${importedOutfits.length} outfit${importedOutfits.length === 1 ? "" : "s"}`, 3);
		// 	await saveOutfits();
		// }
	}

	async function closeOutfitEditor() {
		editingOutfit = false;
		// await saveOutfits();
	}

	// Query/search algorithm
	$effect(() => {
		console.debug("query mode changed", tagQueryMode);

		let filtered = goutfits;
		
		const normalizedQuery = textboxContent.trim().toLocaleLowerCase();
		const selectedQueryTags = queryTags.filter(v => v.checked);

		// let searchActive = false;
		
		if (normalizedQuery !== "") {
			// searchActive = true;

			filtered = filtered.filter(outfit => {
				const normalizedName = outfit.name.toLocaleLowerCase();

				if (normalizedName.includes(normalizedQuery)) {
					return true;
				}

				return false;
			});
		}

		if (selectedQueryTags.length !== 0) {
			// searchActive = true;

			filtered = filtered.filter(outfit => {
				if (tagQueryMode === "and") {
					// Must have all the selected (checked) tags

					if (outfit.tags.length === 0) {
						return false;
					}

					for (let tagId = 0; tagId < queryTags.length; tagId++) {
						if (!queryTags[tagId]!.checked) continue;

						if (!outfit.tags.includes(tagId)) {
							return false;
						}
					}

					return true;
				}

				// Has to have at least one tag that is selected (checked)
				return outfit.tags.some(outfitTagId =>
					queryTags.some(
						(queryTag, queryTagId) => queryTagId === outfitTagId && queryTag.checked
					)
				);
			});
		}

		// TODO: Make this happen once there is setting for this (e.g., "alphabetical", "creation date", "modification date")
		// and modifiers like "ascending" and "descending"

		// Sort so that the outfits are in alphabetical order
		// if (!searchActive) {
		// 	filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
		// }

		filteredOutfits = filtered;
	});

	async function fetchRobloxDetails() {
		const t0 = performance.now();

		rbxapi = await RBXApi.fromCurrentSession();

		const cache = await chrome.storage.session.get("authenticatedUserId");
		const userId = cache["authenticatedUserId"];
		if (userId) {
			authenticatedUserId = userId;
		} else {
			const newUserId = (await rbxapi.getAuthenticatedUser()).id;
			authenticatedUserId = newUserId;
			chrome.storage.session.set({ authenticatedUserId: newUserId });
		}

		userIdFromCurrentProfilePage = await getUserIdFromCurrentProfilePage();

		console.debug("loaded ROBLOX API", performance.now() - t0, "ms");
	}

	let outfitNameSuggestions = $derived.by(() => {
		return goutfits.map(v => v.name)
			.filter(name => name.toLocaleLowerCase()
			.includes(textboxContent.toLocaleLowerCase()))
			.splice(0, 8);
	});

	let loadingOutfits = $state(true);

	async function runBackupCycle() {
		const resp = await sendToServiceWorker("CreateAutomaticBackup");
		console.debug("CreateAutomaticBackup responded with:", resp, typeof resp);
		if (!resp.success && resp.error === "user_unauthenticated") {
			await promptLackOfAuthForCloudProvider();
		}
	}

	let currentTime = $state(Date.now());

	onMount(async () => {
		setInterval(() => {
			currentTime = Date.now();
		}, 1000); // update every second

		fetchRobloxDetails();

		const t = performance.now();
		const wardrobe = await read();
		console.debug("read wardrobe in", performance.now() - t, "ms");

		if (wardrobe) {
			gwardrobe = wardrobe;
			goutfits = wardrobe.outfits.slice(0, 1000).map(outfit => {
				const blob = new Blob([outfit.thumbnail]);
				return {
					...outfit,
					thumbnailUrl: URL.createObjectURL(blob)
				};
			});

			queryTags = wardrobe.tags.map((tagName, id) => {
				return {
					id,
					label: tagName,
					checked: false,
				};
			});

			console.debug("read wardrobe", wardrobe, queryTags);

			loadingOutfits = false;

			await runBackupCycle();
		}
	});

	async function save() {
		const result = await write(queryTags.map(v => v.label), goutfits.map(v => {
			const { thumbnailUrl, ...f } = v;
			return f;
		}));

		if (result.success) {
			lastSaved = Date.now();
			saveSize = result.value.size;
		} else {
			console.warn("Failed to save", result.error);
		}
	}

	$effect(() => {
		// DO NOT SAVE UNTIL OUTFITS ARE LOADED
		// OTHERWISE DATA WILL BE OVERWRITTEN WITH NOTHING
		// THUS RESULTING IN DATA LOSS!!!!!!!!
		if (!loadingOutfits) { // DO NOT REMOVE THIS LINE UNDER ANY CIRCUMSTANCES!!!!!!!!
			console.debug(goutfits, queryTags, "changed");
			save();
		}
	});
</script>

<div class="test">
	<OutfitOperationOverlay enabled={avatarLoadingOverlayEnabled} data={avatarLoadingOverlayData} />

	{#if gwardrobe}
		<ExportModal
			open={exportAllOutfitsModalOpen}
			wardrobe={gwardrobe}
			onClose={() => exportAllOutfitsModalOpen = false} />
	{/if}

	<InfoDialog
		title="Delete all outfits?"
		description="This action is irreversible."
		visible={deleteAllOutfitsDialogVisible}
		actions={[
			{
				label: "Delete",
				kind: "negative",
				onClick: () => {
					deleteAllOutfitsDialogVisible = false;
					deleteAllOutfits();
					Snackbar.show("All outfits have been deleted", 3);
				}
			},
			{
				label: "Cancel",
				kind: "neutral",
				onClick: () => {
					deleteAllOutfitsDialogVisible = false;
				}
			},
		]} />

	<InfoDialog
		title={errorDialog.title ?? ""}
		description={`${errorDialog.userFacingMessage}<br/><br/><code>${errorDialog.errorData}</code>`}
		visible={errorDialog.visible}
		actions={[
			{
				label: "Understood",
				kind: "positive",
				onClick: () => {
					errorDialog.visible = false;
				}
			},
		]}
		allowHTML={true} />

	<InfoDialog
		title="There was a problem with your outfit"
		description={outfitProblemDialogMessage}
		visible={outfitProblemDialogVisible}
		actions={[
			{
				label: "Understood",
				kind: "positive",
				onClick: () => {
					outfitProblemDialogVisible = false;
				}
			},
		]}
		allowHTML={true} />

	<InvalidOutfitAssetsModal open={invalidOutfitAssetsModalOpen} assets={invalidOutfitAssetsModalList} />
	
	<BottomSheetOutfitEditor
		rbxapi={rbxapi}
		userId={authenticatedUserId}
		outfit={outfitToEdit}
		open={editingOutfit}
		allTags={queryTags}
		onClose={closeOutfitEditor}
		onDuplicateOutfit={outfit => duplicateOutfit(goutfits, $state.snapshot(outfit)) }
		onDeleteOutfit={outfit => deleteOutfit(goutfits, outfit) }/>

	<div class="top">
		<div class="search">
			<TextField
				icon="search"
				placeholder="Enter desired outfit name"
				autocomplete={true}
				suggestions={outfitNameSuggestions}
				bind:value={textboxContent} />
		</div>
		<PrimaryButton label={userIdFromCurrentProfilePage ? "Add from Page" : "Add Mine"} icon="add" onClick={addOutfit} />
		<TagManagementDropdown tags={queryTags} bind:mode={tagQueryMode} outfits={goutfits} />
		<ExpandableActionsButton direction="down" actions={[
			{
				label: "Settings",
				icon: "settings",
				dangerous: false,
				onTriggered: () => currentPage.set("settings")
			},
			{
				label: "Import",
				icon: "input",
				dangerous: false,
				onTriggered: importOutfits
			},
			{
				label: "Export All",
				icon: "output",
				dangerous: false,
				onTriggered: () => exportAllOutfitsModalOpen = true // util.exportOutfits(outfits)
			},
			{
				label: "Delete All",
				icon: "delete_forever",
				dangerous: true,
				onTriggered: () => deleteAllOutfitsDialogVisible = true
			}
		]} />
	</div>

	<div class="outfit-grid">
		<div class="fade"></div>
		<div class="outfits">
			{#each filteredOutfits as outfit}
				<OutfitSquare
					name={outfit.name}
					thumbnail={outfit.thumbnailUrl}
					onEditOutfit={() => promptToEditOutfit(outfit)}
					onWearOutfit={() => doWearOutfit(outfit)} />
			{/each}
		</div>
		{#if !loadingOutfits}
			<div class="notice">
				{#if goutfits.length === 0}
					<div class="message">You haven't created any outfits yet.</div>
				{/if}

				{#if goutfits.length > 0 && filteredOutfits.length === 0}
					<div class="message">None of your outfits matched your query.</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="bottom">
		{#if !loadingOutfits}
			<div class="left">
				<div>{formatBytes(saveSize, 2)}</div>
				<div>-</div>
				<div>{lastSaved === 0 ? "No changes were made" : `Saved changes ${timeAgo(lastSaved, currentTime).toLocaleLowerCase()}`}</div>
			</div>
			<div class="right">
				<div>{formatNumber(goutfits.length)} outfits</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
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
	
	.outfit-grid {
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

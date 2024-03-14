<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	import Dialog from "./core/Dialog.svelte";
	import PrimaryButton from "./core/PrimaryButton.svelte";

	import { Snackbar } from "../lib/snackbar";
	import CircularProgressBar from "./core/CircularProgressBar.svelte";
	import ExpandableActionsButton from "./core/ExpandableActionsButton.svelte";
	import { formatBytes } from "../lib/util";
	import SquareButton from "./core/SquareButton.svelte";
	import createInfoDialog from "../lib/create-info-dialog";
	import * as backup from "../lib/backup";
	import { promptLackOfAuthForCloudProvider } from "../lib/interface/shared";
	import { settings } from "../lib/stores";
	import { GoogleOAuth2 } from "../lib/oauth2";
	// import { EXTENSION_ID } from "../globals";

	const deleteRestorePointConfirmationPrompt = createInfoDialog({
		title: "Deletion Confirmation",
		description: "This restore point will be permanently deleted. This action is irreversible. Are you sure?",
		actions: [
			{ label: "Yes, Delete This Restore Point", kind: "danger", value: true },
			{ label: "Cancel", kind: "normal", value: false },
		],
		dismissible: true
	});

	const deleteAllRestorePointsConfirmationPrompt = createInfoDialog({
		title: "Deletion Confirmation",
		description: "All of your restore points will be permanently deleted. This action is irreversible. Are you sure?",
		actions: [
			{ label: "Yes, Delete All Restore Points", kind: "danger", value: true },
			{ label: "Cancel", kind: "normal", value: false },
		],
		dismissible: true
	});

	const restoreConfirmationPrompt = createInfoDialog({
		title: "Restore Confirmation",
		description: "All of your current outfits will be replaced with the selected restore point. This action is irreversible. Are you sure?",
		actions: [
			{ label: "Yes, Restore", kind: "danger", value: true },
			{ label: "Cancel", kind: "normal", value: false },
		],
		dismissible: true
	});

	const disconnectProviderPrompt = createInfoDialog({
		title: "Disconnection Confirmation",
		description: "Vanita will disconnect from your cloud provider. If you wish to access your restore points again, you will need to connect it again. Your restore points will remain intact; no deletion will take place. Are you sure?",
		actions: [
			{ label: "Yes, Disconnect", kind: "danger", value: true },
			{ label: "Cancel", kind: "normal", value: false },
		],
		dismissible: true
	});

	export let open: boolean;

	type Events = {
		close: void
	}

	const dispatch = createEventDispatcher<Events>();

	const googleDriveLogo = chrome.runtime.getURL("google-drive.png");
	// const oneDriveLogo = chrome.runtime.getURL("one-drive.svg");
	// const dropboxLogo = chrome.runtime.getURL("dropbox.svg");

	type CloudProvider = "google-drive"/* | "dropbox" | "one-drive"*/;

	let cloudProvider: CloudProvider = "google-drive";

	type Page = "connect-provider" | "configuration";

	let page: Page = "connect-provider";

	async function connect() {
		// Experimental support for Google OAuth2 in non Chrome browsers
		// turns out i need a client_secret in order to get refresh tokens which can last up to 6 months
		// while using response_type token without access_type returns a token which expires in about an hour (very undesirable for automatic backup)
		// in the future we might get server involved so we can complete the OAuth2 via it, and get the refresh tokens
		// for now, this will only work for browsers that support getAuthToken, assuming it's probably only Chrome

		// const authParams = new URLSearchParams({
		// 	client_id: CLIENT_ID,
		// 	redirect_uri: REDIRECT_URL,
		// 	response_type: "code",
		// 	access_type: "offline",
		// 	scope: [
		// 		"https://www.googleapis.com/auth/drive.appdata",
		// 		"https://www.googleapis.com/auth/drive.file"
		// 	].join(" "),
		// });

		// if (authUrl) {
		// 	console.log(authUrl);

		// 	const url = new URL(authUrl);

		// 	console.log(url.hash);

		// 	const params = new URLSearchParams(url.hash.substring(1));
		// 	const authToken = params.get("auth_token");
		// 	const tokenType = params.get("token_type");
		// 	const expiresIn = params.get("expires_in");
		// 	const scope = params.get("scope");

		// 	console.log("OAuth2 consent success", { authToken, tokenType, expiresIn, scope });
		// }

		// const auth = await chrome.identity.getAuthToken({ interactive: true });
		// console.log(auth);

		// if (browser.getBrowserType() === "opera") {

		// }

		const token = await GoogleOAuth2.getToken({ interactive: true });
		if (token) {
			// Success!
			page = "configuration";
		}
	}

	async function refreshRestorePoints() {
		const recoveryPointsResult = await backup.getRestorePoints();
		if (!recoveryPointsResult.success) {
			if (recoveryPointsResult.error === "user_unauthenticated") {
				const actionTaken = await promptLackOfAuthForCloudProvider();
				if (actionTaken === "authorized") {
					await refreshRestorePoints();
					return;
				}
			}
			return;
		}

		restorePoints = recoveryPointsResult.value.map(v => ({ ...v, selected: false }));
	}

	async function deleteRestorePoint(fileId: string) {
		const confirmed = await deleteRestorePointConfirmationPrompt.invoke();
		if (!confirmed) {
			return;
		}

		loadingScreenEnabled = true;

		const result = await backup.deleteRestorePoint(fileId);
		if (result.success) {
			Snackbar.show("Restore point has been deleted", 3);
			await refreshRestorePoints();
		}

		loadingScreenEnabled = false;
	}

	let loadingRestorePoints = false;

	// Whenever dialog gets opened
	async function onOpen() {
		const token = await GoogleOAuth2.getToken({ interactive: false });
		if (token) {
			// Connected
			page = "configuration";

			if (await backup.isEnabled()) {
				loadingRestorePoints = true;
				await refreshRestorePoints();
				loadingRestorePoints = false;
			}
		} else {
			// Not connected
			page = "connect-provider";
		}
	}

	$: if (open) onOpen();

	function save() {
		dispatch("close");
	}

	/**
	 * Deletes all restore points, and no confirmation is given.
	 * Returns a boolean value which indicates whether the operation was successful or not.
	 */
	async function deleteAllRestorePoints() {
		const confirmed = await deleteAllRestorePointsConfirmationPrompt.invoke();
		if (!confirmed) {
			return;
		}

		loadingScreenEnabled = true;

		const result = await backup.deleteAllRestorePoints();
		if (result.success) {
			Snackbar.show("All restore points have been deleted", 3);
			await refreshRestorePoints();
		}

		loadingScreenEnabled = false;
	}

	async function restoreFromRestorePoint(fileId: string) {
		const confirmed = await restoreConfirmationPrompt.invoke();
		if (!confirmed) {
			return;
		}

		loadingScreenEnabled = true;

		const result = await backup.restoreFromRestorePoint(fileId);
		if (result.success) {
			Snackbar.show("Restored from the selected restore point", 3);
		}

		loadingScreenEnabled = false;
	}

	async function createRestorePoint() {
		loadingScreenEnabled = true;

		const result = await backup.createRestorePoint({ automatic: false });
		if (result.success) {
			Snackbar.show("Restore point has been created", 3);
			await refreshRestorePoints();
		}

		loadingScreenEnabled = false;
	}

	async function disconnectProvider() {
		const confirmed = await disconnectProviderPrompt.invoke();
		if (confirmed) {
			console.log("Disconnecting...");
			loadingScreenEnabled = true;

			if (await GoogleOAuth2.revokeAccess()) {
				settings.set({ backupEnabled: false });
			}

			loadingScreenEnabled = false;
		}
	}

	let dateFmt: Intl.DateTimeFormat;
	let restorePoints: (backup.RestorePoint & { selected: boolean })[] = [];

	let loadingScreenEnabled = false;

	onMount(async () => {
		const detectedLocale = Intl.NumberFormat().resolvedOptions().locale;
		
		dateFmt = new Intl.DateTimeFormat(detectedLocale, {
			dateStyle: "medium",
			timeStyle: "short"
		});
	});
</script>

<Dialog open={loadingScreenEnabled}>
	<div class="manual-restore-point-creation-dialog">
		<CircularProgressBar />
	</div>
</Dialog>

<Dialog open={open}>
	<div class="root">
		<div class="page{page === "connect-provider" ? " active" : ""}">
			<div>What cloud service provider to use?</div>
			<div class="providers">
				<button class="provider{cloudProvider === "google-drive" ? " selected" : ""}" on:click={() => cloudProvider = "google-drive"}>
					<img class="logo" src={googleDriveLogo} alt="Google Drive logo" />
				</button>
				<!-- <button class="provider{cloudProvider === "one-drive" ? " selected" : ""}" on:click={() => cloudProvider = "one-drive"}>
					<img class="logo" src={oneDriveLogo} alt="OneDrive logo" />
				</button>
				<button class="provider{cloudProvider === "dropbox" ? " selected" : ""}" on:click={() => cloudProvider = "dropbox"}>
					<img class="logo" src={dropboxLogo} alt="Dropbox logo" />
				</button> -->
			</div>
			<PrimaryButton label="Connect" on:click={connect} />
		</div>
		<div class="page{page === "configuration" ? " active" : ""}">
			<!-- <div>Backups to keep at any given time:</div>
			<select>
				<option>1</option>
				<option>2</option>
				<option selected>3 (Recommended for most users)</option>
				<option>4</option>
				<option>5</option>
				<option>6</option>
				<option>7</option>
			</select> -->
			<div class="top">
				<div class="title">Restore Points</div>
				<SquareButton icon="close" on:click={save} />
			</div>
			<div class="restore-points">
				{#if restorePoints.length === 0}
					{#if loadingRestorePoints}
						<div class="loading"><CircularProgressBar /></div>
					{:else}
						<div class="message">You don't have any restore points</div>
					{/if}
				{:else}
					{#each restorePoints as restorePoint}
						<div class="restore-point{restorePoint.selected ? " selected" : ""}">
							<div class="left">
								<div class="created-at">{dateFmt.format(restorePoint.createdAt)}</div>
								<div class="is-automatic">{restorePoint.automatic ? "Automatic" : "Manual"} - {formatBytes(restorePoint.fileSize, 2)}</div>
							</div>
							<!-- <PrimaryButton label="Restore" kind="danger" icon="settings_backup_restore" /> -->
							<ExpandableActionsButton direction="down" bind:expanded={restorePoint.selected} actions={[
								{ label: "Restore", icon: "settings_backup_restore", dangerous: true, onTriggered: () => restoreFromRestorePoint(restorePoint.fileId)},
								{ label: "Delete", icon: "delete_forever", dangerous: true, onTriggered: () => deleteRestorePoint(restorePoint.fileId) },
							]} />
						</div>
					{/each}
				{/if}
			</div>
			<div class="row">
				<!-- <PrimaryButton label="Change Cloud Provider" grow={true} on:click={() => page = "connect-provider"} /> -->
				<PrimaryButton label="Create Restore Point" icon="backup" grow={true} on:click={createRestorePoint} />
				<ExpandableActionsButton direction="up" actions={[
					{ label: "Disconnect", icon: "logout", dangerous: true, onTriggered: disconnectProvider },
					{ label: "Delete All", icon: "delete_forever", dangerous: true, onTriggered: deleteAllRestorePoints },
				]} />
			</div>
			<div class="row">
				<div class="hint">Restore points are automatically created on daily basis when extension is used. No more than 3 automatic restore points will be created at any given time.</div>
			</div>
		</div>
	</div>
</Dialog>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: column;
		gap: 5px;

		font-size: 14px;

		background-color: #242424;
		border-radius: 8px;
		border: 1px solid #424242;
		width: 350px;
		// height: 400px;
		padding: 15px;

		.page {
			display: none;
			gap: 10px;

			&.active {
				display: flex;
				flex-direction: column;
			}
		}

		.top {
			display: flex;
			align-items: center;

			.title {
				font-size: 18px;
				font-weight: 500;
				flex-grow: 1;
			}
		}


		.row {
			display: flex;
			gap: 10px;
		}

		.hint {
			color: #a9a9a9;
			font-size: 12px;
			line-height: 1.1;
		}

		.restore-points {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 300px;
			overflow-y: auto;

			.message {
				width: 100%;
				height: 100%;
				padding: 10px;
				color: #a9a9a9;
				text-align: center;
			}

			&:has(.loading) {
				align-items: center;
				justify-content: center;
			}

			.restore-point {
				display: flex;
				align-items: center;
				border: 2px solid transparent;
				border-radius: 8px;
				padding: 10px;

				&.selected {
					border-color: #2866df;
				}

				.left {
					display: flex;
					flex-direction: column;
					flex-grow: 1;
					gap: 5px;

					.is-automatic {
						color: #a9a9a9;
						font-size: 12px;
					}
				}
			}
		}

		.providers {
			display: flex;
			gap: 5px;

			.provider {
				all: unset;

				display: flex;
				padding: 5px;
				border: 1px solid #3a3a3a;
				border-radius: 8px;
				cursor: pointer;

				&.selected {
					position: relative;
					border: 2px solid #2866df;
				}

				&:not(.selected) {
					margin: 1px;
				}

				.logo {
					display: flex;
					width: 38px;
					height: 38px;
				}
			}
		}
	}
</style>
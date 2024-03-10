<script lang="ts">
	import { onMount } from "svelte";
	import { currentPage, settings } from "../lib/stores";
	import BackupDialog from "./BackupDialog.svelte";
	import SquareButton from "./core/SquareButton.svelte";
	import Switch from "./core/Switch.svelte";

	let backupSetupDialogOpen = false;

	let localSettings = $settings;

	// Two-way data sync
	// Very hacky solution, but that's Svelte 4
	// TODO: Rework this when Svelte 5 is stable
	$: {
		settings.set(localSettings);
	}

	onMount(() => {
		settings.subscribe(v => localSettings = v);
	});
</script>

<!-- If something disables the backup option, we make sure that the dialog closes itself when that happens -->
<BackupDialog open={backupSetupDialogOpen && $settings.backupEnabled} on:close={() => backupSetupDialogOpen = false} />

<div class="root">
	{#if $settings}
		<div class="header">
			<div class="title">Settings</div>
			<SquareButton icon="close" on:click={() => currentPage.set("home")} />
		</div>
		
		<div class="setting">
			<button class="name" on:click={() => backupSetupDialogOpen = true} disabled={!localSettings.backupEnabled}>Backup</button>
			<div class="right">
				<div class="divider"></div>
				<Switch bind:checked={localSettings.backupEnabled} />
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.root {
		padding: 10px;
	}

	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 15px;

		.title {
			flex-grow: 1;
			font-size: 24px;
			font-weight: 500;
		}
	}

	.setting {
		display: flex;
		flex-direction: row;
		gap: 10px;


		.name {
			all: unset;

			cursor: pointer;

			font-size: 18px;
			font-weight: 500;
			flex-grow: 1;

			&:disabled {
				cursor: not-allowed;
			}
		}

		.right {
			display: flex;
			flex-direction: row;
			gap: 15px;

			.divider {
				width: 1px;
				height: 100%;
				background-color: #3a3a3a;
			}
		}
	}
</style>
<script lang="ts">
	import { onMount } from "svelte";

	import * as browser from "./lib/core/browser";
	
	import Home from "./components/Home.svelte";
	import PrimaryButton from "./components/core/PrimaryButton.svelte";
	import Settings from "./components/Settings.svelte";
	import { currentPage, gInfoDialog } from "./lib/stores";
	import Snackbars from "./components/core/Snackbars.svelte";
	import InfoDialog from "./components/core/InfoDialog.svelte";
	import { DEV } from "./globals";

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

	const extensionLogo = chrome.runtime.getURL("logo.png");

	/**
	 * Whether the current active tab is currently on roblox.com
	 */
	let isTabOnRobloxSite = true;

	onMount(async () => {
		if (!await isRobloxTab()) {
			// Not a Roblox tab, so we can't access the Roblox API
			// Let the user know that they need to activate this extension on the roblox site
			isTabOnRobloxSite = false;
			return;
		}
	});
</script>

<div class="window">
	{#if DEV}
		<div class="dev-flag">DEV</div>
	{/if}
	
	{#if isTabOnRobloxSite}
		<Home />

		{#if $currentPage === "settings"}
			<div class="virtual-page">
				<Settings />
			</div>
		{/if}
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

<InfoDialog
	title={$gInfoDialog.title ?? ""}
	description={$gInfoDialog.description ?? ""}
	actions={$gInfoDialog.actions ?? []}
	visible={$gInfoDialog.visible}
	on:dismiss={$gInfoDialog.dismiss} />

<Snackbars />

<style lang="scss">
	:global(*) {
		font-family: "Inter", sans-serif;
		box-sizing: border-box;
		line-height: 1;
		font-weight: 400;
	}

	:global(:root), .virtual-page {
		color-scheme: light dark;
		background-color: #171717;
		color: rgba(255, 255, 255, 0.87);

		--thumbnail-size: 125px;
	}

	:global(html), :global(body) {
		overflow: hidden;
		padding: 0;
		margin: 0;
	}

	:global(.material-symbols-rounded) {
		user-select: none;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
		height: 10px;
	}

	:global(::-webkit-scrollbar-thumb) {
		border-radius: 8px;
		background: #c2c9d2;
		z-index: 4;
	}

	:global(code) {
		font-family: "JetBrains Mono", monospace;
		font-optical-sizing: auto;
		font-weight: 400;
		font-style: normal;
		font-size: 12px;
	}

	.window {
		width: 568px;
		min-height: 568px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.virtual-page {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 4;
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

	.dev-flag {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 4px;
		margin: 8px;
		font-size: 12px;
		font-weight: bold;
		color: #171717;
		background-color: #fee227;
		border-radius: 4px;
		z-index: 99999;
	}
</style>
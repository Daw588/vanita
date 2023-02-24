<style src="./styles/app.scss"></style>

<script lang="ts">
	import { onMount } from "svelte";
	import Draggable from "./lib/draggable";
	import LocalFiles from "./lib/local-files";
	import Tab from "./lib/tab";

	import Outfits from "./tabs/outfits.svelte";
	import Streamer from "./tabs/streamer.svelte";
	import About from "./tabs/about.svelte";

	import { windowLocation } from "./data/window-location";

	import GoX from "svelte-icons/go/GoX.svelte";

	let draggable: Draggable;
	let currentTabName: string = "";
	let isOpen = false;

	let tabs: Tab[] = [
		new Tab("outfits"),
		new Tab("streamer"),
		new Tab("about")
	];

	$: if (isOpen !== null) {
		document.getElementById("app-toggle").style.display = (isOpen) ? "none" : "flex";
		document.getElementById("app").style.display = (isOpen) ? "flex" : "none";
	}

	// When draggable is initialized in onMount()
	$: if (draggable) {
		// Load previous window location
		draggable.targetX = $windowLocation.x;
		draggable.targetY = $windowLocation.y;
	}

	function selectTab(tab: Tab) {
		// Unselect others (we can't have multiple tabs selected at the same time)
		for (const tab of tabs) {
			tab.isSelected = false;
		}

		// Select this one
		tab.isSelected = true;
		currentTabName = tab.name;
		tabs = tabs; // Trigger refresh
	}

	onMount(async () => {
		const containerElement = document.getElementById("app");
		draggable = new Draggable(containerElement);

		const toggleBtn = document.getElementById("app-toggle");
		toggleBtn.onclick = () => {
			isOpen = true;
		};

		draggable.onDragCompleted(() => {
			// Save recent window location
			windowLocation.set({
				x: draggable.targetX,
				y: draggable.targetY
			});
		});

		// Select the first tab on load
		selectTab(tabs[0]);

		//console.log("Loaded");
	});
</script>

<div class="header">
	<img class="icon" draggable={false} src={LocalFiles.getAssetUrl("logo.png")} alt="Vanita Logo" />
	<div class="title">Vanita</div>
	<div class="drag" on:mousedown={e => draggable.drag(e)}></div>
	<button class="close" on:click={() => isOpen = false}><GoX /></button>
</div>

<div class="tabs">
	{#each tabs as tab}
		<div
			class="tab"
			data-isSelected={tab.isSelected}
			on:click={() => selectTab(tab)}
			on:keydown={() => {}}>{tab.name}</div>
	{/each}
</div>

{#if currentTabName === "outfits"}
	<Outfits />
{:else if currentTabName === "streamer"}
	<Streamer />
{:else if currentTabName === "about"}
	<About />
{/if}
<style src="./styles/app.scss"></style>

<script lang="ts">
	import { onMount } from "svelte";
	import Draggable from "./lib/draggable";
	import LocalFiles from "./lib/local-files";

	import About from "./tabs/about.svelte";
	import Outfits from "./tabs/outfits.svelte";
	import Streamer from "./tabs/streamer.svelte";

	import { windowLocation } from "./data/window-location";

	import GoX from "svelte-icons/go/GoX.svelte";

	let draggable: Draggable;
	let currentTabName: string = "outfits";
	let isOpen = false;

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

	onMount(async () => {
		const containerElement = document.getElementById("app");
		draggable = new Draggable(containerElement);

		const toggleBtn = document.getElementById("app-toggle");
		toggleBtn.onclick = () => {
			isOpen = true;
		}

		draggable.onDragCompleted(() => {
			// Save recent window location
			windowLocation.set({
				x: draggable.targetX,
				y: draggable.targetY
			});
		});

		console.log("Loaded");
	});
</script>

<div class="header">
	<img class="icon" draggable={false} src={LocalFiles.getAssetUrl("logo.png")} alt="Vanita Logo" />
	<div class="title">Vanita</div>
	<div class="drag" on:mousedown={e => draggable.drag(e)}></div>
	<button class="close" on:click={() => isOpen = false}><GoX /></button>
</div>

<div class="tabs">
	<div class="tab" on:click={() => currentTabName = "outfits"} on:keydown={() => {}}>Outfits</div>
	<div class="tab" on:click={() => currentTabName = "streamer"} on:keydown={() => {}}>Streamer</div>
	<div class="tab" on:click={() => currentTabName = "about"} on:keydown={() => {}}>About</div>
</div>

{#if currentTabName === "outfits"}
	<Outfits />
{:else if currentTabName === "streamer"}
	<Streamer />
{:else if currentTabName === "about"}
	<About />
{/if}
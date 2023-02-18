<style src="./styles/app.scss"></style>

<script lang="ts">
	import { onMount } from "svelte";
	import Draggable from "./lib/draggable";
	import About from "./tabs/about.svelte";
	import Outfits from "./tabs/outfits.svelte";
	import LocalStorage from "./lib/local-storage";
	import GoX from "svelte-icons/go/GoX.svelte";
	import LocalFiles from "./lib/local-files";

	let draggable: Draggable;
	let currentTabName: string = "outfits";
	let isOpen = false;

	$: if (isOpen !== null) {
		document.getElementById("app-toggle").style.display = (isOpen) ? "none" : "flex";
		document.getElementById("app").style.display = (isOpen) ? "flex" : "none";
	}

	onMount(async () => {
		const windowLocation = new LocalStorage<{x: number, y: number}>("window-location", {
			x: 0,
			y: 0
		});

		const containerElement = document.getElementById("app");
		draggable = new Draggable(containerElement);

		const toggleBtn = document.getElementById("app-toggle");
		toggleBtn.onclick = () => {
			isOpen = true;
		}

		// Load previous window location

		const saved = await windowLocation.load();
		//console.log(saved);
		draggable.targetX = saved.x;
		draggable.targetY = saved.y;

		draggable.onDragCompleted(() => {
			// Save recent window location
			windowLocation.save({
				x: draggable.targetX,
				y: draggable.targetY
			})
		});
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
	<div class="tab" on:click={() => currentTabName = "about"} on:keydown={() => {}}>About</div>
</div>

{#if currentTabName === "outfits"}
	<Outfits />
{:else if currentTabName === "about"}
	<About />
{/if}
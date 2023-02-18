<style src="./styles/app.scss"></style>

<script lang="ts">
	import { onMount } from "svelte";
	import Draggable from "./lib/draggable";
	import About from "./tabs/about.svelte";
	import Outfits from "./tabs/outfits.svelte";

	let draggable: Draggable;
	let currentTabName: string = "outfits";

	onMount(() => {
		const containerElement = document.getElementById("app");
		draggable = new Draggable(containerElement);
	});
</script>

<div class="header">
	<div class="title">RWP - Vanilla Roblox with extended functionality</div>
	<div class="drag" on:mousedown={e => draggable.drag(e)}></div>
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

<style src="../styles/outfits.scss"></style>

<script lang="ts">
	import User from "../lib/user";
	import { onMount } from "svelte";
	import Outfit from "../lib/outfit";
	import Thumbnail from "../lib/thumbnail";
	//import LZString from "../lib/third-party/lz-string";
	//import * as util from "../lib/util";
	import GoGear from "svelte-icons/go/GoGear.svelte";
	import LocalStorage from "../lib/local-storage";
	import type { OutfitCreateData } from "../lib/outfit";

	let outfits: Outfit[] = [];
	//let templateOutfitId = -1;
	let outfitNameInput = "";
	let thisUser: User;
	let outfitsLoaded = false;

	// TODO: You probably want to make a class for Outfit managment instead of storing menuOpen in Outfit class
	/*
	class Outfit {
		public constructor() {
			outfits.push(this);
			outfits = outfits; // Trigger update
		}

		public delete() {
			const index = outfits.indexOf(this);
			if (index !== -1) {
				outfits.splice(index, 1);
				outfits = outfits; // Trigger update
			}
		}
	}
	*/

	// TODO: Replace LocalStorage with persistent store
	const userOutfitsList = new LocalStorage<{
		data: OutfitCreateData, thumbnailUrl: string
	}[]>("outfit-list", []);

	onMount(async () => {
		// Get currently authenticated user
		thisUser = await User.getCurrentUser();
		//console.log("Logged in", thisUser);
		
		loadOutfits();
	});

	$: if (outfits) {
		//console.log("Saved changes!");

		// Save changes
		saveOutfits();
	}

	async function saveOutfits() {
		if (!outfitsLoaded) {
			/*
				Nothing has been loaded yet,
				we don't want to overwrite saved
				data with nothing because that will
				result in data loss!
			*/
			return;
		}

		const outfitList = outfits.map(outfit => {
			return {
				data: outfit.data,
				thumbnailUrl: outfit.thumbnailUrl
			};
		});

		await userOutfitsList.save(outfitList);

		/*
		const uncompressed = JSON.stringify(outfitList);
		const compressed = LZString.compress(uncompressed);
		const decompressed = LZString.decompress(compressed);

		const uncompressedBytes = util.stringToBytes(uncompressed);
		const compressedBytes = util.stringToBytes(compressed);
		const decompressedBytes = util.stringToBytes(decompressed);
		
		const compressionRatio = uncompressedBytes / compressedBytes;
		const savedSpace = (1 - (compressedBytes / uncompressedBytes)) * 100;

		console.log(`
			Save Operation Performed Successfuly.

			Uncompressed: ${util.formatBytes(uncompressedBytes)}
			Compressed: ${util.formatBytes(compressedBytes)}
			Decompressed: ${util.formatBytes(decompressedBytes)}

			Compression Ratio: ${compressionRatio.toFixed(2)}
			Saved: ${Math.round(savedSpace)}%
		`);

		localStorage.setItem("rwp-outfits", compressed);
		*/
	}

	async function loadOutfits() {
		let outfitList = await userOutfitsList.load();

		// Migrate data from old location
		const legacyOutfits = await chrome.storage.sync.get(["outfit-list"]);
		const legacyOutfitList = legacyOutfits["outfit-list"];
		if (legacyOutfitList) {
			await chrome.storage.sync.remove("outfit-list");
			outfitList = legacyOutfitList;
		}

		/*
		const decompressed = LZString.decompress(compressed);
		const outfitList = JSON.parse(decompressed);
		*/

		// Overwrite current data with loaded data
		outfits = outfitList.map(outfitInfo => {
			const outfit = new Outfit();
			outfit.thumbnailUrl = outfitInfo.thumbnailUrl;
			outfit.data = outfitInfo.data;

			return outfit;
		});

		outfitsLoaded = true;
	}

	async function createOutfit() {
		const outfit = await Outfit.getOutfitFromAvatar();
		outfit.data.name = (outfitNameInput.trim() === "") ? "New outfit" : outfitNameInput;
		outfitNameInput = "";

		// Generate thumbnail for the outfit
		outfit.thumbnailUrl = await Thumbnail.getAvatarBodyShot({
			format: "Png",
			isCircular: false,
			size: "100x100",
			userId: thisUser.id
		});

		//console.log("Created outfit", outfit);
		
		outfits.push(outfit);
		outfits = outfits; // Trigger update
	}

	async function wearOutfit(outfit: Outfit) {
		const outfitName = outfit.data.name;

		// Create temporary outfit
		outfit.data.name = "TEMPORARY";
		await outfit.create();

		// Make the player wear the outfit
		const temporaryOutfit = await Outfit.getOutfitByName(thisUser.id, "TEMPORARY");
		await temporaryOutfit.wear();

		// Delete the temporary outfit
		await temporaryOutfit.delete();

		// Restore the original name
		outfit.data.name = outfitName;

		// Reload the page to apply the changes
		window.location.reload();
	}

	function toggleMenu(outfit: Outfit) {
		outfit.menuOpen = !outfit.menuOpen;
		outfits = outfits; // Trigger update
	}

	function deleteOutfit(outfit: Outfit) {
		toggleMenu(outfit); // Hide the menu

		const index = outfits.indexOf(outfit);
		if (index !== -1) {
			outfits.splice(index, 1);
			outfits = outfits; // Trigger update
		}
	}

	async function updateOutfit(outfitTarget: Outfit) {
		toggleMenu(outfitTarget); // Hide the menu

		const outfit = await Outfit.getOutfitFromAvatar();

		// Generate thumbnail for the outfit
		outfit.thumbnailUrl = await Thumbnail.getAvatarBodyShot({
			format: "Png",
			isCircular: false,
			size: "100x100",
			userId: thisUser.id
		});

		const outfitName = outfitTarget.data.name;
		
		outfitTarget.thumbnailUrl = outfit.thumbnailUrl;
		outfitTarget.data = outfit.data;
		outfitTarget.data.name = outfitName;

		outfits = outfits; // Trigger update
	}
</script>

<div class="info">You must have at least one free spot in your outfits in order for this program to work!</div>

<div class="controls">
	<input class="textfield" type="text" placeholder="Name of your custome" bind:value={outfitNameInput} />
	<button class="button" on:click={createOutfit}>Create</button>
</div>

<div class="outfits">
	{#each outfits as outfit}
		{@const outfitName = (outfit.data) ? outfit.data.name : "Unknown"}

		<div class="outfit">
			<div class="preview">
				<img
					class="icon"
					on:click={() => wearOutfit(outfit)}
					on:keydown={() => {}}
					alt={`Bodyshot of ${outfitName}`}
					src={(outfit.thumbnailUrl) ? outfit.thumbnailUrl : "#"} />
				<div class="options" style={`display: ${(outfit.menuOpen) ? "flex" : "none"};`}>
					<div class="option" on:click={() => updateOutfit(outfit)} on:keydown={() => {}}>Update</div>
					<div class="option" on:click={() => deleteOutfit(outfit)} on:keydown={() => {}}>Delete</div>
					<div class="option" on:click={() => toggleMenu(outfit)} on:keydown={() => {}}>Cancel</div>
				</div>
			</div>
			<div class="caption">
				<div class="name" title={outfitName}>{outfitName}</div>
				<div class="actions">
					<div class="edit" on:click={() => toggleMenu(outfit)} on:keydown={() => {}}><GoGear /></div>
				</div>
			</div>
		</div>
	{/each}
</div>
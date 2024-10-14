import  { outfits as outfitsStore } from "../perstore";
import { fetchImageBase64 } from "../../lib/browser";
import { array } from "zod";
import { LegacyOutfit } from "../defs";
import { Storage } from "../../lib/storage";
import { AvatarType, safeEncode, type Outfit, type Wardrobe } from "./codec/v0";
import { BrickColor, type BrickColorID } from "@daw588/roblox-brick-color";
import { toDesiredImageCodec, type Option } from "../util";
import { Err, Ok, type Result } from "../../lib/result";
import { desBinary } from "./itself";

function brickColorIdToRGB(brickColorId: number) {
	return BrickColor.fromID(brickColorId as BrickColorID)?.toRGB() ?? { r: 0, g: 0, b: 0 };
}

async function tryMigrationV2(): Promise<[Outfit[], string[], () => void] | undefined> {
	const objData = await chrome.storage.local.get("outfit-list");
	const data: unknown[] = objData["outfit-list"] || [];

	if (data.length === 0) {
		return; // Nothing to migrate
	}

	// There is old data present, migrate it
	// Validate legacy data
	const legacyOutfits = array(LegacyOutfit).parse(data);
	console.debug("migration v2", legacyOutfits);

	const migratedOutfits: Outfit[] = [];

	const now = Date.now();

	// Transform legacy data to the new format
	for await (const legacyOutfit of legacyOutfits) {
		const thumbnailBase64 = await fetchImageBase64(legacyOutfit.thumbnailUrl);

		migratedOutfits.push({
			name: legacyOutfit.data.name,
			created: now,
			modified: 0, // 0 is basically "never"
			lastUsed: 0, // 0 is basically "never"
			useCount: 0,
			tags: [],

			assets: legacyOutfit.data.assetIds.map(assetId => {
				return {
					hasMetadata: false,
					id: assetId
				};
			}),

			avatarType: legacyOutfit.data.playerAvatarType === "R15" ? AvatarType.R15 : AvatarType.R6,

			depth: legacyOutfit.data.scale.depth,
			head: legacyOutfit.data.scale.head,
			width: legacyOutfit.data.scale.width,
			height: legacyOutfit.data.scale.height,
			proportion: legacyOutfit.data.scale.proportion,
			bodyType: legacyOutfit.data.scale.bodyType,

			headColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.headColorId),
			torsoColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.torsoColorId),
			leftArmColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.leftArmColorId),
			rightArmColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.leftArmColorId),
			leftLegColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.leftLegColorId),
			rightLegColor: brickColorIdToRGB(legacyOutfit.data.bodyColors.leftLegColorId),
			
			thumbnail: new ArrayBuffer(0),
		});
	}

	// Finally, delete the legacy data
	// await chrome.storage.local.remove("outfit-list");

	return [migratedOutfits, [], () => {
		console.debug("removed data");
	}];
}

async function tryMigrationV3(): Promise<[Outfit[], string[], () => void] | undefined> {
	const result = await outfitsStore.read();
	if (!result.success) {
		return; // Nothing to migrate
	}

	const legacyOutfits = result.data;
	console.debug("migration V3", legacyOutfits);

	const migratedOutfits: Outfit[] = [];
	const tags: string[] = [];

	for await (const legacyOutfit of legacyOutfits) {
		// const thumbnailBase64 = await browser.fetchImageBase64(legacyOutfit.thumbnailUrl);

		let thumbnailBase64: string | undefined;

		// There was a bug when you overwritten existing outfit
		// it would use Roblox CDN URL instead of base64 string
		if (legacyOutfit.thumbnailUrl.startsWith("data:image")) {
			// base64
			thumbnailBase64 = legacyOutfit.thumbnailUrl;
		} else {
			// URL
			const base64 = await fetchImageBase64(legacyOutfit.thumbnailUrl);
			if (base64) {
				thumbnailBase64 = base64;
			}
		}

		let thumbnail: ArrayBuffer;

		if (thumbnailBase64) {
			// TODO: Maybe run this in parallel? It's somewhat slow
			// though I don't blame it as it's re-encoding images as webp
			const blob = await toDesiredImageCodec(legacyOutfit.thumbnailUrl, "image/webp", 0.9);
			thumbnail = await blob.arrayBuffer();
		} else {
			thumbnail = new ArrayBuffer(0);
		}

		/**
		 * Array of tag ids.
		 */
		const outfitsTags: number[] = [];

		// console.debug(legacyOutfit.tags);

		for (const tagName of legacyOutfit.tags) {
			let tagId: number;

			const index = tags.indexOf(tagName);
			if (index === -1) {
				// Register the tag
				tagId = tags.push(tagName) - 1;
			} else {
				tagId = index;
			}

			outfitsTags.push(tagId);
		}

		migratedOutfits.push({
			name: legacyOutfit.name,
			created: legacyOutfit.created,
			modified: legacyOutfit.modified,
			lastUsed: legacyOutfit.lastUsed,
			useCount: legacyOutfit.useCount,
			tags: outfitsTags,

			assets: legacyOutfit.character.assets.map(asset => {
				if (asset.meta) {
					return {
						hasMetadata: true,
						id: asset.id,
						order: asset.meta.order,
						puffiness: asset.meta.puffiness ?? 1,
						position: { x: 0, y: 0, z: 0 },
						rotation: { x: 0, y: 0, z: 0 },
						scale: { x: 0, y: 0, z: 0 },
					};
				}

				return {
					hasMetadata: false,
					id: asset.id
				};
			}),

			depth: legacyOutfit.character.scales.depth,
			head: legacyOutfit.character.scales.head,
			width: legacyOutfit.character.scales.width,
			height: legacyOutfit.character.scales.height,
			proportion: legacyOutfit.character.scales.proportion,
			bodyType: legacyOutfit.character.scales.bodyType,
			avatarType: legacyOutfit.character.avatarType === "R15" ? AvatarType.R15 : AvatarType.R6,

			headColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.headColorId),
			torsoColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.torsoColorId),
			leftArmColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.leftArmColorId),
			rightArmColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.rightArmColorId),
			leftLegColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.leftLegColorId),
			rightLegColor: brickColorIdToRGB(legacyOutfit.character.bodyColors.rightLegColorId),
			
			thumbnail,
		});
	}

	return [migratedOutfits, tags, () => {
		console.debug("removed data");
	}];
}

async function tryFlush(existing: Wardrobe, data?: [Outfit[], string[], () => void]) {
	if (!data) {
		return; // Nothing to work with
	}

	const outfits = data[0];
	const tags = data[1];
	const wipeLegacyData = data[2];

	console.debug({ outfits, tags });

	console.debug("concating", existing.outfits, outfits);

	const allOutfits = existing.outfits.concat(outfits);

	console.debug("running migration", allOutfits);

	// Overwrite data in storage
	const success = await write(tags, allOutfits);
	if (success) {
		// Overwrite data that is already in-memory
		existing.outfits.push(...allOutfits);

		// I'ts now safe to wipe the legacy data
		wipeLegacyData();
	} else {
		console.warn("Failed to flush data");
	}
}

export async function readFromDiskRaw(): Promise<ArrayBuffer>  {
	const userData = await Storage.open("userdata");
	const data = await userData.read("wardrobe");
	
	if (data instanceof ArrayBuffer) {
		return data;
	}

	return new ArrayBuffer(0);
}

async function readFromDisk(): Promise<Option<Wardrobe>> {
	const t = performance.now();
	const userData = await Storage.open("userdata");
	const data = await userData.read("wardrobe");
	console.debug("read took", performance.now() - t, "ms");

	if (data instanceof ArrayBuffer) {
		const result = desBinary(data);
		if (result.success) {
			return result.value;
		}
		return null;
	}

	// No data
	return { version: 0, tags: [], outfits: [] };
}

export async function read(): Promise<Option<Wardrobe>> {
	const wardrobe = await readFromDisk();

	if (wardrobe) {
		console.debug("retrieved", wardrobe);

		// await tryFlush(wardrobe, await tryMigrationV2());
		// await tryFlush(wardrobe, await tryMigrationV3());
		
		return wardrobe;
	}

	console.warn("Failed to read from wardrobe");
	return null;
}

export async function write(tags: string[], outfits: Outfit[]): Promise<Result<{ size: number }, "oops">> {
	const userData = await Storage.open("userdata");
	const data = safeEncode(tags, outfits);
	if (data) {
		await userData.write("wardrobe", data.arrayBuffer);
		return Ok({ size: data.arrayBuffer.byteLength });
	}
	return Err("oops");
}

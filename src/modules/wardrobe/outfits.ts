import { fetchImageBase64 } from "../../lib/browser";
import { hex2rgb, rgb2hex } from "../../lib/color";
import { clamp } from "../../lib/math";
import { Err, Ok, type Result } from "../../lib/result";
import type { RBXApi } from "../rbxapi";
import type { AvatarAccessoryAsset } from "../rbxapi";
import { toDesiredImageCodec } from "../util";
import { AvatarType, type Outfit } from "./codec/v0";

export type LoadedOutfit = Outfit & {
	thumbnailUrl: string
}

export type QueryTag = {
	label: string,
	checked: boolean
}

export type TagQueryMode = "and" | "or"

export const SORT_TYPE = [
	"Date Created",
	"Last Modified",
	"Last Used",
	"Alphabetical"
] as const;

export type SortType = typeof SORT_TYPE[number];

export const SORT_ORDER = [
	"Ascending",
	"Descending"
] as const;

export type SortOrder = typeof SORT_ORDER[number];

export function duplicateOutfit(outfits: Outfit[], target: Outfit) {
	const duplicate = structuredClone(target);

	duplicate.created = Date.now();
	duplicate.modified = 0;
	duplicate.lastUsed = 0;
	duplicate.useCount = 0;

	outfits.unshift(duplicate);
}

export function deleteOutfit(outfits: Outfit[], target: Outfit) {
	const index = outfits.findIndex(outfit => outfit === target); // Find object with same reference
	if (index !== -1) {
		outfits.splice(index, 1);
		// Snackbar.show(`Successfuly deleted "${target.name}"`, 2);
	}
}

// export function addTag(outfit: Outfit, tags: string[], tag: string) {
// 	const index = tags.indexOf(tag);
// 	if (index === -1) {
// 		// Tag not found in the registry, need to register one
// 		// we don't need to check if it is associated with the outfit
// 		// since if the tag is not in the registry, it is definitely not in the outfit
// 		const newIndex = tags.push(tag) - 1;
// 		outfit.tags.push(newIndex); // Associate the tag with the outfit
// 	} else {
// 		// Tag found, it is possible that the outfit already has it
// 		// so we need to check
// 		if (outfit.tags.indexOf(index) === -1) {
// 			// Tag isn't associated with the outfit, add it
// 			outfit.tags.push(index);
// 		}
// 	}
// }

export type AddTagError =
	{
		/**
		 * Reached the 255 limit of associated tags.
		 */
		kind: "LimitExceeded"
	}
	| {
		/**
		 * Tag is already associated with the outfit.
		 */
		kind: "AlreadyExists"
	}
	| {
		kind: "RegistryError",
		error: RegisterTagError
	}

export type RegisterTagError =
	{
		/**
		 * Tag name exceeds the character limit of 255.
		 */
		kind: "TooLong"
	}
	| {
		/**
		 * Tag is already registered.
		 */
		kind: "AlreadyExists"
	}
	| {
		/**
		 * Reached the 255 limit of registered tags.
		 */
		kind: "LimitExceeded"
	}

export type UnregisterTagError =
	{
		/**
		 * Tag that you tried to unregister doesn't exist.
		 */
		kind: "DoesntExist"
	}

/**
 * When successful, retuns tag id of the newly registered tag, otherwise returns an error.
 */
export function registerTag(tags: QueryTag[], name: string): Result<number, RegisterTagError> {
	// There can be only 255 characters in the tag name.
	if (name.length > 255) {
		return Err({ kind: "TooLong" });
	}

	const id = tags.length;

	// There can be only 255 registered tags, and no more.
	if (id >= 255) {
		return Err({ kind: "LimitExceeded" });
	}

	const newTag: QueryTag = { label: name, checked: false };
	tags[id] = newTag; // Add tag to the registry

	return Ok(id);
}

export function unregisterTag(outfits: LoadedOutfit[], tags: QueryTag[], tagId: number): Result<void, UnregisterTagError> {
	if (!tags[tagId]) {
		return Err({ kind: "DoesntExist" });
	}

	const now = Date.now();

	// De-associate the tag from all outfits
	for (const outfit of outfits) {
		const index = outfit.tags.indexOf(tagId);
		if (index !== -1) {
			// Found outfit that is associated with the tag
			// de-associate it
			outfit.tags.splice(index, 1);

			// Changing tags counts as modification
			outfit.modified = now;
		}
	}

	// Remove the tag from the registry
	// Note: tagId is the index of the tag in the registry
	tags.splice(tagId, 1);

	return Ok();
}

export function addTagToOutfit(outfit: Outfit, tags: QueryTag[], name: string): Result<void, AddTagError> {
	// Outfit can be only associated with 255 tags, and no more.
	if (outfit.tags.length >= 255) {
		return Err({ kind: "LimitExceeded" });
	}

	const tagId = tags.findIndex(v => v.label === name);
	if (tagId !== -1) {
		// Tag found, it is possible that the outfit already has it
		// so we need to check
		if (outfit.tags.indexOf(tagId) === -1) {
			// Tag isn't associated with the outfit, add it
			outfit.tags.push(tagId);
			return Ok();
		}
		return Err({ kind: "AlreadyExists" });
	}

	// Tag not found in the registry, need to register one
	// we don't need to check if it is associated with the outfit
	// since if the tag is not in the registry, it is definitely not in the outfit
	const result = registerTag(tags, name);
	if (result.success) {
		outfit.tags.push(result.value); // Associate the tag with the outfit
		return Ok();
	}

	return Err({ kind: "RegistryError", error: result.error });
}

// function vec3ToRbxFormat({ x, y, z }: { x: number, y: number, z: number }) {
// 	return { X: x, Y: y, Z: z };
// }

export function rbxToVec3(vec?: { X: number, Y: number, Z: number }) {
	if (vec) {
		return { x: vec.X, y: vec.Y, z: vec.Z };
	}
	return { x: 0, y: 0, z: 0 };
}

export function assetsToRbxFormat(assets: Outfit["assets"]): AvatarAccessoryAsset[] {
	return assets.map(asset => {
		if (asset.hasMetadata) {
			return {
				id: asset.id,
				// meta: {
					// order: asset.order,
					// position: vec3ToRbxFormat(asset.position),
					// rotation: vec3ToRbxFormat(asset.rotation),
					// scale: vec3ToRbxFormat(asset.scale)
				// }
			};
		}

		return {
			id: asset.id
		};
	});
}

type WearProblemInvalidAsset = {
	issue: "invalid_asset",
	invalidAssetIds: number[]
}

type WearProblemMetadata = {
	issue: "metdata"
}

type WearProblem = WearProblemMetadata | WearProblemInvalidAsset

export async function wearOutfit(rbxapi: RBXApi, outfit: LoadedOutfit, onProblem: (problem: WearProblem) => void) {
	// console.debug("applying outfit", outfit);

	// const assetsDetails = await rbxapi.getCatalogAssetDetails(outfit.character.assets.map(v => v.id));
	// console.debug(assetsDetails);
	// for (const assetDetails of assetsDetails) {
		
	// }

	await rbxapi.setPlayerAvatarType(outfit.avatarType === AvatarType.R15 ? "R15" : "R6");

	await rbxapi.setBodyColors({
		headColor3: rgb2hex(outfit.headColor),
		torsoColor3: rgb2hex(outfit.torsoColor),
		leftArmColor3: rgb2hex(outfit.leftArmColor),
		rightArmColor3: rgb2hex(outfit.rightArmColor),
		leftLegColor3: rgb2hex(outfit.leftLegColor),
		rightLegColor3: rgb2hex(outfit.rightLegColor)
	});

	await rbxapi.setScales({
		width: outfit.width,
		height: outfit.height,
		head: outfit.head,
		depth: outfit.depth,
		proportion: outfit.proportion,
		bodyType: outfit.bodyType
	});

	const serAssets = assetsToRbxFormat(outfit.assets);

	const setWearingAssets = await rbxapi.setWearingAssets(serAssets);

	if (!setWearingAssets.success) {
		console.warn("set-wearing-assets experienced a problem", setWearingAssets.errors);
		if (setWearingAssets.errors) {
			for (const error of setWearingAssets.errors) {
				if (error.code === 0) {
					const assets = structuredClone(serAssets);

					for (const validationError of JSON.parse(error.message).ValidationErrors) {
						if (validationError.Message === "MissingMeta") {
							const targetAssetId = Number.parseInt(validationError.FieldData);
							const asset = assets.find(asset => asset.id === targetAssetId);
							if (asset) {
								// Add the missing metadata
								asset.meta = {
									order: 0,
									// position: { X: 0, Y: 0, Z: 0 },

									// version: 0,
									// puffiness: 1
								};
							}
						}
					}

					onProblem({ issue: "metdata" });

					// outfitProblemDialogMessage = "Your outfit has one or more layered clothing assets that have missing metadata. Generic metadata has been attached to affected assets; clothing order will not match. Your avatar may not look as expected. It's recommended that you change order of your layered clothing assets, and overwrite the outfit.";
					// outfitProblemDialogVisible = true;

					// Attempt to set assets again
					await rbxapi.setWearingAssets(assets);
				}
			}
		}

		if (setWearingAssets.invalidAssetIds) {
			const {invalidAssetIds} = setWearingAssets;

			onProblem({ issue: "invalid_asset", invalidAssetIds });
			return;

			// const listOfAffectedAssets = invalidAssetIds
			// 	.map(assetId => `<a href="https://www.roblox.com/catalog/${assetId}" target="_blank">${assetId}</a>`).join(",");

			// outfitProblemDialogVisible = true;

			// // Remove invalid assets
			// const assets = outfit.character.assets.filter(asset => !invalidAssetIds.includes(asset.id));
			// await rbxapi.setWearingAssets(assets);
		}
	}
}

export async function overwriteOutfit(rbxapi: RBXApi, outfit: LoadedOutfit, userId: number) {
	const avatarData = await rbxapi.getCurrentAvatar();
	const thumbnailURL = await rbxapi.getAvatarThumbnail(userId);
	const thumbnailBase64 = await fetchImageBase64(thumbnailURL);
	const thumbnailBlob = await toDesiredImageCodec(thumbnailBase64!, "image/webp", 0.9);
	const thumbnail = await thumbnailBlob.arrayBuffer();

	outfit.head = avatarData.scales.head;
	outfit.width = avatarData.scales.width;
	outfit.height = avatarData.scales.height;
	outfit.depth = avatarData.scales.depth;
	outfit.proportion = avatarData.scales.proportion;
	outfit.bodyType = avatarData.scales.bodyType;
	outfit.avatarType = avatarData.playerAvatarType === "R15" ? AvatarType.R15 : AvatarType.R6;

	outfit.headColor = hex2rgb(avatarData.bodyColor3s.headColor3)!;
	outfit.torsoColor = hex2rgb(avatarData.bodyColor3s.torsoColor3)!;
	outfit.leftArmColor = hex2rgb(avatarData.bodyColor3s.leftArmColor3)!;
	outfit.rightArmColor = hex2rgb(avatarData.bodyColor3s.rightArmColor3)!;
	outfit.leftLegColor = hex2rgb(avatarData.bodyColor3s.leftLegColor3)!;
	outfit.rightLegColor = hex2rgb(avatarData.bodyColor3s.rightLegColor3)!;

	outfit.assets = avatarData.assets.map(asset => {
		if (asset.meta) {
			return {
				hasMetadata: true,
				id: asset.id,
				order: asset.meta.order ?? 0,
				puffiness: asset.meta.puffiness ?? 1,
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
	});

	outfit.thumbnail = thumbnail;
	outfit.thumbnailUrl = URL.createObjectURL(thumbnailBlob);
}

export async function saveAsRobloxOutfit(rbxapi: RBXApi, outfit: LoadedOutfit) {
	return await rbxapi.createOutfit({
		assets: assetsToRbxFormat(outfit.assets),
		bodyColor3s: {
			headColor3: rgb2hex(outfit.headColor),
			torsoColor3: rgb2hex(outfit.torsoColor),
			leftArmColor3: rgb2hex(outfit.leftArmColor),
			rightArmColor3: rgb2hex(outfit.rightArmColor),
			leftLegColor3: rgb2hex(outfit.leftLegColor),
			rightLegColor3: rgb2hex(outfit.rightLegColor)
		},
		name: outfit.name,
		outfitType: "Avatar",
		playerAvatarType: outfit.avatarType === AvatarType.R15 ? "R15" : "R6",
		
		// The Roblox API will error if these values are not clamped
		scale: {
			bodyType: clamp(outfit.bodyType, 0, 1),
			depth: outfit.depth,
			head: clamp(outfit.head, 0.95, 1),
			width: clamp(outfit.width, 0.7, 1),
			height: clamp(outfit.height, 0.9, 1.05),
			proportion: clamp(outfit.proportion, 0, 1)
		}
	});
}

export function sortOutfits(outfits: LoadedOutfit[], sortType: SortType, sortOrder: SortOrder) {
	if (sortType === "Alphabetical") {
		if (sortOrder === "Ascending") {
			return outfits.sort((a, b) => a.name.localeCompare(b.name));
		}
		return outfits.sort((a, b) => b.name.localeCompare(a.name));
	} else if (sortType === "Last Modified") {
		if (sortOrder === "Ascending") {
			return outfits.sort((a, b) => b.modified - a.modified);
		}
		return outfits.sort((a, b) => a.modified - b.modified);
	} else if (sortType === "Date Created") {
		if (sortOrder === "Ascending") {
			return outfits.sort((a, b) => b.created - a.created);
		}
		return outfits.sort((a, b) => a.created - b.created);
	} else /* if (sortType === "Last Used") */ {
		if (sortOrder === "Ascending") {
			return outfits.sort((a, b) => b.lastUsed - a.lastUsed);
		}
		return outfits.sort((a, b) => a.lastUsed - b.lastUsed);
	}
}

export function queryOutfits(
	outfits: LoadedOutfit[],
	str: string,
	tags: QueryTag[],
	tagMode: TagQueryMode,
	hideUnused: boolean
) {
	const normalizedQuery = str.trim().toLocaleLowerCase();
	const selectedQueryTags = tags.filter(v => v.checked);

	// Transform
	if (hideUnused) {
		outfits = outfits.filter(outfit => outfit.useCount !== 0);
	}

	// Transform
	if (normalizedQuery !== "") {
		outfits = outfits.filter(outfit => {
			const normalizedName = outfit.name.toLocaleLowerCase();

			if (normalizedName.includes(normalizedQuery)) {
				return true;
			}

			return false;
		});
	}

	// Transform
	if (selectedQueryTags.length !== 0) {
		outfits = outfits.filter(outfit => {
			if (tagMode === "and") {
				// Must have all the selected (checked) tags

				if (outfit.tags.length === 0) {
					return false;
				}

				for (let tagId = 0; tagId < tags.length; tagId++) {
					if (!tags[tagId]!.checked) continue;

					if (!outfit.tags.includes(tagId)) {
						return false;
					}
				}

				return true;
			}

			// Has to have at least one tag that is selected (checked)
			return outfit.tags.some(outfitTagId =>
				tags.some(
					(queryTag, queryTagId) => queryTagId === outfitTagId && queryTag.checked
				)
			);
		});
	}

	return outfits;
}

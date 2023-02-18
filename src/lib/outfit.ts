import * as RbxApi from "../lib/rbx-api";

type PlayerAvatarType = "R15" | "R6";
type OutfitType = "Avatar";

interface AssetInfo {
	id: number,
	name: string,
	assetType: {
		id: number,
		name: string
	},
	currentVersionId: number
}

interface BodyColors {
	headColorId: number,
	torsoColorId: number,
	rightArmColorId: number,
	leftArmColorId: number,
	rightLegColorId: number,
	leftLegColorId: number
}

interface BodyScale {
	height: number,
	width: number,
	head: number,
	depth: number,
	proportion: number,
	bodyType: number
}

export interface OutfitCreateData {
	name: string,
	bodyColors: BodyColors,
	assetIds: number[],
	scale: BodyScale,
	playerAvatarType: PlayerAvatarType,
	outfitType: OutfitType
}

/**
 * https://avatar.roblox.com/v1/users/{userId}/outfits
 */
interface OutfitsGetList {
	filteredCount: number,
	data: {
		id: number,
		name: string,
		isEditable: boolean
	}[],
	total: number
}

interface OutfitGetDetails {
	id: number,
	name: string,
	assets: AssetInfo[],
	bodyColors: BodyColors,
	scale: BodyScale,
	playerAvatarType: PlayerAvatarType,
	outfitType: OutfitType,
	isEditable: boolean
}

interface AvatarInfo {
	scales: BodyScale,
	playerAvatarType: PlayerAvatarType,
	bodyColors: BodyColors,
	assets: AssetInfo[],
	defaultShirtApplied: boolean,
	defaultPantsApplied: boolean,
	emotes: {
		assetId: number,
		assetName: string,
		position: number
	}[]
}

export default class Outfit {
	id: number; // User outfit id
	thumbnailUrl?: string;
	data?: OutfitCreateData;
	menuOpen: boolean = false;

	public constructor() {}

	public async wear() {
		if (!this.id) {
			console.error("Cannot wear an outfit without an outfit id!");
		}

		await RbxApi.post(`https://avatar.roblox.com/v1/outfits/${this.id}/wear`);
	}

	public async update() {
		if (!this.id) {
			console.error("Cannot update outfit without an outfit id!");
		}

		if (!this.data) {
			console.error("Cannot update outfit without data!");
		}
		
		await RbxApi.post(`https://avatar.roblox.com/v1/outfits/${this.id}/update`, this.data);
	}

	public async create() {
		if (!this.data) {
			console.error("Cannot create an outfit without data!");
		}

		await RbxApi.post("https://avatar.roblox.com/v1/outfits/create", this.data);
	}

	public async delete() {
		if (!this.id) {
			console.error("Cannot delete outfit without an outfit id!");
		}

		await RbxApi.post(`https://avatar.roblox.com/v1/outfits/${this.id}/delete`);
		this.data = null;
	}

	public static async getOutfitsList(userId: number) {
		const res = await RbxApi.get(`https://avatar.roblox.com/v1/users/${userId}/outfits?page=${1}&itemsPerPage=${100}&isEditable=${true}`);
		const body = await res.json() as unknown as OutfitsGetList;

		console.log(body);

		return body.data;
	}

	public static async getOutfitByName(userId: number, name: string) {
		const outfitsList = await Outfit.getOutfitsList(userId);
		console.log(outfitsList);
		const outfitInfo = outfitsList.find(outfitInfo => outfitInfo.name === name);

		const outfit = new Outfit();
		outfit.id = outfitInfo.id;

		return outfit;
	}

	public static async getOutfit(outfitId: number) {
		const res = await RbxApi.get(`https://avatar.roblox.com/v1/outfits/${outfitId}/details`);
		const body = res.json() as unknown as OutfitGetDetails;

		const outfit = new Outfit();
		outfit.id = body.id;
		outfit.data = {
			assetIds: body.assets.map(asset => asset.id),
			bodyColors: body.bodyColors,
			name: body.name,
			outfitType: body.outfitType,
			playerAvatarType: body.playerAvatarType,
			scale: body.scale
		}

		return outfit;
	}

	public static async getOutfitFromAvatar() {
		const res = await RbxApi.get("https://avatar.roblox.com/v1/avatar");
		const body = await res.json() as unknown as AvatarInfo;

		const outfit = new Outfit();
		outfit.data = {
			name: "TEMPLATE",
			bodyColors: body.bodyColors,
			assetIds: body.assets.map(asset => asset.id), // Convert asset object array to asset id array
			scale: body.scales,
			playerAvatarType: body.playerAvatarType, // R15, R6
			outfitType: "Avatar"
		}

		return outfit;
	}
}
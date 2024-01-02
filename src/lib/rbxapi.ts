
import * as browser from "./browser";

export type BodyColors = {
	headColorId: number,
	torsoColorId: number,
	rightArmColorId: number,
	leftArmColorId: number,
	rightLegColorId: number,
	leftLegColorId: number
}

export type Scale = {
	height: number,
	width: number,
	head: number,
	depth: number,
	proportion: number,
	bodyType: number
}

export type PlayarAvatarType = "R6" | "R15"

export type AvatarAccessoryAsset = {
	id: number,
	meta?: {
		order: number,
		puffiness?: number,
		version: number
	}
}

type GetCurrentAvatarResponseBody = {
	scales: Scale,
	playerAvatarType: PlayarAvatarType,
	bodyColors: BodyColors,
	assets: {
		id: number,
		name: string,
		assetType: {
			id: number,
			name: string
		},
		currentVersionId: number,
		meta?: {
			order: number,
			version: number,
			puffiness?: number
		}
	}[],
	defaultShirtApplied: boolean,
	defaultPantsApplied: boolean,
	emotes: {
		assetId: number,
		assetName: string,
		position: number
	}[]
}

type Asset = {
	id: number,
	meta?: {
		order: number,
		puffiness?: number,
		version: number
	}
}

type CreateOutfitRequestBody = {
	name: string,
	bodyColors: BodyColors,
	assets: Asset[],
	scale: Scale,
	playerAvatarType: PlayarAvatarType,
	outfitType: number
}

type SetWearingAssetsRequestBody = {
	assets: AvatarAccessoryAsset[]
}

type SetWearingAssetsResponseBody = {
	invalidAssets?: {
		id: number,
		name: string,
		assetType: {
			id: number,
			name: string
		}
	}[],
	invalidAssetIds?: number[],
	errors?: {
		code: number,
		message: string,
	}[],
	success: boolean
}

type SetScalesRequestBody = Scale

type SetPlayerAvatarTypeRequestBody = {
	playerAvatarType: PlayarAvatarType
}

type SetBodyColorsRequestBody = BodyColors;

// async function createOutfit(body: CreateOutfitRequestBody) {
// 	const response = await fetch("https://avatar.roblox.com/v2/outfits/create", {
// 		body: JSON.stringify(body)
// 	});
// 	// console.log("create-outfit", response);
// }

// https://avatar.roblox.com/v2/outfits/create
type V2OutfitsCreateRequestBody = {
	name: string,
	bodyColors: BodyColors,
	assets: Asset[],
	scale: Scale,
	playerAvatarType: PlayarAvatarType,
	outfitType: "Avatar"
}

export default class RBXApi {
	private csrfToken: string;

	private constructor(csrfToken: string) {
		this.csrfToken = csrfToken;
	}

	public static async fromCurrentSession() {
		const csrfToken = await RBXApi.getCsrfToken();
		return new RBXApi(csrfToken);
	}

	private static async getCsrfToken() {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v1/avatar/set-player-avatar-type",
			method: "POST",
			credentials: "include",
			responseEncoding: "binary"
		});
		
		const token = response.headers["x-csrf-token"];
		if (token) {
			return token;
		} else {
			throw Error("Failed");
		}
	}

	public async setBodyColors(body: SetBodyColorsRequestBody) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v1/avatar/set-body-colors",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify(body),
			credentials: "include",
			responseEncoding: "binary"
		});
		
		return response;
	}

	public async setPlayerAvatarType(avatarType: PlayarAvatarType) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const body: SetPlayerAvatarTypeRequestBody = {
			playerAvatarType: avatarType
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v1/avatar/set-player-avatar-type",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify(body),
			credentials: "include",
			responseEncoding: "binary"
		});

		return response;
	}

	public async setScales(body: SetScalesRequestBody) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v1/avatar/set-scales",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify(body),
			credentials: "include",
			responseEncoding: "binary"
		});
		
		return response;
	}

	public async setWearingAssets(assets: AvatarAccessoryAsset[]) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const body: SetWearingAssetsRequestBody = {
			assets: assets
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v2/avatar/set-wearing-assets",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify(body),
			credentials: "include",
			responseEncoding: "json"
		});
		
		return response.body as SetWearingAssetsResponseBody;
	}

	public async getCurrentAvatar() {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v1/avatar",
			method: "GET",
			headers: { "x-csrf-token": this.csrfToken },
			credentials: "include",
			responseEncoding: "json"
		});

		return response.body as GetCurrentAvatarResponseBody
	}

	public async getAuthenticatedUser() {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://users.roblox.com/v1/users/authenticated",
			method: "GET",
			headers: { "x-csrf-token": this.csrfToken },
			credentials: "include",
			responseEncoding: "json"
		});

		return response.body as {
			id: number,
			name: string,
			displayName: string
		};
	}

	public async getAvatarThumbnail(userId: number) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=250x250&format=Png&isCircular=false`,
			method: "GET",
			headers: { "x-csrf-token": this.csrfToken },
			credentials: "include",
			responseEncoding: "json"
		});
		
		const data = response.body as {
			data: {
				targetId: number,
				state: "Completed" | "Blocked",
				imageUrl: string,
				version: string
			}[]
		};

		return data.data[0].imageUrl;
	}

	public async createOutfit(body: V2OutfitsCreateRequestBody) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw Error("Cannot make a request without an active tab being present");
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://avatar.roblox.com/v2/outfits/create",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify(body),
			credentials: "include",
			responseEncoding: "json"
		});
	
		return response;
	}
}
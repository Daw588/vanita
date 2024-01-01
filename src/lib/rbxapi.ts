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
	private securityToken: string;
	private csrfToken: string;

	private constructor(securityToken: string, csrfToken: string) {
		this.securityToken = securityToken;
		this.csrfToken = csrfToken;
	}

	public static async fromCurrentSession() {
		const securityToken = await RBXApi.getSecurityToken();
		const csrfToken = await RBXApi.getCsrfToken(securityToken);
		return new RBXApi(securityToken, csrfToken);
	}

	private static async getSecurityToken() {
		const cookies = await chrome.cookies.getAll({ domain: ".roblox.com" });
		const cookie = cookies.find(cookie => cookie.name === ".ROBLOSECURITY");
		if (cookie) {
			return cookie.value;
		} else {
			throw Error("Failed");
		}
	}

	private static async getCsrfToken(securityToken: string) {
		const response = await fetch("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", {
			method: "POST",
			headers: {
				"Cookie": ".ROBLOSECURITY=" + securityToken
			},
			credentials: "include"
		});
		const token = response.headers.get("x-csrf-token");
		if (token) {
			return token;
		} else {
			throw Error("Failed");
		}
	}

	private async request(method: "GET" | "POST", url: string, body?: any) {
		const response = await fetch(url, {
			method: method,
			headers: {
				"Cookie": ".ROBLOSECURITY=" + this.securityToken,
				"x-csrf-token": this.csrfToken
			},
			body: JSON.stringify(body),
			credentials: "include"
		});
		return response;
	}

	public async setBodyColors(body: SetBodyColorsRequestBody) {
		const response = await this.request("POST", "https://avatar.roblox.com/v1/avatar/set-body-colors", body);
		// console.log("set-body-colors", response);
	}

	public async setPlayerAvatarType(avatarType: PlayarAvatarType) {
		const response = await this.request("POST", "https://avatar.roblox.com/v1/avatar/set-player-avatar-type", {
			playerAvatarType: avatarType
		} as SetPlayerAvatarTypeRequestBody);
		// console.log("set-player-avatar-type", response, await response.json());
	}

	public async setScales(body: SetScalesRequestBody) {
		const response = await this.request("POST", "https://avatar.roblox.com/v1/avatar/set-scales", body);
		// console.log("set-scales", response);
	}

	public async setWearingAssets(assets: AvatarAccessoryAsset[]) {
		const response = await this.request("POST", "https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
			assets: assets
		} as SetWearingAssetsRequestBody);
		// console.log("set-wearing-assets", response);
		return (await response.json()) as SetWearingAssetsResponseBody;
	}

	public async getCurrentAvatar() {
		const response = await this.request("GET", "https://avatar.roblox.com/v1/avatar");
		// console.log("get-current-avatar", response);
		return (await response.json()) as GetCurrentAvatarResponseBody
	}

	public async getAuthenticatedUser() {
		const response = await this.request("GET", "https://users.roblox.com/v1/users/authenticated");
		// console.log("get-authenticated-user", response);
		const data = await response.json();
		return data as {
			id: number,
			name: string,
			displayName: string
		};
	}

	public async getAvatarThumbnail(userId: number) {
		const response = await this.request(
			"GET",
			`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=250x250&format=Png&isCircular=false`
		);
		// console.log("get-avatar-thumbnail", response);
		
		const data = (await response.json()) as {
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
		await this.request(
			"POST",
			"https://avatar.roblox.com/v2/outfits/create",
			body
		);
	}
}
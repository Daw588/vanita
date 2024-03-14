
import * as browser from "./core/browser";

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

const ASSET_IMAGE_SIZING = [
	"30x30", "42x42", "50x50",
	"60x60", "75x75", "110x110",
	"140x140", "150x150", "160x100",
	"160x600", "250x250", "256x144",
	"300x250", "304x166", "384x216",
	"396x216", "420x420", "480x270",
	"512x512", "576x324", "700x700",
	"728x90", "768x432", "1200x80"
] as const;

type AssetImageSizing = typeof ASSET_IMAGE_SIZING[number];

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
			throw "Cannot make a request without an active tab being present";
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
			throw "Failed";
		}
	}

	public async setBodyColors(body: SetBodyColorsRequestBody) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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
			throw "Cannot make a request without an active tab being present";
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

	public async getCatalogAssetDetails(assetIds: number[]) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw "Cannot make a request without an active tab being present";
		}

		const response = await browser.fetchOnTab(currentTabId, {
			url: "https://catalog.roblox.com/v1/catalog/items/details",
			method: "POST",
			headers: { "x-csrf-token": this.csrfToken },
			body: JSON.stringify({
				items: assetIds.map(assetId => ({ itemType: "Asset", id: assetId }))
			}),
			credentials: "include",
			responseEncoding: "json"
		});

		const { data } = response.body as {
			data: {
				// Basic info
				id: number,
				name: string,
				description: string,
				itemType: "Asset",

				isOffSale: boolean,
				price?: number,

				purchaseCount: number,
				favoriteCount: number,
				offSaleDeadline: null,
				saleLocationType: "NotApplicable",

				assetType: number,
				productId: number,
				itemStatus: unknown[],
				itemRestrictions: ("LimitedUnique")[],

				// Creator related
				creatorHasVerifiedBadge: boolean,
				creatorType: "User" | "Group",
				creatorTargetId: number,
				creatorName: string,

				// Limited item related
				lowestPrice?: number,
				lowestResalePrice?: number,
				totalQuantity?: number,
				hasResellers?: boolean,
				unitsAvailableForConsumption?: number,
			}[]
		};
	
		return data;
	}

	public async getBundleFromAsset(assetId: number) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw "Cannot make a request without an active tab being present";
		}

		const params = new URLSearchParams({
			limit: "10",
			sortOrder: "Asc"
		});

		const response = await browser.fetchOnTab(currentTabId, {
			url: `https://catalog.roblox.com/v1/assets/${assetId}/bundles?${params.toString()}`,
			method: "GET",
			headers: { "x-csrf-token": this.csrfToken },
			credentials: "include",
			responseEncoding: "json"
		});

		const { data } = response.body as {
			previousPageCursor: string | null,
			nextPageCursor: string | null,
			data: {
				id: number,
				name: string,
				description: string,
				bundleType: "AvatarAnimations",
				items: {
					owned: boolean,
					id: number,
					name: string,
					type: "Asset"
				}[],
				creator: {
					id: number,
					name: string,
					type: "User" | "Group",
					hasVerifiedBadge: boolean
				},
				product: {
					id: number,
					type: "productType",
					isPublicDomain: boolean,
					isForSale: boolean,
					priceInRobux: number,
					isFree: boolean,
					noPriceText: null
				},
				itemRestrictions: ("LimitedUnique")[],
				collectibleItemDetail: null
			}[]
		};

		return data;
	}

	public async getAssetThumbnail({ assetIds, returnPolicy, size, format, isCircular }: {
		assetIds: number[],
		returnPolicy: "PlaceHolder" | "AutoGenerated" | "ForceAutoGenerated",
		size: AssetImageSizing,
		format: "Png" | "Jpeg",
		isCircular: boolean,
	}) {
		const currentTabId = await browser.getCurrentTabId();
		if (!currentTabId) {
			throw "Cannot make a request without an active tab being present";
		}

		const params = new URLSearchParams({
			assetIds: assetIds.join(","),
			returnPolicy,
			size,
			format,
			isCircular: isCircular.toString()
		});

		const response = await browser.fetchOnTab(currentTabId, {
			url: `https://thumbnails.roblox.com/v1/assets?${params.toString()}`,
			method: "GET",
			headers: { "x-csrf-token": this.csrfToken },
			credentials: "include",
			responseEncoding: "json"
		});

		const { data } = response.body as {
			data: {
				targetId: number,
				state: "Completed",
				imageUrl: string,
				version: string
			}[]
		};

		return data;
	}
}
import * as RbxApi from "../lib/rbx-api";

interface AvatarBodyShotConfig {
	userId: number,
	size: "100x100",
	format: "Png" | "Jpeg",
	isCircular: boolean
}

interface AvatarBodyShotResponse {
	data: {
		targetId: number,
		state: "Completed",
		imageUrl: string
	}[]
}

export default class Thumbnail {
	public constructor() {}

	public static async getAvatarBodyShot(config: AvatarBodyShotConfig) {
		const searchParams = new URLSearchParams({
			userIds: config.userId.toString(),
			size: config.size,
			format: config.format,
			isCircular: (config.isCircular) ? "true" : "false"
		});

		const res = await RbxApi.get("https://thumbnails.roblox.com/v1/users/avatar?" + searchParams.toString());
		const body = await res.json() as unknown as AvatarBodyShotResponse;

		return body.data[0].imageUrl;
	}
}
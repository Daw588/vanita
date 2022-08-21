/**
 * Method: POST
 * URL: https://avatar.roblox.com/v1/avatar/thumbnail-customization
 */
export type ThumbnailCustomization = {
	/**
	 * Ranges are inclusive.
	 */
	camera: {
		/**
		 * 0.5 to 4
		 */
		distanceScale: number,

		/**
		 * 15 to 45.
		 */
		fieldOfViewDeg: number,

		/**
		 * -20 to 20
		 */
		xRotDeg: number,

		/**
		 * -60 to 60.
		 */
		yRotDeg: number
	},

	/**
	 * Emote asset id.
	 */
	emoteAssetId: number,

	/**
	 * 1 = Closeup (headshot)
	 * 2 = FullBody (bodyshot)
	 * Closeup and FullBody can have different configurations.
	 */
	thumbnailType: 1 | 2
}
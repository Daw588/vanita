import {
	number as znumber,
	object as zobject,
	enum as zenum,
	string as zstring,
	array as zarray,
	boolean as zboolean,
	type infer as zinfer
} from "zod";

export const RigType = zenum(["R6", "R15"]);

export const BodyColors = zobject({
	headColorId: znumber().int(),
	torsoColorId: znumber().int(),
	rightArmColorId: znumber().int(),
	leftArmColorId: znumber().int(),
	rightLegColorId: znumber().int(),
	leftLegColorId: znumber().int()
}).strict();

export const Scales = zobject({
	height: znumber(),
	width: znumber(),
	head: znumber(),
	depth: znumber(),
	proportion: znumber(),

	// This refers to the slider (0 - 100) on the avatar editor page, just below the avatar preview
	bodyType: znumber()
}).strict();

export const AvatarAsset = zobject({
	id: znumber().int(),
	meta: zobject({
		order: znumber().int(),
		puffiness: znumber().optional(),
		version: znumber().int()
	}).strict().optional()
}).strict();

export const Character = zobject({
	bodyColors: BodyColors,
	scales: Scales,
	assets: AvatarAsset.array(),
	avatarType: RigType
}).strict();

export const Outfit = zobject({
	name: zstring().max(25),

	/**
	 * Timestamp of when outfit was created.
	 */
	created: znumber().int(),

	/**
	 * Timestamp of when outfit was last modified. When set to 0, it is treated as if it never happened.
	 */
	modified: znumber().int(),

	/**
	 * Timestamp of when outfit was last used. When set to 0, it is treated as if it never happened.
	 */
	lastUsed: znumber().int(),
	
	useCount: znumber().int(),
	character: Character,
	tags: zarray(zstring().max(25)),
	thumbnailUrl: zstring()
}).strict();

export const Outfits = Outfit.array();

export type Outfit = zinfer<typeof Outfit>;
export type Character = zinfer<typeof Character>;

export const LegacyOutfit = zobject({
	data: zobject({
		name: zstring(),
		outfitType: zenum(["Avatar"]),
		playerAvatarType: zenum(["R6", "R15"]),
		assetIds: zarray(znumber().int()),
		scale: zobject({
			height: znumber(),
			width: znumber(),
			head: znumber(),
			depth: znumber(),
			proportion: znumber(),
			bodyType: znumber().int()
		}),
		bodyColors: zobject({
			headColorId: znumber().int(),
			torsoColorId: znumber().int(),
			rightArmColorId: znumber().int(),
			leftArmColorId: znumber().int(),
			rightLegColorId: znumber().int(),
			leftLegColorId: znumber().int()
		}),
	}),
	thumbnailUrl: zstring()
}).strict();

export type LegacyOutfit = zinfer<typeof LegacyOutfit>;

export const Settings = zobject({
	backupEnabled: zboolean()
}).strict();

export type Settings = zinfer<typeof Settings>;

export const Backup = zobject({
	timeSinceLastBackup: znumber().int()
}).strict();

export const OAuth2 = zobject({
	google: zobject({
		/**
		 * The token used to refresh the access token.
		 */
		refreshToken: zstring(),
		accessToken: zstring(),

		/**
		 * Timestamp in milliseconds that determines expiration of the access token
		 */
		accessExpiry: znumber().int(),
	}).strict().optional()
}).strict();

export type OAuth2 = zinfer<typeof OAuth2>;

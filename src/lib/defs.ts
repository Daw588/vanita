import zod from "zod";

export const RigType = zod.enum(["R6", "R15"]);

export const BodyColors = zod.object({
	headColorId: zod.number().int(),
	torsoColorId: zod.number().int(),
	rightArmColorId: zod.number().int(),
	leftArmColorId: zod.number().int(),
	rightLegColorId: zod.number().int(),
	leftLegColorId: zod.number().int()
}).strict();

export const Scales = zod.object({
	height: zod.number(),
	width: zod.number(),
	head: zod.number(),
	depth: zod.number(),
	proportion: zod.number(),

	// This refers to the slider (0 - 100) on the avatar editor page, just below the avatar preview
	bodyType: zod.number()
}).strict();

export const AvatarAsset = zod.object({
	id: zod.number().int(),
	meta: zod.object({
		order: zod.number().int(),
		puffiness: zod.number().optional(),
		version: zod.number().int()
	}).strict().optional()
}).strict();

export const Character = zod.object({
	bodyColors: BodyColors,
	scales: Scales,
	assets: AvatarAsset.array(),
	avatarType: RigType
}).strict();

export const Outfit = zod.object({
	name: zod.string().max(25),
	created: zod.number().int(),
	modified: zod.number().int(),
	lastUsed: zod.number().int(),
	useCount: zod.number().int(),
	character: Character,
	tags: zod.array(zod.string().max(25)),
	thumbnailUrl: zod.string()
}).strict();

export const Outfits = Outfit.array();

export type Outfit = zod.infer<typeof Outfit>;
export type Character = zod.infer<typeof Character>;

export const LegacyOutfit = zod.object({
	data: zod.object({
		name: zod.string(),
		outfitType: zod.enum(["Avatar"]),
		playerAvatarType: zod.enum(["R6", "R15"]),
		assetIds: zod.array(zod.number().int()),
		scale: zod.object({
			height: zod.number(),
			width: zod.number(),
			head: zod.number(),
			depth: zod.number(),
			proportion: zod.number(),
			bodyType: zod.number().int()
		}),
		bodyColors: zod.object({
			headColorId: zod.number().int(),
			torsoColorId: zod.number().int(),
			rightArmColorId: zod.number().int(),
			leftArmColorId: zod.number().int(),
			rightLegColorId: zod.number().int(),
			leftLegColorId: zod.number().int()
		}),
	}),
	thumbnailUrl: zod.string()
}).strict();

export type LegacyOutfit = zod.infer<typeof LegacyOutfit>;
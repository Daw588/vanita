import { Buffer } from "../../../lib/buffer";
import type { Option } from "../../util";

import {
	type infer as zinfer,
	number as znumber,
	string as zstring,
	strictObject as zstrictObject,
	literal as zliteral,
	union as zunion,
	array as zarray,
	instanceof as zinstanceof,
	nativeEnum as znativeEnum
} from "zod";

// Binary Format Specification

// [u16] binary format version

// [u8] number of tags
// [u8 str] tagName

// [u64] created
// [u64] modified
// [u64] lastUsed
// [u16] useCount

// [u8 u8 u8] headColor (R, G, B)
// [u8 u8 u8] torsoColor (R, G, B)
// [u8 u8 u8] leftArmColor (R, G, B)
// [u8 u8 u8] rightArmColor (R, G, B)
// [u8 u8 u8] leftLegColor (R, G, B)
// [u8 u8 u8] rightLegColor (R, G, B)

// [f16] height
// [f16] width
// [f16] head
// [f16] depth
// [f16] proportion
// [f16] bodyType
// [u8] avatarType

// outfit name
// [u8] number of utf-8 bytes
// [u8...] utf-8 chars

// [u8] number of tags
// [u8...] tagIds

// [u8] number of assets that have metadata
// [u8] number of assets that don't have metadata

// assets with metadata have the following
// [u8] assetId
// [u8] order
// [f16] puffiness
// [f32 f32 f32] position (X, Y, Z)
// [f32 f32 f32] rotation (X, Y, Z)
// [f32 f32 f32] scale (X, Y, Z)

// assets without metadata have the following
// [u8] assetId

// [u32] number of bytes used to store the thumbnail
// [bin] thumbnail

const utf8Encoder = new TextEncoder();

export enum AvatarType {
	R6 = 0,
	R15 = 1
}

// const i8Schema = z.number().int().min(-128).max(127);
const u8Schema = znumber().int().min(0).max(255);
const u16Schema = znumber().int().min(0).max(65535);
const f16Schema = znumber().min(-65504).max(65504);
const f32Schema = znumber().min(-3.40282347E+38).max(3.40282347E+38);

const v3f32B96Schema = zstrictObject({
	x: f32Schema,
	y: f32Schema,
	z: f32Schema
});

// Technically it suppose be u64, but we can't represent that without BigInt.
// We won't use BigInt because it won't play nice with the functions that UI uses.
const u64Clampedf64Schema = znumber().int().min(0).max(Number.MAX_SAFE_INTEGER);

const rbxScaleSchema = znumber().min(0).max(2);
const normalizedSchema = znumber().min(0).max(1);

const rgb24Schema = zstrictObject({
	r: u8Schema,
	g: u8Schema,
	b: u8Schema,
});

const assetWithMetaSchema = zstrictObject({
	hasMetadata: zliteral(true), // not serialized
	id: u64Clampedf64Schema, // u64
	order: u8Schema, // u8
	puffiness: f16Schema, // f16
	position: v3f32B96Schema, // [f32 f32 f32]
	rotation: v3f32B96Schema, // [f32 f32 f32]
	scale: v3f32B96Schema, // [f32 f32 f32]
});

const assetWithoutMetaSchema = zstrictObject({
	hasMetadata: zliteral(false), // not serialized
	id: u64Clampedf64Schema // u64
});

const assetSchema = zunion([assetWithMetaSchema, assetWithoutMetaSchema]);

export const outfitSchema = zstrictObject({
	/**
	 * Name of the outfit. UTF-8 string of max length of 255.
	 */
	name: zstring().max(255), // [u8]

	created: u64Clampedf64Schema, // u64 (clamped to f64)
	modified: u64Clampedf64Schema, // u64 (clamped to f64)
	lastUsed: u64Clampedf64Schema, // u64 (clamped to f64)
	useCount: u16Schema, // u16
	tags: zarray(u8Schema).max(255), // [u8]

	headColor: rgb24Schema, // [u8 u8 u8]
	torsoColor: rgb24Schema, // [u8 u8 u8]
	leftArmColor: rgb24Schema, // [u8 u8 u8]
	rightArmColor: rgb24Schema, // [u8 u8 u8]
	leftLegColor: rgb24Schema, // [u8 u8 u8]
	rightLegColor: rgb24Schema, // [u8 u8 u8]

	height: rbxScaleSchema, // f16
	width: rbxScaleSchema, // f16
	head: rbxScaleSchema, // f16
	depth: rbxScaleSchema, // f16
	proportion: rbxScaleSchema, // f16

	bodyType: normalizedSchema, // u8
	avatarType: znativeEnum(AvatarType), // u8

	assets: zarray(assetSchema),

	thumbnail: zinstanceof(ArrayBuffer)
});

const tagsSchema = zarray(zstring().max(255)).max(255);

const wardrobeSchema = zstrictObject({
	version: zliteral(0), // u16
	outfits: zarray(outfitSchema),
	tags: tagsSchema
});

type RGB24 = zinfer<typeof rgb24Schema>;

type V3F32B96 = zinfer<typeof v3f32B96Schema>;

export type Outfit = zinfer<typeof outfitSchema>;

export type Wardrobe = zinfer<typeof wardrobeSchema>;

type Asset = zinfer<typeof assetSchema>;

/**
 * Writes total of 96 bits (12 bytes) representing Vector3 (x, y, z) with each axis being Float32.
 */
function writeV3F32B96(b: Buffer, offset: number, value: V3F32B96) {
	b.writef32(offset, value.x);
	b.writef32(offset + 4, value.y);
	b.writef32(offset + 8, value.z);
}

function readV3F32B96(b: Buffer, offset: number): V3F32B96 {
	const x = b.readf32(offset);
	const y = b.readf32(offset + 4);
	const z = b.readf32(offset + 8);
	return { x, y, z };
}

function writeRGB24(b: Buffer, offset: number, color: RGB24) {
	b.writeu8(offset, color.r);
	b.writeu8(offset + 1, color.g);
	b.writeu8(offset + 2, color.b);
}

function readRGB24(b: Buffer, offset: number): RGB24 {
	return {
		r: b.readu8(offset),
		g: b.readu8(offset + 1),
		b: b.readu8(offset + 2)
	};
}

// Returns length in bytes
function writeTagIds(b: Buffer, offset: number, tags: number[]): number {
	const tagsLen = tags.length;
	b.writeu8(offset, tagsLen);
	
	for (let i = 0; i < tagsLen; i++) {
		b.writeu8(offset + 1 + i, tags[i]!);
	}

	return 1 + tagsLen;
}

function readTagIds(b: Buffer, offset: number): [number[], number] {
	const tagsLen = b.readu8(offset);
	const tags = new Array<number>(tagsLen);

	for (let i = 0; i < tagsLen; i++) {
		tags[i] = b.readu8(offset + 1 + i);
	}

	return [tags, 1 + tagsLen];
}

// Returns length in bytes
function writeName(b: Buffer, offset: number, name: string): number {
	const nameUtf8Len = b.writeutf8(offset + 1, name);
	b.writeu8(offset, nameUtf8Len);
	return 1 + nameUtf8Len;
}

function readName(b: Buffer, offset: number): [string, number] {
	const nameUtf8Len = b.readu8(offset);
	return [b.readutf8(offset + 1, nameUtf8Len), 1 + nameUtf8Len];
}

function writeAssets(b: Buffer, offset: number, assets: Asset[]) {
	const withMeta: (Asset & { hasMetadata: true })[] = [];
	const withoutMeta: (Asset & { hasMetadata: false })[] = [];

	for (const asset of assets) {
		if (asset.hasMetadata) {
			// With meta
			withMeta.push(asset);
		} else {
			// Without meta
			withoutMeta.push(asset);
		}
	}

	const withLen = withMeta.length;
	const withoutLen = withoutMeta.length;

	b.writeu8(offset, withLen);
	b.writeu8(offset + 1, withoutLen);

	const headerLen = 2;

	for (let i = 0; i < withoutLen; i++) {
		b.writeu64(offset + headerLen + (i * 8), BigInt(withoutMeta[i]!.id));
	}

	const pairLen = 8 + 1 + 2 + 12 + 12 + 12; // id, order, puffiness, position, rotation, and scale

	for (let i = 0; i < withLen; i++) {
		const assetWithMeta = withMeta[i];
		const relOffset = offset + headerLen + (withoutLen * 8) + (i * pairLen);

		b.writeu64(relOffset, BigInt(assetWithMeta!.id));
		b.writeu8(relOffset + 8, assetWithMeta!.order);
		b.writef16(relOffset + 9, assetWithMeta!.puffiness);

		writeV3F32B96(b, relOffset + 11, assetWithMeta!.position);
		writeV3F32B96(b, relOffset + 23, assetWithMeta!.rotation);
		writeV3F32B96(b, relOffset + 35, assetWithMeta!.scale);
	}

	return headerLen + (withoutLen * 8) + (withLen * pairLen);
}

function readAssets(b: Buffer, offset: number): [Asset[], number] {
	const withLen = b.readu8(offset);
	const withoutLen = b.readu8(offset + 1);

	const withMeta = new Array<Asset>(withLen);
	const withoutMeta = new Array<Asset>(withoutLen);

	const headerLen = 2;

	for (let i = 0; i < withoutLen; i++) {
		const id = Number(b.readu64(offset + headerLen + (i * 8)));
		withoutMeta[i] = { hasMetadata: false, id };
	}

	const pairLen = 8 + 1 + 2 + 12 + 12 + 12; // id, order, puffiness, position, rotation, and scale

	for (let i = 0; i < withLen; i++) {
		const relOffset = offset + headerLen + (withoutLen * 8) + (i * pairLen);

		const id = Number(b.readu64(relOffset));
		const order = b.readu8(relOffset + 8);
		const puffiness = b.readf16(relOffset + 9);

		const position = readV3F32B96(b, relOffset + 11);
		const rotation = readV3F32B96(b, relOffset + 23);
		const scale = readV3F32B96(b, relOffset + 35);

		withMeta[i] = { hasMetadata: true, id, order, puffiness, position, rotation, scale };
	}

	const assets = withoutMeta.concat(withMeta);

	return [assets, headerLen + (withoutLen * 8) + (withLen * pairLen)];
}

function calcTagsLen(tags: string[]) {
	const tagCount = tags.length;
	let tagsLen = 0;

	for (let i = 0; i < tagCount; i++) {
		tagsLen += utf8Encoder.encode(tags[i]).byteLength;
	}

	// 1 for the tag count header
	// tagCount for u8 UTF-8 char count
	// tagsLen for UTF-8 string total bytes
	return 1 + tagCount + tagsLen;
}

function readTags(b: Buffer, offset: number): [string[], number] {
	const tagCount = b.readu8(offset);
	const tags = new Array<string>(tagCount);

	let localOffset = 1; // +1 for tagCount offset

	for (let i = 0; i < tagCount; i++) {
		const length = b.readu8(offset + localOffset);
		const str = b.readutf8(offset + localOffset + 1, length);
		tags[i] = str;
		localOffset += 1 + length;
	}

	return [tags, localOffset];
}

function writeTags(b: Buffer, offset: number, tags: string[]): number {
	const numOfTags = tags.length;
	b.writeu8(offset, numOfTags);

	let localOffset = 1; // +1 for tagCount offset

	for (let i = 0; i < numOfTags; i++) {
		const length = b.writeutf8(offset + localOffset + 1, tags[i]!);
		b.writeu8(offset + localOffset, length);
		localOffset += 1 + length;
	}

	return localOffset;
}

function writeThumbnail(b: Buffer, offset: number, image: ArrayBuffer): number {
	const len = image.byteLength;
	b.writeu32(offset, len);
	b.fill(offset + 4, image);
	return 4 + len;
}

function readThumbnail(b: Buffer, offset: number): [ArrayBuffer, number] {
	const len = b.readu32(offset);
	return [b.slice(offset + 4, offset + 4 + len), 4 + len];
}

export function calcOutfitLen(outfit: Outfit) {
	const nameLen = 1 + utf8Encoder.encode(outfit.name).byteLength;
	const tagsLen = 1 + outfit.tags.length;

	let assetsWithMetaLen = 0;
	let assetsWithoutMetaLen = 0;

	for (const asset of outfit.assets) {
		if (asset.hasMetadata) {
			assetsWithMetaLen++;
		} else {
			assetsWithoutMetaLen++;
		}
	}

	const assetsLen = 2 + (assetsWithMetaLen * (8 + 1 + 2 + 12 + 12 + 12)) + (assetsWithoutMetaLen * 8);
	const thumbnailLen = 4 + outfit.thumbnail.byteLength;

	// {
	// 	nameLen: 43,
	// 	tagsLen: 10,
	// 	assetsLen: 138,
	// 	thumbnailLen: 240896,
	// }

	// console.debug({ nameLen, tagsLen, assetsLen, thumbnailLen });

	return 57 + nameLen + tagsLen + assetsLen + thumbnailLen;
}

export function readOutfitLen(b: Buffer, offset: number): number {
	const bufferLen = b.arrayBuffer.byteLength;

	const headerLen = 57;

	if (offset + headerLen >= bufferLen) {
		return 0; // out of bounds: most likely no more outfits left
	}

	const nameLen = 1 + b.readu8(offset + headerLen);

	if (offset + headerLen + nameLen >= bufferLen) {
		return 0; // out of bounds: most likely no more outfits left
	}

	const tagsLen = 1 + b.readu8(offset + headerLen + nameLen);

	if (offset + headerLen + nameLen + tagsLen >= bufferLen) {
		return 0; // out of bounds: most likely no more outfits left
	}

	const withLen = b.readu8(offset + headerLen + nameLen + tagsLen);

	if (offset + headerLen + nameLen + tagsLen + 1 >= bufferLen) {
		return 0; // out of bounds: most likely no more outfits left
	}

	const withoutLen = b.readu8(offset + headerLen + nameLen + tagsLen + 1);
	const assetsLen = 2 + (withLen * (8 + 1 + 2 + 12 + 12 + 12)) + (withoutLen * 8);

	if (offset + headerLen + nameLen + tagsLen + assetsLen >= bufferLen) {
		return 0; // out of bounds: most likely no more outfits left
	}

	const thumbnailLen = 4 + b.readu32(offset + headerLen + nameLen + tagsLen + assetsLen);

	// console.debug({
	// 	headerLen,
	// 	nameLen,
	// 	tagsLen,
	// 	assetsLen,
	// 	thumbnailLen
	// });

	return headerLen + nameLen + tagsLen + assetsLen + thumbnailLen;
}

export function writeOutfit(b: Buffer, offset: number, outfit: Outfit) {
	// Section (26 bytes)
	b.writeu64(offset, BigInt(outfit.created));
	b.writeu64(offset + 8, BigInt(outfit.modified));
	b.writeu64(offset + 16, BigInt(outfit.lastUsed));
	b.writeu16(offset + 24, outfit.useCount);

	// Section (44 bytes)
	writeRGB24(b, offset + 26, outfit.headColor);
	writeRGB24(b, offset + 29, outfit.torsoColor);
	writeRGB24(b, offset + 32, outfit.leftArmColor);
	writeRGB24(b, offset + 35, outfit.rightArmColor);
	writeRGB24(b, offset + 38, outfit.leftLegColor);
	writeRGB24(b, offset + 41, outfit.rightLegColor);

	// Section (57 bytes)
	b.writef16(offset + 44, outfit.width);
	b.writef16(offset + 46, outfit.height);
	b.writef16(offset + 48, outfit.head);
	b.writef16(offset + 50, outfit.depth);
	b.writef16(offset + 52, outfit.proportion);
	b.writef16(offset + 54, outfit.bodyType);
	b.writeu8(offset + 56, outfit.avatarType);

	// Section (variable)
	const nameLen = writeName(b, offset + 57, outfit.name);
	const tagsLen = writeTagIds(b, offset + 57 + nameLen, outfit.tags);
	const assetsLen = writeAssets(b, offset + 57 + nameLen + tagsLen, outfit.assets);
	const thumbnailLen = writeThumbnail(b, offset + 57 + nameLen + tagsLen + assetsLen, outfit.thumbnail);

	return 57 + nameLen + tagsLen + assetsLen + thumbnailLen;
}

export function readOutfit(b: Buffer, offset: number): Outfit {
	// Section (26 bytes)
	const created = Number(b.readu64(offset));
	const modified = Number(b.readu64(offset + 8));
	const lastUsed = Number(b.readu64(offset + 16));
	const useCount = b.readu16(offset + 24);

	// Section (44 bytes)
	const headColor = readRGB24(b, offset + 26);
	const torsoColor = readRGB24(b, offset + 29);
	const leftArmColor = readRGB24(b, offset + 32);
	const rightArmColor = readRGB24(b, offset + 35);
	const leftLegColor = readRGB24(b, offset + 38);
	const rightLegColor = readRGB24(b, offset + 41);

	// Section (57 bytes)
	const width = b.readf16(offset + 44);
	const height = b.readf16(offset + 46);
	const head = b.readf16(offset + 48);
	const depth = b.readf16(offset + 50);
	const proportion = b.readf16(offset + 52);
	const bodyType = b.readf16(offset + 54);
	const avatarType = b.readu8(offset + 56);

	// Section (variable)
	const [name, nameLen] = readName(b, offset + 57);
	const [tags, tagsLen] = readTagIds(b, offset + 57 + nameLen);
	const [assets, assetsLen] = readAssets(b, offset + 57 + nameLen + tagsLen);
	const [thumbnail] = readThumbnail(b, offset + 57 + nameLen + tagsLen + assetsLen);

	return {
		created,
		modified,
		lastUsed,
		useCount,

		headColor,
		torsoColor,
		leftArmColor,
		rightArmColor,
		leftLegColor,
		rightLegColor,

		width,
		height,
		head,
		depth,
		proportion,
		bodyType,
		avatarType,

		name,
		tags,
		assets,

		thumbnail
	};
}

function encode(tags: string[], outfits: Outfit[]) {
	// Calculate buffer size

	const outfitsLen = outfits.length;
	let outfitsByteLen = 0;
	// let outfitSizes = new Array<number>(outfitsLen);

	for (let i = 0; i < outfitsLen; i++) {
		const outfitSize = calcOutfitLen(outfits[i]!);
		outfitsByteLen += outfitSize;
		// outfitSizes[i] = outfitSize;
	}

	const tagsSize = calcTagsLen(tags);

	const b = Buffer.create(2 + tagsSize + outfitsByteLen, true);

	b.writeu16(0, 0); // Write format version number

	console.debug("writing tags", tags);

	writeTags(b, 2, tags); // Write tags

	// console.debug({ tagsSize, tagsLen, outfitsByteLen });

	// Write outfits

	let outfitsByteOffset = 0;

	for (let i = 0; i < outfitsLen; i++) {
		const outfit = outfits[i];
		outfitsByteOffset += writeOutfit(b, 2 + tagsSize + outfitsByteOffset, outfit!);
	}

	return b;
}

function decode(data: ArrayBuffer) {
	const b = Buffer.from(data, true);

	if (b.arrayBuffer.byteLength < 3) {
		// 2 bytes for version header
		// 1 byte for tag count header
		// Looks like there is not enough bytes to read
		// Invalid input I suppose
		return;
	}

	const version = b.readu16(0);

	// console.debug( { version });

	const [tags, tagsLen] = readTags(b, 2);

	console.debug("decoding tags", tags, tagsLen);

	// console.debug({ tags, tagsLen });

	// console.debug("outfit len", readOutfitLen(b, 2 + tagsLen));

	const outfits: Outfit[] = [];

	let offset = 2 + tagsLen;

	// There is nothing else besides outfits at this point
	// just keep moving offset forward, and keep gathering outfits until
	// 0 is encountered, then break out since there is nothing left for us to retrieve
	while (true) {
		const outfitLen = readOutfitLen(b, offset);
		if (outfitLen === 0) {
			// No more outfits
			break;
		}

		// console.debug({ offset });

		// Outfit was found, add it to the list

		outfits.push(readOutfit(b, offset));
		offset += outfitLen;
	}

	// console.debug({ outfits });

	return { version, tags, outfits };

	// for (let i = 0; i < outfitsLen; i++) {
	// 	const outfit = outfits[i];
	// 	writeOutfit(b, outfitsByteOffset, outfit);
	// 	outfitsByteOffset += outfitSizes[i];
	// }
}

export function safeEncode(tags: string[], outfits: Outfit[]): Buffer | undefined {
	const parsedTags = tagsSchema.safeParse(tags);
	if (!parsedTags.success) {
		console.warn("encoding failed because tags did not validate", parsedTags.error);
		return;
	}

	const parsedOutfits = outfitSchema.array().safeParse(outfits);
	if (!parsedOutfits.success) {
		console.warn("encoding failed because outfits did not validate", parsedOutfits.error);
		return;
	}

	return encode(tags, outfits);
}

export function safeDecode(data: ArrayBuffer): Option<Wardrobe> {
	// const t0 = performance.now();
	// console.debug("decoding took", performance.now() - t0, "ms");
	// TODO: Validation is slow, perhaps we can do "unsafe" read for initial load?
	// const t = performance.now();
	// const parsed = wardrobeSchema.safeParse(decoded);
	// console.debug("validation took", performance.now() - t, "ms");
	// return parsed;

	// Wrapped in try catch since invalid data will cause buffer related error like "out of bounds"
	// though we don't care about handling it *properly* since we need absolute speed
	try {
		const decoded = decode(data);
		if (decoded) {
			return { ...decoded, version: 0 };
		}
	} catch (e) {
		// Most likely malformed data; just return nothing to indicate unsuccessful decoding
		console.warn(e);
	}

	return null;
}

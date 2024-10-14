import { expect, test, describe } from "bun:test";
import { Buffer } from "../src/lib/buffer";
import { safeEncode, safeDecode, type Outfit, AvatarType } from "../src/modules/wardrobe/codec/v0";

const ASCII_TAGS = ["Dog", "Cat", "Bunny", "Chick"];
// const UTF8_TAGS = ["Dog🐕", "Cat🐈", "Bunny🐇", "Chick🐤"];
// const MIXED_TAGS = ["Dog🐕", "Cat", "Bunny🐇", "Chick"];

const VALID_OUTFIT: Outfit = {
	name: "Regulus Corneas - レグルス・コルニアス",

	created: 1727368869884,
	modified: 1727368882829,
	lastUsed: 0,
	useCount: 8471,
	tags: [],

	head: 1.253,
	width: 0.043,
	height: 2,
	depth: 0.591,
	proportion: 0.333,
	bodyType: 0.5,
	avatarType: AvatarType.R15,

	headColor: { r: 255, g: 50, b: 0 },
	torsoColor: { r: 36, g: 98, b: 254 },
	leftArmColor: { r: 25, g: 20, b: 73 },
	rightArmColor: { r: 32, g: 61, b: 9 },
	leftLegColor: { r: 1, g: 2, b: 3 },
	rightLegColor: { r: 4, g: 22, b: 63 },

	assets: [
		{
			hasMetadata: true,
			id: 1817955101345922,
			order: 1,
			puffiness: 1,
			position: { x: 3.265, y: -38.345, z: 61.491 },
			rotation: { x: 7.812, y: -4.591, z: 1.581 },
			scale: { x: 82.351, y: -42.455, z: 7.456 },
		},
		{
			hasMetadata: true,
			id: 2153791566,
			order: 2,
			puffiness: 1,
			position: { x: 3.265, y: -38.345, z: 61.491 },
			rotation: { x: 7.812, y: -4.591, z: 1.581 },
			scale: { x: 82.351, y: -42.455, z: 7.456 },
		},
		{
			hasMetadata: false,
			id: 112752184
		},
		// We don't care about the order when encoding & decoding, so we will sort it (assets only)
	].toSorted((a, b) => a.id - b.id) as Outfit["assets"],

	thumbnail: new ArrayBuffer(0)
};

deepRoundValues(VALID_OUTFIT, 3); // Precision up to 3 decimals is fine

const INVALID_DATA = [
	undefined,
	null,
	true,
	false,
	-1,
	0,
	1,
	Number.NaN,
	Number.POSITIVE_INFINITY,
	Number.NEGATIVE_INFINITY,
	"",
	"hello",
	[1, 2, 3],
	{},
	{ key: "value" },
	() => {},
	Symbol("symbol"),
	new Set([1, 2, 3]),
	new Map([[1, "one"], [2, "two"]]),
	new Date(),
	/regex/,
];

function round(x: number, decimals: number) {
	const factor = 10 ** decimals;
	return Math.round(x * factor) / factor;
}

function deepRoundValues<T extends object>(obj: T, decimals: number) {
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			const value = obj[i];
			if (typeof(value) === "number") {
				obj[i] = round(value, decimals);
			} else if (typeof(value) === "object") {
				deepRoundValues(value, decimals);
			}
		}
	} else {
		for (const key in obj) {
			const value = obj[key];
			if (typeof(value) === "number") {
				// biome-ignore lint/suspicious/noExplicitAny: i know what i am doing
				obj[key] = round(value, decimals) as any;
			} else if (typeof(value) === "object") {
				deepRoundValues(value!, decimals);
			}
		}
	}
}

// Small Fast Counting RNG
function sfc32(a: number, b: number, c: number, d: number) {
	return () => {
		a |= 0; b |= 0; c |= 0; d |= 0;
		const t = (a + b | 0) + d | 0;
		d = d + 1 | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	};
}

// Fixed seed, so that "random values" will be the same for every time that the test will be run
// To generate a seed, you can use (Math.random()*2**32)>>>0
const fixedRand = sfc32(2903328393, 4273514075, 2021432224, 1453261564);

function fillRandBytes(buffer: ArrayBuffer) {
	const arr = new Uint8Array(buffer);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = Math.floor(fixedRand() * 256); // Generate random byte (0-255)
	}
}

describe("Encoding", () => {
	test("Can accept empty arrays as input", () => {
		const data = safeEncode([], []);
	
		expect(data).toBeInstanceOf(Buffer);
		expect(data?.arrayBuffer).toBeInstanceOf(ArrayBuffer);
	});

	test("Can reject invalid input", () => {
		for (const invalidData of INVALID_DATA) {
			// biome-ignore lint/suspicious/noExplicitAny: i know what i am doing
			const data = safeEncode(invalidData as any, invalidData as any);
			expect(data).toBeUndefined();
		}
	});
});

describe("Decoding", () => {
	test("Can reject empty data", () => {
		const data = safeDecode(new ArrayBuffer(0));
		expect(data).toBeUndefined();
	});

	test("Can reject malformed data", () => {
		const b = new ArrayBuffer(512);
		fillRandBytes(b);

		const data = safeDecode(b);
		expect(data).toBeUndefined();
	});
});

describe("Encoding & Decoding", () => {
	test("Can encode information and decode it without a loss (loseless compression test)", () => {
		const encodedData = safeEncode(ASCII_TAGS, [VALID_OUTFIT]);

		expect(encodedData).toBeInstanceOf(Buffer);
		expect(encodedData?.arrayBuffer).toBeInstanceOf(ArrayBuffer);

		const decodedData = safeDecode(encodedData!.arrayBuffer);

		expect(decodedData).toBeObject();

		// We don't care about the order when encoding & decoding, so we will sort it (assets only)
		// biome-ignore lint/complexity/noForEach: doesn't matter, i don't really care
		decodedData!.outfits.forEach(v => v.assets.sort((a, b) => a.id - b.id));

		// Precision up to 3 decimals is fine
		deepRoundValues(decodedData!.outfits, 3);

		expect(decodedData!.version).toBe(0);
		expect(decodedData!.tags).toStrictEqual(ASCII_TAGS);
		expect(decodedData!.outfits).toStrictEqual([VALID_OUTFIT]);

		// expect(decodedData).toStrictEqual({
		// 	version: 0,
		// 	tags: ASCII_TAGS,
		// 	outfits: [VALID_OUTFIT],
		// });
	});
});

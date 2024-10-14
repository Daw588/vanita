import { Buffer } from "../../lib/buffer";
import { safeDecode, safeEncode, type Wardrobe } from "./codec/v0";
import type { Option } from "../util";
import { Err, Ok, type Result } from "../../lib/result";
import { decodeVersion } from "./codec/entry";
import type { LoadedOutfit, QueryTag } from "./outfits";

function exportJSON(wardrobe: Wardrobe): Blob {
	const data = {
		...wardrobe,
		outfits: wardrobe.outfits.map(outfit => {
			return {
				...outfit,
				thumbnail: Buffer.from(outfit.thumbnail, true).toBase64()
			};
		})
	};

	const str = JSON.stringify(data);
	const bytes = new TextEncoder().encode(str);

	return new Blob([bytes], { type: "application/json" });
}

function exportBinary(wardrobe: Wardrobe): Option<Blob> {
	const data = safeEncode(wardrobe.tags, wardrobe.outfits);
	if (data) {
		// We are not using "application/octet-stream" because it's generic
		// and thus we can't tell random binary file apart from our binary file
		// until we start reading the binary stream of data
		return new Blob([data.arrayBuffer], { type: "application/vanita" });
	}
	return null;
}

type DesBinaryError =
	{ kind: "DecoderFail" }
	| { kind: "UnsupportedVersion"}

export function desBinary(data: ArrayBuffer): Result<Wardrobe, DesBinaryError> {
	const version = decodeVersion(data)
	if (version === 0) {
		const decodedData = safeDecode(data);
		if (decodedData) {
			return Ok(decodedData);
		}
		return Err({ kind: "DecoderFail" });
	}

	console.warn(`Failed to decode: Retrieved wardrobe whos version is '${version}' but none of the available codecs support it.`);
	return Err({ kind: "UnsupportedVersion" });
}

function desJSON(data: string) {
	// TODO: Support JSON deserialization
}

type ImportError =
	{ kind: "UnsupportedFormat" }
	| { kind: "BinaryDeserializationFail", error: DesBinaryError }

export async function importWardrobe(file: File, tags: QueryTag[], outfits: LoadedOutfit[]): Promise<Result<void, ImportError>> {
	let wardrobe: Wardrobe;

	// Deserialize
	if (file.name.endsWith(".vanita")) {
		const result = desBinary(await file.arrayBuffer());
		if (result.success) {
			wardrobe = result.value;
		} else {
			return Err({ kind: "BinaryDeserializationFail", error: result.error });
		}
	} else if (file.name.endsWith(".json")) {
		// desJSON(await file.text());
		throw "WHAT IN THE WORLD!!!!!";
	} else {
		return Err({ kind: "UnsupportedFormat" });
	}

	const tagIds: number[] = [];

	for (let i = 0; i < wardrobe.tags.length; i++) {
		const tagName = wardrobe.tags[i]!;
		const tagId = tags.findIndex(tag => tag.label === tagName);
		
		if (tagId === -1) {
			// Tag doesn't exist in the registry, so add it
			const newTagId = tags.push({ label: tagName, checked: false });
			tagIds[i] = newTagId;
		} else {
			// Tag exists in the registry
			tagIds[i] = tagId;
		}
	}

	// Prepend the outfits to the existing outfits
	for (const outfit of wardrobe.outfits) {
		// Swap each tag id with a new id that corresponds to the tags in the extension tag registry
		for (let i = 0; i < outfit.tags.length; i++) {
			const currTagId = outfit.tags[i]!;
			const newTagId = tagIds[currTagId]!;
			outfit.tags[i] = newTagId;
		}

		const thumbnailBlob = new Blob([outfit.thumbnail]);

		outfits.unshift({
			...outfit,
			thumbnailUrl: URL.createObjectURL(thumbnailBlob)
		});
	}

	console.debug(wardrobe);

	return Ok();
}

export function exportWardrobe(format: "json" | "binary", wardrobe: Wardrobe): Option<Blob> {
	if (format === "json") {
		return exportJSON(wardrobe);
	}
	return exportBinary(wardrobe);
}

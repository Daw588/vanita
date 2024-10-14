import { Buffer } from "../../../lib/buffer";

export function decodeVersion(data: ArrayBuffer) {
	const b = Buffer.from(data, true);
	return b.readu16(0); // version number
}

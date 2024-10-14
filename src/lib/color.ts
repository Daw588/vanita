import type { Option } from "../modules/util";

export type RGB = { r: number, g: number, b: number }

/**
 * Works with or without the "#" prefix.
 */
/*@__INLINE__*/
export function hex2rgb(hex: string): Option<RGB> {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (result) {
		return {
			r: Number.parseInt(result[1]!, 16),
			g: Number.parseInt(result[2]!, 16),
			b: Number.parseInt(result[3]!, 16)
		};
	}
	return null;
}

/**
 * Doesn't include the "#" prefix, if you need it, you can add it yourself `"#" + hex`.
 */
/*@__INLINE__*/
export function rgb2hex({ r, g, b }: RGB): string {
	return (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

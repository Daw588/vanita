import { to } from "../lib/to";
import { getCurrentTab, saveJsonFile } from "../lib/browser";
import type { Outfit } from "../modules/defs";

/**
 * Rationale:
 * When it is possible to have a value `T | null` should be used.
 * If the function returns nothing `void` should be used.
 * If parameter is optional `parameter?:` should be used.
 */
export type Option<T> = T | null;

export function formatBytes(bytes: number, decimals = 2): string {
	if (!+bytes) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k**i).toFixed(dm))} ${sizes[i]}`;
}

export function timeAgo(past: number, now: number) {
	const formatter = new Intl.RelativeTimeFormat("en");
	const ranges = [
		["years", 3600 * 24 * 365],
		["months", 3600 * 24 * 30],
		["weeks", 3600 * 24 * 7],
		["days", 3600 * 24],
		["hours", 3600],
		["minutes", 60],
		["seconds", 1],
	] as const;
	const secondsElapsed = (past - now) / 1000;
	for (const [rangeType, rangeVal] of ranges) {
		if (rangeVal < Math.abs(secondsElapsed)) {
			const delta = secondsElapsed / rangeVal;
			return formatter.format(Math.round(delta), rangeType);
		}
	}
	return "Just now";
}

export function formatNumber(x: number | bigint) {
	const formatter = new Intl.NumberFormat("en");
	return formatter.format(x);
}

export function arraysEqual(a: Array<unknown>, b: Array<unknown>) {
	if (a === b) {
		// Array references match
		return true;
	}

	if (a == null || b == null) {
		return false;
	}

	if (a.length !== b.length) {
		// Array sizes are not equal
		return false;
	}

	// Check if every element matches
	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) {
			// One of the elements does not match
			return false;
		}
	}

	return true;
}

export async function exportOutfits(outfits: Outfit[]) {
	const [err] = await to(saveJsonFile(`vanita-outfits-${Date.now()}`, JSON.stringify(outfits)));
	return err;
}

// export function base64toBlob(b64Data: string, contentType: string, sliceSize = 512) {
// 	const byteCharacters = atob(b64Data);
// 	const byteArrays = [];

// 	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
// 		const slice = byteCharacters.slice(offset, offset + sliceSize);

// 		const byteNumbers = new Array(slice.length);
// 		for (let i = 0; i < slice.length; i++) {
// 			byteNumbers[i] = slice.charCodeAt(i);
// 		}

// 		const byteArray = new Uint8Array(byteNumbers);
// 		byteArrays.push(byteArray);
// 	}
	
// 	return new Blob(byteArrays, { type: contentType });
// }

export async function toDesiredImageCodec(base64: string, type: string, quality: number): Promise<Blob> {
	return new Promise(resolve => {
		const image = new Image();
		image.src = base64;
		image.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(image, 0, 0);

			canvas.toBlob(blob => {
				if (blob) {
					resolve(blob);
				}
			}, type, quality);
		}
	});
}

export async function getUserIdFromCurrentProfilePage(): Promise<Option<number>> {
	const currentTab = await getCurrentTab();
	if (!currentTab) {
		return null;
	}

	if (!currentTab.url) {
		return null;
	}

	// Extract user id from the current profile page

	const url = new URL(currentTab.url);
	if (!url.pathname.startsWith("/users/")) {
		return null;
	}

	return Number.parseInt(url.pathname.split("/")[2]!);
}

// async function getStorageUsageText() {
// 	const bytesUsed = await chrome.storage.local.getBytesInUse();
// 	const hasUnlimitedStorage = await chrome.permissions.contains({
// 		permissions: ["unlimitedStorage"]
// 	});

// 	if (hasUnlimitedStorage) {
// 		return util.formatBytes(bytesUsed);
// 	} else {
// 		const quota = chrome.storage.local.QUOTA_BYTES;
// 		const lower = util.formatBytes(bytesUsed);
// 		const upper = util.formatBytes(quota);
// 		const percentage = ((bytesUsed / quota) * 100).toFixed(2);
// 		return `${lower}/${upper} (${percentage}%);`
// 	}
// }

// const png = await changeImageCodec(thumbnailBase64, "image/png", 0.8);
// const jpeg = await changeImageCodec(thumbnailBase64, "image/jpeg", 0.8);
// const webp = await changeImageCodec(thumbnailBase64, "image/webp", 0.8);

// console.debug({ png, jpeg, webp });

// console.debug({ thumbnailBase64 });
// const thumbnailBlob = b64toBlob(thumbnailBase64.replace("data:image/png;base64,", ""), "image/png");

// const thumbnailBlob = await browser.fetchImageBlob(thumbnailUrl);

// console.debug({ thumbnailBlob });

/**
 * Overwrites object `a` with object `b`, in place, without changing `a`'s reference.
 * Object `b` is deeply copied, and so all of the references that it has are dropped.
 * After the overwrite, when you modify `a`, anything that referenced object `a` will be able to access its contents as the reference to the object did not change.
 * Additionally, any change done to `a` will not effect object `b`, including its nested objects.
 * 
 * ```ts
 * const a = { balance: 100, currency: "USD" };
 * const b = { balance: 200 };
 * 
 * overwrite(a, b);
 * 
 * console.log(a.balance); // 200
 * console.log(a.currency); // undefined
 * 
 * a.balance = 300;
 * 
 * console.log(a.balance); // 300
 * console.log(b.balance); // 200
 * ```
 */
export function overwrite(a: object, b: object) {
	for (const key in a) {
		delete a[key as keyof typeof a];
	}
	Object.assign(a, structuredClone(b));
}

// export function clamp(value: number, min: number, max: number) {
// 	if (value < min) return min;
// 	if (value > max) return max;
// 	return value;
// }

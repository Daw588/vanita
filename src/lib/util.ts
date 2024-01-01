
export function formatBytes(bytes: number, decimals: number = 2): string {
	if (!+bytes) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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

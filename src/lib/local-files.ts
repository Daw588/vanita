export default class LocalFiles {
	public constructor() {}

	public static getAssetUrl(path: string) {
		return chrome.runtime.getURL(path);
	}
}
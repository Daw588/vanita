export default class LocalStorage<T> {
	public readonly key: string;
	public readonly defaultValue: T;

	public constructor(key: string, defaultValue: T) {
		this.key = key;
		this.defaultValue = defaultValue;
	}

	public async save(value: T) {
		const target = {};
		target[this.key] = value;

		await chrome.storage.sync.set(target);
	}

	public async load() {
		const values = await chrome.storage.sync.get([this.key]);
		const value = values[this.key];
		const finalValue = (value) ? value : this.defaultValue;
		
		return finalValue as unknown as T;
	}
}
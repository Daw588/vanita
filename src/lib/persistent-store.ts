import { writable } from "svelte/store";

export default function createPersistentStore<T>(key: string, defaultValue: T, callback?: (newValue: T) => void) {
	let isValueLoadedFromMemory = false;

	// Create store and listen to changes
	const store = writable<T>(defaultValue);
	store.subscribe(async newValue => {
		if (!isValueLoadedFromMemory) {
			return;
		}

		// Change occured, save the change to storage!
		const target = {};
		target[key] = newValue;

		await chrome.storage.local.set(target);

		//console.log("Saved", key, newValue, target);

		// Allow for custom event
		if (callback) {
			callback(newValue);
		}
	});

	// Retrieve value from storage
	chrome.storage.local.get([key]).then(values => {
		const value = values[key];
		if (value) {
			store.set(value);
			//console.log("Loaded", key, value);
		}

		isValueLoadedFromMemory = true;

		// Allow for custom event
		if (callback) {
			callback(value);
		}
	});

	//console.log("Initialized", key, defaultValue);

	// Allow for external communication with the store
	return store;
}
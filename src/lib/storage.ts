function openDB(name: string): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const connection = indexedDB.open(name);
		// biome-ignore lint/suspicious/noExplicitAny: i have a good reason I suppose
		connection.onsuccess = event => resolve((event as any).target.result);
		connection.onerror = () => reject();
		connection.onblocked = () => reject();
		connection.onupgradeneeded = event => {
			// biome-ignore lint/suspicious/noExplicitAny: i have a good reason I suppose
			const db = (event as any).target.result as IDBDatabase;
			if (!db.objectStoreNames.contains("root")) {
				db.createObjectStore("root");
			}
		}
	});
}

function write<T>(db: IDBDatabase, name: string, data: T): Promise<void> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(["root"], "readwrite");
		const store = transaction.objectStore("root");
		const request = store.put(data, name);
		request.onsuccess = () => resolve();
		request.onerror = () => reject();
	});
}

function read(db: IDBDatabase, name: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(["root"], "readonly");
		const store = transaction.objectStore("root");
		const request = store.get(name);
		// biome-ignore lint/suspicious/noExplicitAny: i have a good reason I suppose
		request.onsuccess = response => resolve((response as any).target.result);
		request.onerror = () => reject();
	});
}

type SupportedDatatypes = string | number | boolean | ArrayBuffer | Blob

export class Storage {
	private db: IDBDatabase;

	private constructor(db: IDBDatabase) {
		this.db = db;
	}

	/*@__INLINE__*/
	public static async open(key: string) {
		return new Storage(await openDB(key));
	}

	/*@__INLINE__*/
	public async read(key: string) {
		return await read(this.db, key);
	}

	/*@__INLINE__*/
	public async write<T extends SupportedDatatypes>(key: string, value: T) {
		await write(this.db, key, value);
	}
}

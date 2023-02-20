export default class MemoryStore<T> {
	private realData: T;

	public constructor(defaultValue: T) {
		this.data = defaultValue;
	}

	set data(newValue: T) {
		this.realData = newValue;
	}

	get data() {
		return this.realData;
	}
}
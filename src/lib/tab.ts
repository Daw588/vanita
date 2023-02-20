export default class Tab {
	public readonly name: string;
	public isSelected = false;

	public constructor(name: string) {
		this.name = name;
	}
}
import * as RbxApi from "./rbx-api";

interface CurrentUser {
	id: number,
	name: string,
	displayName: string
}

export default class User {
	public id: number;
	public name: string;
	public displayName: string;
	
	public constructor() {}

	public static async getCurrentUser() {
		const res = await RbxApi.get("https://users.roblox.com/v1/users/authenticated");
		const body = await res.json() as unknown as CurrentUser;

		const user = new User();
		user.id = body.id;
		user.name = body.name;
		user.displayName = body.displayName;

		return user;
	}
}
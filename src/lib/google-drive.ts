import { Err, Ok, type Result } from "./core/result";

type File = {
	/**
	 * File name with the file extension. For example: `mycoolfile.txt`. Slashes `/` do not create folders, in fact, they're a valid part of the name.
	 */
	name: string,
	mimeType: "application/json",
	data: string,

	/**
	 * `User` context is the one that the user has access to, the "My Drive folder".
	 * `App` context is meant for applications to save their configuration, and other important files, in isolated space, to which user cannot access, nor see through the official interface. It's often referred to as "hidden app data".
	 */
	context: "user" | "app"
}

/**
 * Uploads file to Google Drive of logged in user.
 * @param accessToken 
 * @param file 
 * @returns 
 */
export async function upload(accessToken: string, file: File) {
	const initialParams = new URLSearchParams({
		uploadType: "resumable"
	});

	const intialResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?" + initialParams.toString(), {
		method: "POST",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "application/json; charset=UTF-8"
		},
		body: JSON.stringify({
			name: file.name,
			mimeType: file.mimeType,
			parents: file.context === "user" ? [] : ["appDataFolder"]
		})
	});

	// console.log("initial response", intialResponse);

	if (!intialResponse.ok) {
		return false;
	}

	const location = intialResponse.headers.get("Location");
	if (!location) {
		return false;
	}

	const uploadResponse = await fetch(location, {
		method: "PUT",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"X-Upload-Content-Type": "application/json"
		},
		body: file.data
	});

	// console.log("upload response", uploadResponse);

	if (!uploadResponse.ok) {
		return false;
	}

	return true;
}

type ListResponse = {
	nextPageToken: string,
	kind: string,
	incompleteSearch: boolean,
	files: {
		id: string,
		kind: "drive#file",
		mimeType: "application/json",
		name: string
	}[]
}

export async function list(accessToken: string): Promise<Result<ListResponse, { statusCode: number }>> {
	const params = new URLSearchParams({
		spaces: "appDataFolder",
		pageSize: "10"
	});

	const response = await fetch("https://www.googleapis.com/drive/v3/files?" + params.toString(), {
		method: "GET",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "application/json; charset=UTF-8"
		}
	});

	if (!response.ok) {
		return Err({ statusCode: response.status });
	}

	return Ok(await response.json());
}

export async function deleteFile(accessToken: string, fileId: string) {
	const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
		method: "DELETE",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "application/json; charset=UTF-8"
		}
	});

	if (!response.ok) {
		return false;
	}

	return true;
}

export async function getData(accessToken: string, fileId: string): Promise<unknown> {
	const params = new URLSearchParams({
		alt: "media"
	});

	const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?` + params.toString(), {
		method: "GET",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Content-Type": "application/json; charset=UTF-8"
		}
	});

	if (!response.ok) {
		return;
	}

	// console.log("res", await response.json());
	return await response.json();
}

// export async function getMetadata(accessToken: string, fileId: string) {
// 	const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?`, {
// 		method: "GET",
// 		headers: {
// 			"Authorization": "Bearer " + accessToken,
// 			"Content-Type": "application/json; charset=UTF-8"
// 		}
// 	});

// 	if (!response.ok) {
// 		return;
// 	}

// 	return (await response.json());
// }
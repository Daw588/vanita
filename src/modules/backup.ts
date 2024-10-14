import { settings } from "./stores";
import { deleteFile, getData, list, upload } from "../lib/google-drive";
import { backup } from "./perstore";
import { Ok, Err, type Result } from "../lib/result";
import { GoogleOAuth2 } from "./oauth2";
import { readFromDiskRaw } from "./wardrobe/browser-storage";

type Metadata = {
	createdAt: number,
	automatic: boolean,
	fileSize: number
}

export type RestorePoint = Metadata & {
	fileId: string
}

function decodeMetadata(str: string): Metadata {
	// outfits-000000000000-0-0.json
	// [outfits] [000000000000] [0]          [0]
	//  ^ desc    ^ createdAt    ^ automatic  ^ size (bytes)

	const metadata = str.replace(".json", "").split("-");
	const createdAt = Number.parseInt(metadata[1]!);
	// const automatic = Number.parseInt(metadata[2]!) === 0 ? false : true;
	const automatic = Number.parseInt(metadata[2]!) !== 0;
	const fileSize = Number.parseInt(metadata[3]!);

	return {
		createdAt,
		automatic,
		fileSize
	};
}

function encodeMetadata(metadata: Metadata): string {
	return `outfits-${metadata.createdAt}-${metadata.automatic ? 1 : 0}-${metadata.fileSize}.json`;
}

export async function getRestorePoints(): Promise<Result<RestorePoint[], "user_unauthenticated" | "google_drive_api_failure">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	const res = await list(token);
	if (!res.success) {
		return Err("user_unauthenticated");
	}

	const recoveryPoints = [];
	for (const file of res.value.files) {
		if (file.name.startsWith("outfits-")) {
			const metadata = decodeMetadata(file.name);
			recoveryPoints.push({
				createdAt: metadata.createdAt,
				automatic: metadata.automatic,
				fileSize: metadata.fileSize,
				fileId: file.id
			});
		}
	}
	return Ok(recoveryPoints);
}

export async function deleteRestorePoint(fileId: string): Promise<Result<void, "user_unauthenticated" | "google_drive_api_failure">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	const success = await deleteFile(token, fileId);
	if (!success) {
		return Err("google_drive_api_failure");
	}

	return Ok();
}

/**
 * Deletes all restore points.
 * Returns a boolean value which indicates whether the operation was successful or not.
 */
export async function deleteAllRestorePoints(): Promise<Result<void, "user_unauthenticated" | "google_drive_api_failure">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	const res = await list(token);
	if (!res.success) {
		return Err("google_drive_api_failure");
	}

	for (const file of res.value.files) {
		if (file.name.startsWith("outfits-")) {
			await deleteFile(token, file.id);
		}
	}

	return Ok();
}

type RestoreError = 
	{
		/**
		 * Client is unauthenticated.
		 */
		kind: "UnauthenticatedClient"
	}
	| {
		/**
		 * The format described by `Content-Type` header is unsupported.
		 */
		kind: "UnsupportedFormat"
	}
	| {
		/**
		 * Can't identify the restore point file format because `Content-Type` header is missing.
		 */
		kind: "UnidentifiableFormat"
	}
	| {
		/**
		 * Google Drive API responded with an error.
		 */
		kind: "ResponseError",
		message: string
	}

export async function restoreFromRestorePoint(fileId: string): Promise<Result<void, RestoreError>> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err({ kind: "UnauthenticatedClient" });
	}

	const response = await getData(token, fileId);
	if (!response.ok) {
		return Err({ kind: "ResponseError", message: response.statusText });
	}

	const contentType = response.headers.get("Content-Type");
	if (!contentType) {
		return Err({ kind: "UnidentifiableFormat" });
	}

	if (contentType === "application/json") {
		// Legacy format support
		console.warn("JSON format is no longer supported");
	} else if (contentType === "application/vanita") {
		console.debug("Vanita format detected");
	} else {
		return Err({ kind: "UnsupportedFormat" });
	}

	console.debug({ response, contentType, fileId });

	// // Ensure the data passes structure validation before overwriting,
	// // we don't want to corrupt user's data if the file is corrupted or uses invalid format
	// const result = Outfits.safeParse(data);
	// if (!result.success) {
	// 	return Err("file_corrupted");
	// }

	// outfits.set(result.data);

	return Ok();
}

export async function createRestorePoint({ automatic }: { automatic: boolean }): Promise<Result<void, "user_unauthenticated" | "could_not_read_outfits" | "google_drive_api_failure" | "no_outfits_found">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	// const result = await perstore.outfits.read();
	// if (!result.success) {
	// 	return Err("could_not_read_outfits");
	// }

	const wardrobeRaw = await readFromDiskRaw();
	const fileSize = wardrobeRaw.byteLength;

	// Don't make empty backups/restore points, because it doesn't make sense,
	// and additionally, it could overwrite existing backups that are meaningful with nothing
	// which would result in a loss of data
	if (fileSize === 0) {
		return Err("no_outfits_found");
	}

	// const data = JSON.stringify(result.data);
	// const utf8Encode = new TextEncoder();
	// const binaryData = utf8Encode.encode(data);

	const success = await upload(token, {
		context: "app",
		name: encodeMetadata({
			createdAt: Date.now(),
			automatic,
			fileSize,
		}),
		mimeType: "application/vanita",
		data: wardrobeRaw
	});

	if (!success) {
		return Err("google_drive_api_failure");
	}

	return Ok();
}

export async function timeSinceLastAutomaticBackup() {
	const result = await backup.read();
	return result.success ? result.data.timeSinceLastBackup : Date.now();
}

export async function isEnabled() {
	return new Promise(resolve => {
		settings.subscribe(v => {
			resolve(v.backupEnabled);
		});
	});
}

import { Outfits } from "./defs";
import { outfits, settings } from "./stores";
import * as GoogleDrive from "./core/google-drive";
import perstore from "./perstore";
import { Ok, Err, type Result } from "./core/result";
import { GoogleOAuth2 } from "./oauth2";

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
	const createdAt = parseInt(metadata[1]);
	const automatic = parseInt(metadata[2]) === 0 ? false : true;
	const fileSize = parseInt(metadata[3]);

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

	const res = await GoogleDrive.list(token);
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

	const success = await GoogleDrive.deleteFile(token, fileId);
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

	const res = await GoogleDrive.list(token);
	if (!res.success) {
		return Err("google_drive_api_failure");
	}

	for (const file of res.value.files) {
		if (file.name.startsWith("outfits-")) {
			await GoogleDrive.deleteFile(token, file.id);
		}
	}

	return Ok();
}

export async function restoreFromRestorePoint(fileId: string): Promise<Result<void, "user_unauthenticated" | "file_corrupted">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	const data = await GoogleDrive.getData(token, fileId);

	// Ensure the data passes structure validation before overwriting,
	// we don't want to corrupt user's data if the file is corrupted or uses invalid format
	const result = Outfits.safeParse(data);
	if (!result.success) {
		return Err("file_corrupted");
	}

	outfits.set(result.data);
	return Ok();
}

export async function createRestorePoint({ automatic }: { automatic: boolean }): Promise<Result<void, "user_unauthenticated" | "could_not_read_outfits" | "google_drive_api_failure" | "no_outfits_found">> {
	const token = await GoogleOAuth2.getToken({ interactive: false });
	if (!token) {
		return Err("user_unauthenticated");
	}

	const result = await perstore.outfits.read();
	if (!result.success) {
		return Err("could_not_read_outfits");
	}

	// Don't make empty backups/restore points, because it doesn't make sense,
	// and additionally, it could overwrite existing backups that are meaningful with nothing
	// which would result in a loss of data
	if (result.data.length === 0) {
		return Err("no_outfits_found");
	}

	const data = JSON.stringify(result.data);

	const utf8Encode = new TextEncoder();
	const binaryData = utf8Encode.encode(data);

	const success = await GoogleDrive.upload(token, {
		context: "app",
		name: encodeMetadata({
			createdAt: Date.now(),
			automatic,
			fileSize: binaryData.byteLength,
		}),
		mimeType: "application/json",
		data
	});

	if (!success) {
		return Err("google_drive_api_failure");
	}

	return Ok();
}

export async function timeSinceLastAutomaticBackup() {
	const result = await perstore.backup.read();
	return result.success ? result.data.timeSinceLastBackup : Date.now();
}

export async function isEnabled() {
	return new Promise(resolve => {
		settings.subscribe(v => {
			resolve(v.backupEnabled);
		});
	});
}

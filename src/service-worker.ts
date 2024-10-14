import { EXTENSION_ID } from "./modules/globals";
import { listenForServiceWorkerEvents } from "./lib/browser";

import { daysBetween } from "./lib/time";
import { backup as backupStore } from "./modules/perstore";
import { Err, Ok, type Result } from "./lib/result";

import {
	isEnabled,
	timeSinceLastAutomaticBackup,
	getRestorePoints,
	deleteRestorePoint,
	createRestorePoint,
	type RestorePoint
} from "./modules/backup";

async function deleteAutomaticRestorePointsAfterIndex(restorePoints: RestorePoint[], index: number) {
	const automaticRestorePoints = restorePoints.filter(v => v.automatic === true);
	console.debug("automatic restore points", automaticRestorePoints);

	if (automaticRestorePoints.length > index - 1) {
		// Start i element, and continue until the end
		for (let i = index - 1; i < automaticRestorePoints.length; i++) {
			console.debug("deleting old restore point", i, automaticRestorePoints[i]!.fileId);
			await deleteRestorePoint(automaticRestorePoints[i]!.fileId);
		}
	}
}

async function createAutomaticBackup(): Promise<Result<void, "user_unauthenticated" | "other">> {
	const backupEnabled = await isEnabled();
	const timeSinceLastAutoBackup = await timeSinceLastAutomaticBackup();
	const daysSinceLastAutomaticBackup = daysBetween(timeSinceLastAutoBackup, Date.now());

	if (backupEnabled) {
		console.debug("Backup enabled");

		const restorePoints = await getRestorePoints();
		if (!restorePoints.success) {
			console.warn("Failed to get restore points", restorePoints.error);
			if (restorePoints.error === "user_unauthenticated") {
				return Err("user_unauthenticated");
			}
			return Err("other");
		}

		// Delete 4th, and other restore points that follow
		// await deleteAutomaticRestorePointsAfterIndex(restorePoints.value, 4);

		console.debug("Days since last automatic backup", daysSinceLastAutomaticBackup);

		if (daysSinceLastAutomaticBackup >= 1) {
			// Delete 3rd, and other restore points that follow
			await deleteAutomaticRestorePointsAfterIndex(restorePoints.value, 3);

			console.debug("Started creating automatic restore point");

			// Create automatic backup
			await createRestorePoint({ automatic: true });

			console.debug("Stopped creating automatic restore point");

			await backupStore.write({ timeSinceLastBackup: Date.now() });

			console.debug("Automatic backup successfuly created");
		}
	}

	return Ok();
}

listenForServiceWorkerEvents(async (sender, event) => {
	console.debug("Received an event", sender, event);

	// Only accept requests from the extension itself; no foreign requests!
	if (sender.id !== EXTENSION_ID) {
		console.warn("foreign request blocked");
		return;
	}

	if (event.name === "CreateAutomaticBackup") {
		console.debug("Received automatic backup request");
		return event.reply(await createAutomaticBackup());
	}
});

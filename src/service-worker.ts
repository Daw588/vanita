import { EXTENSION_ID } from "./globals";
import { listenForServiceWorkerEvents } from "./lib/core/browser";

import * as backup from "./lib/backup";
import * as time from "./lib/core/time";
import perstore from "./lib/perstore";

async function deleteAutomaticRestorePointsAfterIndex(restorePoints: backup.RestorePoint[], index: number) {
	const automaticRestorePoints = restorePoints.filter(v => v.automatic === true);
	if (automaticRestorePoints.length > index - 1) {
		// Start 4th element, and continue until the end
		for (let i = index; i < automaticRestorePoints.length; i++) {
			await backup.deleteRestorePoint(automaticRestorePoints[i].fileId);
		}
	}
}

async function createAutomaticBackup() {
	const backupEnabled = await backup.isEnabled();
	const timeSinceLastAutomaticBackup = await backup.timeSinceLastAutomaticBackup();
	const daysSinceLastAutomaticBackup = time.daysBetween(timeSinceLastAutomaticBackup, Date.now());

	if (backupEnabled) {
		console.log("Backup enabled");

		const restorePoints = await backup.getRestorePoints();
		if (!restorePoints.success) {
			console.log("Failed to get restore points");
			if (restorePoints.error === "user_unauthenticated") {
				return "user_unauthenticated";
			}
			return;
		}

		// Delete 4th, and other restore points that follow
		// await deleteAutomaticRestorePointsAfterIndex(restorePoints.value, 4);

		console.log("Days since last automatic backup", daysSinceLastAutomaticBackup);

		if (daysSinceLastAutomaticBackup >= 1) {
			// Delete 3rd, and other restore points that follow
			await deleteAutomaticRestorePointsAfterIndex(restorePoints.value, 3);

			console.log("Started creating automatic restore point");

			// Create automatic backup
			await backup.createRestorePoint({ automatic: true });

			console.log("Stopped creating automatic restore point");

			await perstore.backup.write({ timeSinceLastBackup: Date.now() });

			console.log("Automatic backup successfuly created");
		}
	}
}

listenForServiceWorkerEvents(async (sender, event) => {
	console.log("Received an event", sender, event);

	// Only accept requests from the extension itself; no foreign requests!
	if (sender.id !== EXTENSION_ID) {
		return;
	}

	if (event.name === "CreateAutomaticBackup") {
		console.log("Received automatic backup request");
		return event.reply(await createAutomaticBackup());
	}
});

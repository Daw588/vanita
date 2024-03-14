import createInfoDialog from "../create-info-dialog";
import { settings } from "../stores";
import { GoogleOAuth2 } from "../oauth2";

const lackOfAuthorizationForCloudProvider = createInfoDialog<"authorize" | "disable">({
	title: "There is a problem with the backup feature!",
	description: "You have a backup feature enabled, but Google Drive is no longer allowing Vanita to access its cloud data. This is most likely because the consent you gave has expired, or has been manually revoked. In whichever case, you can authorize Vanita again to continue using the backup functionality, or you can choose to disable it.",
	actions: [
		{ label: "Authorize", kind: "normal", value: "authorize", icon: "signature" },
		{ label: "Disable Backup", kind: "danger", value: "disable" },
	],
	dismissible: false
});

export async function promptLackOfAuthForCloudProvider() {
	const response = await lackOfAuthorizationForCloudProvider.invoke();
	if (response === "authorize") {
		await GoogleOAuth2.revokeAccess();

		const token = await GoogleOAuth2.getToken({ interactive: true });
		if (token) {
			return "authorized";
		}
	} else if (response === "disable") {
		// await perstore.settings.write({ backupEnabled: false });
		settings.set({ backupEnabled: false });
	}
	return "disabled";
}
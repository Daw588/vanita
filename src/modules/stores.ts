import { writable } from "svelte/store";
import type { Outfit } from "../modules/defs";
import { Settings } from "../modules/defs";
import { LocalStorage } from "../lib/browser";

type Page = "home" | "settings";

export const currentPage = writable<Page>("home");

export const openDialogs = writable<number>(0);

type Action = {
	label: string,
	icon?: string,
	kind?: "neutral" | "positive" | "negative",
	onClick: () => void
}

type InfoDialogProps = {
	title?: string,
	description?: string,
	allowHTML?: boolean,
	actions?: Action[],
	visible: boolean,
	dismiss?: () => void
}

/**
 * Global instance of info dialog
 */
export const gInfoDialog = writable<InfoDialogProps>({ visible: false });

export const outfits = writable<Outfit[]>([]);

const settingPersistantStore = new LocalStorage("settings/v1", Settings, {
	backupEnabled: false
});

export const settings = writable<Settings>(settingPersistantStore.defaultValue);

(async () => { // service workers don't like top level awaits
	const initialRead = await settingPersistantStore.read();
	if (initialRead.success) {
		// console.debug("Resolved initial settings data", initialRead.data);
		settings.set(initialRead.data);
	
		let initial = true;
		settings.subscribe(newValue => {
			if (!initial) {
				settingPersistantStore.write(newValue);
				// console.debug("Saved settings into persistant storage!", newValue);
			}
			initial = false;
		});
	}	
})();

import { LocalStorage } from "./core/browser";
import { Backup, Outfits } from "./defs";

/**
 * Persistent Storage
 */
export default {
	outfits: new LocalStorage("outfits/v1", Outfits, []),
	backup: new LocalStorage("backup/v1", Backup, {
		timeSinceLastBackup: Date.now()
	})
};
import { LocalStorage } from "./core/browser";
import { Backup, Outfits, OAuth2 } from "./defs";

/**
 * Persistent Storage
 */
export default {
	outfits: new LocalStorage("outfits/v1", Outfits, []),
	backup: new LocalStorage("backup/v1", Backup, {
		timeSinceLastBackup: Date.now()
	}),
	oauth2: new LocalStorage("oauth2/v1", OAuth2, {})
};
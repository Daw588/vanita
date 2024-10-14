import { LocalStorage } from "../lib/browser";
import { Backup, Outfits, OAuth2 } from "../modules/defs";

/**
 * @deprecated
 */
export const outfits = new LocalStorage("outfits/v1", Outfits, []);

export const backup = new LocalStorage("backup/v1", Backup, {
	timeSinceLastBackup: Date.now()
});

export const oauth2 = new LocalStorage("oauth2/v1", OAuth2, {})

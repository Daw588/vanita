import { queryAll } from "./util";

/**
 * Hides advertisements until destroyed.
 */
export default class AdvertisementHider {
	public constructor() {
		// Preserve space because it might impact user experience due to difference in layout spacing
		queryAll("[id*='Skyscraper-Abp']", v => v.style.visibility = "hidden");
		queryAll("[id='Leaderboard-Abp']", v => v.style.visibility = "hidden");

		// Don't preserve space on profile ads as the empty space will look odd
		queryAll("[class='profile-ads-container'", v => v.style.display = "none");
	}

	public destroy() {
		queryAll("[id*='Skyscraper-Abp']", v => v.style.visibility = "");
		queryAll("[id='Leaderboard-Abp']", v => v.style.visibility = "");
		queryAll("[class='profile-ads-container'", v => v.style.display = "");
	}
}
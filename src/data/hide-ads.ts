import AdvertisementHider from "../lib/advertisement-hider";
import createPersistentStore from "../lib/persistent-store";

let advertisementHider: AdvertisementHider;

export const hideAds = createPersistentStore<boolean>("hide-advertisements", false, (isEnabled) => {
	if (isEnabled) {
		if (!advertisementHider) {
			advertisementHider = new AdvertisementHider();
		}
	} else {
		if (advertisementHider) {
			advertisementHider.destroy();
			advertisementHider = null;
		}
	}
});
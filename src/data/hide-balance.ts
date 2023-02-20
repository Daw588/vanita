import BalanceHider from "../lib/balance-hider";
import createPersistentStore from "../lib/persistent-store";

let balanceHider: BalanceHider;

export const hideBalance = createPersistentStore<boolean>("hide-balance", false, (isEnabled) => {
	if (isEnabled) {
		if (!balanceHider) {
			balanceHider = new BalanceHider();
		}
	} else {
		if (balanceHider) {
			balanceHider.destroy();
			balanceHider = null;
		}
	}
});
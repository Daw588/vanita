import { queryAll } from "../lib/util";

/**
 * Hides Robux balance until destroyed.
 */
export default class BalanceHider {
	private observer: MutationObserver;

	public constructor() {
		queryAll("#nav-robux-amount", v => v.style.filter = "blur(8px)");

		this.observer = new MutationObserver(mutations => {
			const mutation = mutations[0];
			if (mutation.type === "attributes") {
				queryAll("#nav-robux-balance", v => v.style.filter = "blur(8px)");
			}
		});

		const button = document.getElementById("navbar-robux").getElementsByTagName("button")[0];
		
		this.observer.observe(button, {
			attributes: true
		});

		// Blur out amounts in /transactions page
		// "*=" stands for substring, so like acts like .includes()
		queryAll("[class*='amount icon-robux-container']", v => v.style.filter = "blur(8px)");
		queryAll("[class*='balance-label icon-robux-container']", v => v.style.filter = "blur(8px)");
	}

	public destroy() {
		this.observer.disconnect();

		queryAll("#nav-robux-amount", v => v.style.filter = "");
		queryAll("#nav-robux-balance", v => v.style.filter = "");
		queryAll("[class*='amount icon-robux-container']", v => v.style.filter = "");
		queryAll("[class*='balance-label icon-robux-container']", v => v.style.filter = "");
	}
}
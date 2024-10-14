import { DEBUG } from "./modules/globals";
import App from "./components/App.svelte";
import { mount } from "svelte";

// biome-ignore lint/style/noDefaultExport: I think it is necessary for Vite to function
export default mount(App, {
	target: document.getElementById("app") as HTMLDivElement,
});

if (DEBUG) {
	console.log("env", import.meta.env);

	// Reload the extension when the source code changes
	// We know that the extension is outdated when the current bundle hash doesn't match the previous
	// In case the extension is outdated, we will reload it to ensure that the latest version is loaded

	const indexScript = document.getElementsByTagName("script")[0];
	const versionSignature = indexScript!.getAttribute("src");
	if (versionSignature) {
		const previousVersionSignature = (await chrome.storage.session.get(["versionSignature"]))["versionSignature"];
		const previousSignatureExists = typeof(previousVersionSignature) === "string";

		if (previousSignatureExists && versionSignature !== previousVersionSignature) {
			console.debug(
				`Version signature mismatch -> OLD: "${previousVersionSignature}" NEW: "${versionSignature}"`
			);
			
			// Source code changed, reload the extension
			chrome.runtime.reload();
		}

		await chrome.storage.session.set({ versionSignature });
	}
}

// (async () => {
// 	console.debug("is chrome", await browser.isChrome());
// })();

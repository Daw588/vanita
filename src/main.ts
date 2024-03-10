import { DEV } from "./globals";
import App from "./App.svelte";

const app = new App({
	target: document.getElementById("app") as HTMLDivElement,
});

export default app;

if (DEV) {

	// Reload the extension when the source code changes
	// We know that the extension is outdated when the current bundle hash doesn't match the previous
	// In case the extension is outdated, we will reload it to ensure that the latest version is loaded

	const indexScript = document.getElementsByTagName("script")[0];
	const versionSignature = indexScript.getAttribute("src");
	if (versionSignature) {
		const previousVersionSignature = (await chrome.storage.session.get(["versionSignature"]))["versionSignature"];
		const previousSignatureExists = typeof(previousVersionSignature) === "string";

		if (previousSignatureExists && versionSignature !== previousVersionSignature) {
			// console.log(`Version signature mismatch -> OLD: "${previousVersionSignature}" NEW: "${versionSignature}"`);
			
			// Source code changed, reload the extension
			chrome.runtime.reload();
		}

		await chrome.storage.session.set({ versionSignature });
	}
}

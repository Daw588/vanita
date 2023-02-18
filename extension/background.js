chrome.tabs.onUpdated.addListener(async (tabId, info) => {
	if (info.status !== "complete") {
		return;
	}

	const tab = await chrome.tabs.get(tabId);
	if (!tab.url.includes("roblox.com")) {
		return;
	}

	chrome.storage.sync.get(["injectionEnabled"], data => {
		if (data.injectionEnabled) {
			chrome.scripting.executeScript({
				target: {
					tabId: tab.id
				},
				files: ["embedded.js"]
			});
		}
	});
});
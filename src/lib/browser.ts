export async function fetchImageBase64(url: string): Promise<string> {
	const activeTabs = await chrome.tabs.query({ active: true });
	const currentTab = activeTabs[0];

	const frames = await chrome.scripting.executeScript({ // Execute in a page environment to get rid of CORS error
		func: async (urlToFetch: string) => {
			return await (new Promise((resolve) => {
				const img = new Image();
				img.setAttribute("crossorigin", "anonymous"); // Get rid of tainted canvas error
				img.onload = () => {
					const canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext("2d");
					ctx?.drawImage(img, 0, 0);
					const base64 = canvas.toDataURL("image/png");;
					resolve(base64);
				}
				img.src = urlToFetch;
			}));
		},
		injectImmediately: true,
		target: { tabId: currentTab.id as number, allFrames: true },
		args: [url]
	});

	const frame = frames.find(v => typeof(v.result) === "string");
	if (!frame) {
		// console.log("Missing frame!", frames);
		return Promise.reject();
	}

	// console.log("Success");
	return Promise.resolve(frame.result as string);
}
type Optional<T> = T | undefined;

export async function executeOnTab
	<T extends (...args: Parameters<T>) => ReturnType<T>>
	(tabId: number, func: T, ...args: Parameters<T>): Promise<ReturnType<T>>
{
	const frames = await chrome.scripting.executeScript({
		func,
		args,
		injectImmediately: true,
		target: {
			tabId,

			// NOTE: Frames refer to pages within <iframe> tags
			// "allFrames" option is set to false as we only want to inject into the main page to use its environment
			// to perform actions on behalf of the user, without having access to user's credentials that otherwise
			// we would need to obtain, in order to perform actions on their behalf
			allFrames: false
		},

		// We don't want our stuff to collide with functions, and variables created by the page
		// therefore, we want our code injection context to be isolated
		world: "ISOLATED"
	});

	// Grab the return value from the injected function which was executed on the main page
	// Since it was executed on the main page, it will always be the first frame
	// Therefore, we can somewhat safely get the result by [0] and the return value by .result
	return frames[0].result as ReturnType<T>;
}

export async function getCurrentTab(): Promise<Optional<chrome.tabs.Tab>> {
	const activeTabs = await chrome.tabs.query({ active: true });
	return activeTabs[0];
}


export async function getCurrentTabId(): Promise<Optional<number>> {
	const activeTabs = await chrome.tabs.query({ active: true });
	return activeTabs[0].id;
}

export async function fetchImageBase64(url: string): Promise<string> {
	const currentTabId = await getCurrentTabId();
	if (!currentTabId) {
		throw Error("Cannot fetch image and convert it to base64 without an active tab being present");
	}

	return await executeOnTab(currentTabId, async (urlToFetch: string): Promise<string> => {
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
	}, url);
}

type RequestData<ResponseEncoding extends "binary" | "text" | "json"> = {
	url: string,
	method: "GET" | "POST",
	responseEncoding: ResponseEncoding,
	headers?: Record<string, string>,
	body?: string,
	credentials?: "include" | "omit" | "same-origin"
}

type FetchResponseBodyType<ResponseEncoding extends "binary" | "text" | "json"> = 
	ResponseEncoding extends "binary" ? ReadableStream<Uint8Array> :
	ResponseEncoding extends "text" ? string :
	ResponseEncoding extends "json" ? object : never;

type FetchResponse<ResponseEncoding extends "binary" | "text" | "json"> = {
	ok: boolean,
	statusCode: number,
	statusText: string,
	headers: Record<string, string>,
	body: FetchResponseBodyType<ResponseEncoding>
}

export async function fetchOnTab
	<ResponseEncoding extends "binary" | "text" | "json">
	(tabId: number, requestData: RequestData<ResponseEncoding>): Promise<FetchResponse<ResponseEncoding>>
{
	return await executeOnTab(tabId, async (data: RequestData<ResponseEncoding>) => {
		const response = await fetch(data.url, {
			method: data.method,
			headers: data.headers,
			body: data.body,
			credentials: data.credentials
		});

		let body;

		switch (data.responseEncoding) {
			case "text":
				body = await response.text();
				break;
			case "json":
				body = await response.json();
				break;
			default:
				body = response.body;
				break;
		}

		const headers: Record<string, string> = {};

		for (const [key, value] of response.headers.entries()) {
			headers[key] = value;
		}

		return {
			ok: response.ok,
			statusCode: response.status,
			statusText: response.statusText,
			headers: headers,
			body: body as FetchResponseBodyType<ResponseEncoding>
		}
	}, requestData);
}

export async function promptFilePicker(info: { accept?: "application/JSON" }): Promise<FileList> {
	return new Promise((resolve, reject) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = info.accept ?? "";
		input.onchange = async () => {
			const files = input.files;
			if (files) {
				return resolve(files);
			} else {
				return reject("No files were retrieved");
			}
		};
		input.click();
	});
}

export async function readFileAsString(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = event => {
			const target = event.target;
			if (target) {
				const result = target.result;
				if (typeof(result) === "string") {
					resolve(result);
				} else {
					reject("Decoded data was not a string")
				}
			} else{
				reject("No decoded data was returned");
			}
		}
		reader.readAsText(file);
	});
}

export async function reloadActiveTab(): Promise<void> {
	const activeTabs = await chrome.tabs.query({ active: true });
	const currentTab = activeTabs[0];

	return new Promise(resolve => {
		chrome.tabs.onUpdated.addListener(function onUpdated(tabId: number, info: chrome.tabs.TabChangeInfo) {
			if (currentTab && tabId === currentTab.id && info.status === "complete") {
				resolve();
				chrome.tabs.onUpdated.removeListener(onUpdated);
			}
		});

		chrome.tabs.reload();
	});
}

export async function saveJsonFile(filename: string, data: string): Promise<void> {
	return new Promise(async (resolve, reject) => {
		const blob = new Blob([data], {
			type: "application/json"
		});

		const url = URL.createObjectURL(blob);

		const hasPermission = await chrome.permissions.contains({
			permissions: ["downloads"]
		});

		if (!hasPermission) {
			const wasGranted = await chrome.permissions.request({
				permissions: ["downloads"]
			});

			if (!wasGranted) {
				reject("Downloads permission required");
				// TODO: Create a popup for this
				return;
			}
		}

		const downloadId = await chrome.downloads.download({
			url: url,
			filename: filename + ".json",
			conflictAction: "prompt",
			saveAs: true
		});

		// console.log("Download id", downloadId);

		const downloadItems = await chrome.downloads.search({ id: downloadId });
		const downloadItem = downloadItems[0];
		// console.log(downloadItems, downloadItem);
		if (downloadItem) {
			const currentState = downloadItem.state;
			// console.log(currentState);
			if (currentState === "complete") {
				resolve();
			} else if (currentState === "interrupted") {
				reject("Interrupted");
			}
		} else {
			reject("Download doesn't exist");
		}
	})
}

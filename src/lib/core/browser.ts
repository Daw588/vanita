import zod from "zod";
import to from "./to";
import { Ok, Err, type Result } from "./result";
// import { DEV } from "../../globals";

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

/**
 * @deprecated Use OAuth2 API instead
 */
export async function getAuthToken({ interactive }: { interactive: boolean }): Promise<Result<string, "session_expired" | "no_token">> {
	const [err, auth] = await to(chrome.identity.getAuthToken({ interactive }));
	if (err) {
		return Err("session_expired");
	}

	if (!auth.token) {
		return Err("no_token");
	}

	return Ok(auth.token);
}

export class LocalStorage<T extends zod.ZodTypeAny> {
	name: string;
	validator: T;
	defaultValue: zod.infer<T>;

	constructor(name: string, validator: T, defaultValue: zod.infer<T>) {
		this.name = name;
		this.validator = validator;
		this.defaultValue = defaultValue;
	}

	async read() {
		const records = await chrome.storage.local.get(this.name);
		const value = records[this.name] || this.defaultValue;

		const emptyRecord = records[this.name] === undefined;
		if (emptyRecord) {
			// Using default value, write the default value
			const success = this.write(this.defaultValue);
			if (!success) {
				throw "This should not happen";
			}
		}

		const result = this.validator.safeParse(value);
		return result as zod.SafeParseReturnType<any, zod.infer<T>>;
	}

	async write(value: zod.infer<T>) {
		const result = this.validator.safeParse(value);
		if (result.success) {
			await chrome.storage.local.set({ [this.name]: result.data });
			return true;
		}
		return false;
	}
}

type ServiceWorkerEvent<Request, Response> = {
	request: Request,
	response: Response
}

export type CustomEvents = {
	CreateAutomaticBackup: ServiceWorkerEvent<undefined, "user_unauthenticated" | undefined>
}

export async function sendToServiceWorker<
	Name extends keyof CustomEvents,
	Request extends CustomEvents[Name]["request"],
	Response extends CustomEvents[Name]["response"]
>(event: Name, request: NonNullable<Request>): Promise<Response>;

export async function sendToServiceWorker<
	Name extends keyof CustomEvents,
	Request extends CustomEvents[Name]["request"],
	Response extends CustomEvents[Name]["response"]
>(event: Name, request?: NonNullable<Request>): Promise<Response>;

export async function sendToServiceWorker<
	Name extends keyof CustomEvents,
	Request extends CustomEvents[Name]["request"],
	Response extends CustomEvents[Name]["response"]
>(event: Name, request?: NonNullable<Request>): Promise<Response> {
	return await chrome.runtime.sendMessage({ name: event, data: request });
}

type DiscriminatedCustomEvents = {
	[K in keyof CustomEvents]: {
		name: K,
		data: CustomEvents[K]["request"],
		reply: (response: CustomEvents[K]["response"]) => void
	}
}[keyof CustomEvents];

type Callback = (sender: chrome.runtime.MessageSender, event: DiscriminatedCustomEvents) => void;

// const myUnion = zod.discriminatedUnion("status", [
// 	zod.object({ status: zod.literal("success"), data: zod.string() }),
// 	zod.object({ status: zod.literal("failed"), error: zod.instanceof(Error) }),
// ]);

// Basic runtime validation
// It should be okay, since we don't accept foreign requests
const Event = zod.object({
	name: zod.string(),
	data: zod.any().optional()
}).strict();

export function listenForServiceWorkerEvents(callback: Callback) {
	return chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const parseResult = Event.safeParse(message);
		if (parseResult.success) {
			const { name, data } = parseResult.data;

			callback(sender, {
				name: name as any,
				data,
				reply: sendResponse
			});
		} else {
			console.log(parseResult.success, parseResult.error);
		}
	});
}

export async function isChrome() {
	try {
		await chrome.identity.getAuthToken({ interactive: false });
		return true;
	} catch (msg) {
		// Error: Function unsupported.
		return false;
	}
}

// export function getBrowserType() {
// 	// @ts-ignore
// 	const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;

// 	// @ts-ignore
// 	const isFirefox = typeof InstallTrigger !== "undefined";

// 	// @ts-ignore
// 	// eslint-disable
// 	const isIE = false || !!document.documentMode;

// 	// @ts-ignore
// 	const isEdge = !isIE && !!window.StyleMedia;

// 	// The other browsers are trying to be more like Chrome, so picking
// 	// capabilities which are in Chrome, but not in others is a moving
// 	// target. Just default to Chrome if none of the others is detected.
// 	const isChrome = !isOpera && !isFirefox && !isIE && !isEdge;

// 	if (isChrome) {
// 		return "chrome";
// 	} else if (isOpera) {
// 		return "opera";
// 	} else if (isFirefox) {
// 		return "firefox";
// 	} else if (isEdge) {
// 		return "edge";
// 	} else if (isIE) {
// 		return "internet_explorer";
// 	} else {
// 		return "unknown";
// 	}
// }

// export function print(...args: any[]) {
// 	if (DEV) {
// 		console.log(...args);
// 	}
// }

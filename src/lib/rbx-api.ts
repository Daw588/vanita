async function getCsrfToken() {
	const res = await fetch("https://avatar.roblox.com/v1/avatar/thumbnail-customization", {
		method: "POST",
		headers: new Headers({
			"Content-Type": "application/json"
		}),
		credentials: "include"
	});

	return res.headers.get("x-csrf-token");
}

export async function post(url: RequestInfo | URL, body?: any) {
	return fetch(url, {
		method: "POST",
		headers: new Headers({
			"Content-Type": "application/json",
			"x-csrf-token": await getCsrfToken()
		}),
		credentials: "include",
		body: (body) ? JSON.stringify(body) : null
	});
}

export async function get(url: RequestInfo | URL) {
	return fetch(url, {
		method: "GET",
		headers: new Headers({
			"Content-Type": "application/json",
			"x-csrf-token": await getCsrfToken()
		}),
		credentials: "include"
	});
}
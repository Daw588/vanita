import { xCsrfToken } from "../data/x-csrf-token";

export async function post(url: RequestInfo | URL, body?: any) {
	const response = await fetch(url, {
		method: "POST",
		headers: new Headers({
			"Content-Type": "application/json",
			"x-csrf-token": xCsrfToken.data
		}),
		credentials: "include",
		body: (body) ? JSON.stringify(body) : null
	});

	// The token is no longer valid
	if (response.status === 403) {
		// Refresh the token
		xCsrfToken.data = response.headers.get("x-csrf-token");

		// Attempt to make request again
		const anotherResponse = await fetch(url, {
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				"x-csrf-token": xCsrfToken.data
			}),
			credentials: "include"
		});

		return anotherResponse;
	}

	return response;
}

export async function get(url: RequestInfo | URL) {
	const response = await fetch(url, {
		method: "GET",
		headers: new Headers({
			"Content-Type": "application/json",
			"x-csrf-token": xCsrfToken.data
		}),
		credentials: "include"
	});

	// The token is no longer valid
	if (response.status === 403) {
		// Refresh the token
		xCsrfToken.data = response.headers.get("x-csrf-token");

		// Attempt to make request again
		const anotherResponse = await fetch(url, {
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				"x-csrf-token": xCsrfToken.data
			}),
			credentials: "include"
		});

		return anotherResponse;
	}

	return response;
}
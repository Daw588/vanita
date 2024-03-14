// refresh token should last for more than 6 months when used
// access token will last for about an hour

import to from "./to";

// save expiration timestamp from the expires in
// then before returning the token, check if it is expired by comparing the timestamp and the current time
// if it goes past the time, refresh the token, and save that access token

// also create abstraction to switch between implementation
// Google Chrome users will use chrome.identity.getAuthToken
// while other browser users will use this implementation

export async function revokeToken(token: string) {
	const params = new URLSearchParams({
		token
	});

	const res = await fetch("https://accounts.google.com/o/oauth2/revoke?" + params.toString());
	if (!res.ok) {
		return false;
	}

	return true;
}

export async function refreshToken(refreshToken: string) {
	const response = await fetch("https://vanita-s1.glitch.me/oauth2/refresh", {
		method: "POST",
		body: JSON.stringify({
			refresh_token: refreshToken
		})
	});

	if (!response.ok) {
		return;
	}

	const data = (await response.json()) as {
		access_token: string,
		expires_in: number,
		scope: string,
		token_type: "Bearer"
	};

	return {
		accessToken: data.access_token,
		expiresIn: data.expires_in
	};
}

export async function requestConsent() {
	const [err, authUrl] = await to(chrome.identity.launchWebAuthFlow({
		url: "https://vanita-s1.glitch.me/oauth2/initiate",
		interactive: true
	}));

	if (err) {
		return; // User did not consent
	}

	if (authUrl) {
		const url = new URL(authUrl);

		const resultParams = new URLSearchParams(url.searchParams);
		const code = resultParams.get("code");
		const scope = resultParams.get("scope");

		if (code && scope) {
			console.log({ code, scope });

			const response = await fetch("https://vanita-s1.glitch.me/oauth2/token", {
				method: "POST",
				body: JSON.stringify({
					code,
					scope
				})
			});

			const data = (await response.json()) as {
				access_token: string,
				expires_in: number,
				refresh_token: string,
				scope: string,
				token_type: string
			};

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresIn: data.expires_in
			};
		}
	}
}

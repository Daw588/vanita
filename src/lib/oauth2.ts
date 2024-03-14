import perstore from "./perstore";
import * as googleOAuth2 from "./core/google-oauth2";
import * as browser from "./core/browser";
import to from "./core/to";

export class GoogleOAuth2 {
	private static async getTokenForNonChromeBrowser({ interactive }: { interactive: boolean }) {
		// Non Chrome browsers do not implement Google OAuth2, so we have to do it ourselves
		const oauth2 = await perstore.oauth2.read();
		if (!oauth2.success) {
			return;
		}

		if (!oauth2.data.google) {
			// Probably the first time, get the user signed in
			if (interactive) {
				const consentResult = await googleOAuth2.requestConsent();
				if (consentResult) {
					await perstore.oauth2.write({ ...oauth2.data, google: {
						refreshToken: consentResult.refreshToken,
						accessToken: consentResult.accessToken,
						accessExpiry: Date.now() + consentResult.expiresIn
					}});
					return consentResult.accessToken;
				}
			}
			return;
		}

		const tokenExpired = Date.now() >= oauth2.data.google.accessExpiry;
		if (tokenExpired) {
			// Token is expired, refresh the token!

			const refreshResult = await googleOAuth2.refreshToken(oauth2.data.google.refreshToken);
			if (refreshResult) {
				// Update access token stuff
				await perstore.oauth2.write({...oauth2.data, google: {
					...oauth2.data.google,
					accessToken: refreshResult.accessToken,
					accessExpiry: Date.now() + refreshResult.expiresIn
				}});

				return refreshResult.accessToken;
			} else {
				// If we failed to refresh, try to prompt the user to auth again
				// it might be that refresh token expired, or was revoked
				if (interactive) {
					const consentResult = await googleOAuth2.requestConsent();
					if (consentResult) {
						await perstore.oauth2.write({...oauth2.data, google: {
							refreshToken: consentResult.refreshToken,
							accessToken: consentResult.accessToken,
							accessExpiry: Date.now() + consentResult.expiresIn
						}});
						return consentResult.accessToken;
					}
				}
			}
			return;
		}

		// Token should be valid
		return oauth2.data.google.accessToken;
	}

	private static async getTokenForChromeBrowser({ interactive }: { interactive: boolean }) {
		const [err, auth] = await to(chrome.identity.getAuthToken({ interactive }));
		if (err) {
			return;
		}
		return auth.token;
	}

	public static async getToken({ interactive }: { interactive: boolean }) {
		if (await browser.isChrome()) {
			return GoogleOAuth2.getTokenForChromeBrowser({ interactive });
		} else {
			return GoogleOAuth2.getTokenForNonChromeBrowser({ interactive });
		}
	}

	public static async revokeAccess() {
		const token = await GoogleOAuth2.getToken({ interactive: false });
		if (!token) {
			return false;
		}

		const revokeSuccess = await googleOAuth2.revokeToken(token);
		if (!revokeSuccess) {
			return false;
		}

		if (await browser.isChrome()) {
			await chrome.identity.removeCachedAuthToken({ token });
		}

		const oauth2 = await perstore.oauth2.read();
		if (!oauth2.success) {
			return false;
		}

		// Delete Google OAuth2 data
		const data = oauth2.data;
		if (data.google) {
			delete data.google;
		}

		// Save changes
		const success = await perstore.oauth2.write(data);
		if (!success) {
			return false;
		}

		return true;
	}
}
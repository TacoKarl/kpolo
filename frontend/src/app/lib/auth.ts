import { getRefreshUrl } from "./apiUrls";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function clearAccessToken() {
    accessToken = null;
}

export async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(getRefreshUrl(), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                clearAccessToken();
                return null;
            }

            const data = await res.json();
            const token = data?.accessToken ?? null;
            if (token) {
                setAccessToken(token);
                return token;
            }

            clearAccessToken();
            return null;
        } catch {
            clearAccessToken();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

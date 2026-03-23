import { getRefreshUrl } from "./apiUrls";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken() {
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
    listeners.forEach((listener) => listener(accessToken));
}

export function clearAccessToken() {
    accessToken = null;
    listeners.forEach((listener) => listener(accessToken));
}

export function subscribeToAccessToken(listener: (token: string | null) => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
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

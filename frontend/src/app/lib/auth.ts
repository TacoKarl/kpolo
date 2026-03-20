import { jwtDecode } from "jwt-decode";
import { getRefreshUrl } from "./apiUrls";
import { MyJwtPayload } from "../components/interfaces/MyJwtPayload";

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


export async function getUserRoles(): Promise<string[]> {
     let token = getAccessToken();
        if (!token) {
            token = await refreshAccessToken();
        }    
         
        if (!token) {
            return ["Guest"];
        }
    
        try {
            const decoded = jwtDecode<MyJwtPayload>(token);
            if (decoded.exp && decoded.exp * 1000 < Date.now()) { //Check if token is expired
                clearAccessToken();
                return ["Guest"];
            }

            const roles = decoded.userRoles || ["Guest"];

            return roles;

        } catch (err) {
            console.error("Kunne ikke dekode JWT:", err);
            return ["Guest"];
        }
};


export async function checkIfUserHasRoles(roles: string[]): Promise<boolean> {
    const userRoles = await getUserRoles();
    return userRoles.some(role => roles.includes(role));
};
  
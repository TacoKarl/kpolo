import { jwtDecode } from "jwt-decode";
import { getRefreshUrl } from "./apiUrls";
import { MyJwtPayload } from "../components/interfaces/MyJwtPayload";
import { cookies } from "next/headers";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
//let userRoles: string[] = ["Guest"];



export async function getUserRoles(): Promise<string[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("kpolo_refresh_token")?.value;

    if (!token) {
        return ["Guest"];
    }

    try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        return decoded.userRoles || ["Guest"];
    } catch {
        return ["Guest"];
    }
}

/*
function setUserRoles(roles: string[]) {
    userRoles = roles;
}

function clearUserRoles() {
    userRoles = ["Guest"];
}
*/


export async function checkIfUserHasRoles(roles: string[]): Promise<boolean> {
    const userRoles = await getUserRoles();
    return userRoles.some(role => roles.includes(role));
};
  

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

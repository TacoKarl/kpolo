"use client"
import { jwtDecode } from "jwt-decode";
import { getRefreshUrl } from "./apiUrls";
import { MyJwtPayload } from "../components/interfaces/MyJwtPayload";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let userRoles: string[] = ["Guest"];



export function getUserRoles(): string[] {
    return userRoles;
}

function setUserRoles(roles: string[]) {
    userRoles = roles;
}

function clearUserRoles() {
    userRoles = ["Guest"];
}


export function checkIfUserHasRoles(roles: string[]): boolean {
    return userRoles.some(role => roles.includes(role));
};
  

export function getAccessToken() {
    return accessToken;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (!token){
        clearUserRoles();
    } else {
        const decoded = jwtDecode<MyJwtPayload>(token);
        setUserRoles( decoded.userRoles || ["Guest"] )
    }
    
}

export function clearAccessToken() {
    accessToken = null;
    clearUserRoles();
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

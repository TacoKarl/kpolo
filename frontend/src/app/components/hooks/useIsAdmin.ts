import { useMemo } from "react";
import { useUser } from "@/app/context/UserContext";
import { jwtDecode } from "jwt-decode";
import {MyJwtPayload} from "@/app/components/interfaces/MyJwtPayload";
import { getAccessToken } from "@/app/lib/auth";

export function useIsAdmin() {
    const { authReady } = useUser();

    return useMemo(() => {
        if (!authReady) return false;

        const token = getAccessToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<MyJwtPayload>(token);
            const roles = decoded.userRoles || [];
            const adminRoles = ["System Admin", "Club Admin"];
            return roles.some(role => adminRoles.includes(role));
        } catch (err) {
            console.error("Kunne ikke dekode JWT:", err);
            return false;
        }
    }, [authReady]);
}

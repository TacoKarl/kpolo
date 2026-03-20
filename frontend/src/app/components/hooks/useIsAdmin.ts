import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { jwtDecode } from "jwt-decode";
import {MyJwtPayload} from "@/app/components/interfaces/MyJwtPayload";
import { getAccessToken, refreshAccessToken } from "@/app/lib/auth";

export function useIsAdmin() {
    const { user } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);

    // Tjek om user har admin-rolle
    useEffect(() => {
        let active = true;

        const checkAdmin = async () => {
            let token = getAccessToken();
            if (!token) {
                token = await refreshAccessToken();
            }

            if (!active) return;

            if (!token) {
                setIsAdmin(false);
                return;
            }

            try {
                const decoded = jwtDecode<MyJwtPayload>(token);
                const roles = decoded.userRoles || [];
                const adminRoles = ["System Admin", "Club Admin"];
                setIsAdmin(roles.some(role => adminRoles.includes(role)));
            } catch (err) {
                console.error("Kunne ikke dekode JWT:", err);
                setIsAdmin(false);
            }
        };

        checkAdmin();

        return () => {
            active = false;
        };
    }, [user]);

    return isAdmin;
}

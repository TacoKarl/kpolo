import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { jwtDecode } from "jwt-decode";
import {MyJwtPayload} from "@/app/components/interfaces/MyJwtPayload";

export function useIsAdmin() {
    const { user, setUser } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);

    // Læs user fra localStorage ved første load
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, [setUser]);

    // Tjek om user har admin-rolle
    useEffect(() => {
        const token = user?.token || localStorage.getItem("token");
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
    }, [user]);

    return isAdmin;
}
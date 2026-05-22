// Navbar.tsx (SERVER COMPONENT)
import NavbarClient from "./navbarClient";
import { type MeUser } from "@/app/lib/getMe";
import { canAccessAdmin } from "@/app/lib/authorization";

export default function Navbar({ user }: { user: MeUser | null }) {
    const canSeeAdmin = canAccessAdmin(user);

    return (
        <NavbarClient
            user={user}
            canSeeAdmin={canSeeAdmin}
        />
    );
}
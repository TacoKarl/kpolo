import type { Me } from "@/generated/graphql";
import NavbarClient from "./navbarClient";
import { canAccessAdmin } from "@/app/lib/authorization";

export default function Navbar({ user }: { user: Me | null }) {
    const canSeeAdmin = canAccessAdmin(user);

    return (
        <NavbarClient
            user={user}
            canSeeAdmin={canSeeAdmin}
        />
    );
}

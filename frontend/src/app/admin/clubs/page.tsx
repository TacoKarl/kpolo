import AdminClubsPage from "./AdminClubsPage";
import { getMe } from "@/app/lib/getMe";
import { UserRoles } from "@/app/lib/UserRoles";

export default async function Page() {
    const initialUser = await getMe();

    // System admin or other roles: full view
    const isSystemAdmin = initialUser?.roles?.includes(UserRoles.SystemAdmin) ?? false;
    if (isSystemAdmin) return <AdminClubsPage initialUser={initialUser} />;

    const isClubAdmin = initialUser?.roles?.includes(UserRoles.ClubAdmin) ?? false;

    if (isClubAdmin) {
        return (
            // pass clubId from initialUser (may be undefined)
            <AdminClubsPage initialUser={initialUser} clubId={initialUser?.clubId} showCreateCard={false} />
        );
    }


}


import AdminTeamsPage from "./AdminTeamsPage";
import { notFound } from "next/navigation";
import { getMe } from "@/app/lib/getMe";
import { UserRoles } from "@/app/lib/UserRoles";

export default async function Page() {
    const initialUser = await getMe();

    const isSystemAdmin = initialUser?.roles?.includes(UserRoles.SystemAdmin) ?? false;
    if (isSystemAdmin) return <AdminTeamsPage initialUser={initialUser} />;

    const isClubAdmin = initialUser?.roles?.includes(UserRoles.ClubAdmin) ?? false;
    if (isClubAdmin) {
        if (!initialUser?.clubId) notFound();

        return <AdminTeamsPage initialUser={initialUser} clubId={initialUser.clubId} />;
    }

    notFound();
}


import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getMe } from "@/app/lib/getMe";
import { canAccessTournamentAdmin } from "@/app/lib/authorization";

export default async function TournamentPlanAdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const user = await getMe();

    if (!user) {
        redirect("/login");
    }

    if (!canAccessTournamentAdmin(user)) {
        notFound();
    }

    return <>{children}</>;
}


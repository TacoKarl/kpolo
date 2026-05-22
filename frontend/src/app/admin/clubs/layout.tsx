import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getMe } from "@/app/lib/getMe";
import { canAccessClubAdmin } from "@/app/lib/authorization";

export default async function ClubsAdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const user = await getMe();

    if (!user) {
        redirect("/login");
    }

    if (!canAccessClubAdmin(user)) {
        notFound();
    }

    return <>{children}</>;
}


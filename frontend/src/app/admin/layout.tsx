import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getMe } from "@/app/lib/getMe";
import { canAccessAdmin } from "@/app/lib/authorization";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const user = await getMe();

    if (!user) {
        redirect("/login");
    }

    if (!canAccessAdmin(user)) {
        notFound();
    }

    return <>{children}</>;
}

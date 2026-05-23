import { cookies } from "next/headers";
import type { Me } from "@/generated/graphql";
import { authenticateWithCookieHeader, buildCookieHeaderFromCookieStore } from "@/lib/auth";

export async function getMe(): Promise<Me | null> {
    const cookieStore = await cookies();

    // Build cookie header using shared helper
    const cookieHeader = buildCookieHeaderFromCookieStore(cookieStore);
    console.log("[getMe] cookieHeader:", cookieHeader);
    console.log("[getMe] backendUrl:", process.env.NEXT_PUBLIC_BACKEND_URL);

    const { user } = await authenticateWithCookieHeader(cookieHeader);
    return user;
}



import { cookies } from "next/headers";

export type MeUser = {
    name: string;
    clubId: number | null;
    clubName: string | null;
    roles: string[];
};

export async function getMe(): Promise<MeUser | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    //const accessToken = cookieStore.get("kpolo_access_token")?.value;
    //const refreshToken = cookieStore.get("kpolo_refresh_token")?.value;
    //const deviceId = cookieStore.get("kpolo_device_id")?.value;

    if (!cookieHeader || !cookieHeader.includes("kpolo_access_token")) return null;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader
            },
            body: JSON.stringify({
                query: `
        query GetMe {
          me {
            name
            clubId
            clubName
            roles
          }
        }
      `,
            }),
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`[getMe] Backend responded with status: ${res.status}`);
            return null;
        }

        const json = await res.json();
        if (json?.errors?.length) {
            const isUnauthorized = json.errors.some((err: any) =>
                err.extensions?.code === 'UNAUTHENTICATED' ||
                err.message.toLowerCase().includes('not authenticated')
            );

            if (!isUnauthorized) {
                // This is a real bug/error in the query or DB
                console.error("[getMe] GraphQL System Error:", json.errors);
            }
            return null;
        }

        return json?.data?.me ?? null;
    }
    catch (error) {
        console.error("[getMe] Network connection failed:", error);
        return null;
    }
}

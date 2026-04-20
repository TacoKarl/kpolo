import { cookies } from "next/headers";

export type MeUser = {
    name: string;
    clubId: number | null;
    clubName: string | null;
    roles: string[];
};

export async function getMe(): Promise<MeUser | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("kpolo_access_token")?.value;
    const refreshToken = cookieStore.get("kpolo_refresh_token")?.value;

    if (!accessToken && !refreshToken) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
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

    if (!res.ok) return null;

    const json = await res.json();
    if (json?.errors?.length) return null;

    return json?.data?.me ?? null;
}

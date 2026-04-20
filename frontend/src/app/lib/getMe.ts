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

    //SILENT EXIT: No cookies means not logged in.
    if (!cookieHeader || !cookieHeader.includes("kpolo_access_token")) {
        return null;
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader,
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

        //API IS DOWN: Log this because it's a system failure
        if (!res.ok) {
            console.error(`[getMe] Backend responded with status: ${res.status}`);
            return null;
        }

        const json = await res.json();

        // Real GRAPHQL ERRORS: Distinguish between "Unauthorized" and "Syntax Error"
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

    } catch (error) {
        // 4. NETWORK ERROR: Server is unreachable
        console.error("[getMe] Network connection failed:", error);
        return null;
    }
}
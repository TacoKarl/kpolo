import { cookies } from "next/headers";

export type MeUser = {
    name: string;
    clubId: number | null;
    clubName: string | null;
    roles: string[];
};

export async function getMe(): Promise<MeUser | null> {
    const cookieStore = await cookies();

  // Byg cookie-headeren manuelt
  const cookieHeader = cookieStore
      .getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ");

    //const cookieHeader = cookieStore.toString();
    //const accessToken = cookieStore.get("kpolo_access_token")?.value;
    //const refreshToken = cookieStore.get("kpolo_refresh_token")?.value;
    //const deviceId = cookieStore.get("kpolo_device_id")?.value;

    if (!cookieHeader.includes("kpolo_access_token")) return null;

    const result = await fetchMe(cookieHeader);

    if (result === "UNAUTHENTICATED") {
      const newCookieHeader = await refreshTokens(cookieHeader);
      if (!newCookieHeader) return null;
      return await fetchMe(newCookieHeader) as MeUser | null;
    }

    return result;
}


async function fetchMe(cookieHeader: string): Promise<MeUser | "UNAUTHENTICATED" | null> {
  try {


    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "Cookie": cookieHeader},
      body: JSON.stringify({query: `query GetMe { me { name clubId clubName roles } }`}),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();

    const isUnauth = json.errors?.some((e: any) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.message.toLowerCase().includes("not authenticated")
    );
    if (isUnauth) return "UNAUTHENTICATED";
    if (json.errors?.length) return null;

    return json?.data?.me ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function refreshTokens(cookieHeader: string): Promise<string | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`, {
    method: "POST",
    headers: { "Cookie": cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const setCookie = res.headers.getSetCookie?.() ?? [];

  if (!setCookie.length) return null;

  const newCookies = setCookie.map(cookie => cookie.split(";")[0]).join("; ");

  const existing = cookieHeader
      .split("; ")
      .filter(cookie => !newCookies.includes(cookie.split("=")[0]))
      .join("; ");

  return [existing, newCookies].filter(Boolean).join("; ");
}

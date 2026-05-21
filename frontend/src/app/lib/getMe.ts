import { cookies } from "next/headers";

export type MeUser = {
  name: string;
  clubId: number | null;
  clubName: string | null;
  roles: string[];
};

/**
 * 1. ORIGINAL FUNCTION (Preserved)
 * Used by your admin layouts and other components safely without breaking types.
 */
export async function getMe(): Promise<MeUser | null> {
  const { user } = await getMeWithTelemetry();
  return user;
}

/**
 * 2. TELEMETRY WRAPPER FOR ROOT LAYOUT
 * Identical execution logic but captures execution footprints.
 */
export async function getMeWithTelemetry(): Promise<{ user: MeUser | null; logs: string[] }> {
  const serverLogs: string[] = [];
  const pushLog = (msg: string) => serverLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ");

    pushLog(`Backend Target Url: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    pushLog(`Cookies found by Next server: ${cookieHeader ? "YES" : "NO COOKIES ATTACHED"}`);

    if (cookieHeader) {
      pushLog(`Has Access Token: ${cookieHeader.includes("kpolo_access_token")} | Has Refresh Token: ${cookieHeader.includes("kpolo_refresh_token")}`);
    }

    if (!cookieHeader.includes("kpolo_access_token")) {
      pushLog("Aborted: kpolo_access_token is missing from incoming request context.");
      return { user: null, logs: serverLogs };
    }

    const result = await fetchMe(cookieHeader, pushLog);
    pushLog(`fetchMe initial layout status: ${typeof result === "string" ? result : result ? "USER_FOUND" : "NULL"}`);

    if (result === "UNAUTHENTICATED") {
      pushLog("Received UNAUTHENTICATED status. Triggering token rotation...");
      const newCookieHeader = await refreshTokens(cookieHeader, pushLog);

      if (!newCookieHeader) {
        pushLog("Rotation failure: backend /refresh did not issue updated cookie headers.");
        return { user: null, logs: serverLogs };
      }

      pushLog("Rotation success. Resubmitting fetchMe query with updated tokens...");
      const retryResult = await fetchMe(newCookieHeader, pushLog);
      pushLog(`fetchMe retry layout status: ${retryResult && retryResult !== "UNAUTHENTICATED" ? "USER_FOUND" : "NULL"}`);

      return {
        user: retryResult === "UNAUTHENTICATED" ? null : retryResult,
        logs: serverLogs
      };
    }

    return { user: result, logs: serverLogs };
  } catch (err: any) {
    pushLog(`Catastrophic top-level error during execution: ${err?.message || err}`);
    return { user: null, logs: serverLogs };
  }
}

async function fetchMe(cookieHeader: string, pushLog: (msg: string) => void): Promise<MeUser | "UNAUTHENTICATED" | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ query: `query GetMe { me { name clubId clubName roles } }` }),
      cache: "no-store",
    });

    pushLog(`fetchMe HTTP response: ${res.status} ${res.statusText}`);

    const contentType = res.headers.get("content-type") || "";
    pushLog(`fetchMe Content-Type header: ${contentType}`);

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unreadable raw body output.");
      pushLog(`fetchMe Error Snippet (First 150 chars): ${errText.slice(0, 150)}`);
      return null;
    }

    const rawText = await res.text();
    pushLog(`Raw response payload preview: ${rawText.slice(0, 200)}`);

    let json;
    try {
      json = JSON.parse(rawText);
    } catch {
      pushLog("Critical Error: Response layout stream is not valid JSON.");
      return null;
    }

    const isUnauth = json.errors?.some((e: any) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.message.toLowerCase().includes("not authenticated")
    );

    if (isUnauth) return "UNAUTHENTICATED";
    if (json.errors?.length) {
      pushLog(`GraphQL execution errors returned: ${JSON.stringify(json.errors)}`);
      return null;
    }

    return json?.data?.me ?? null;
  } catch (error: any) {
    pushLog(`Runtime boundary exception inside fetchMe: ${error?.message || error}`);
    return null;
  }
}

async function refreshTokens(cookieHeader: string, pushLog: (msg: string) => void): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`, {
      method: "POST",
      headers: { "Cookie": cookieHeader },
      cache: "no-store",
    });

    pushLog(`/refresh network status: ${res.status}`);
    if (!res.ok) return null;

    const setCookie = res.headers.getSetCookie?.() ?? [];
    pushLog(`Set-Cookie array collected from backend: ${JSON.stringify(setCookie)}`);

    if (!setCookie.length) return null;

    const newCookies = setCookie.map(cookie => cookie.split(";")[0]).join("; ");
    const existing = cookieHeader
        .split("; ")
        .filter(cookie => !newCookies.includes(cookie.split("=")[0]))
        .join("; ");

    return [existing, newCookies].filter(Boolean).join("; ");
  } catch (error: any) {
    pushLog(`Runtime boundary exception inside refreshTokens: ${error?.message || error}`);
    return null;
  }
}
import { cookies } from "next/headers";

export type MeUser = {
  name: string;
  clubId: number | null;
  clubName: string | null;
  roles: string[];
};

// Create a unified return shape that includes telemetry
export type GetMeResponse = {
  user: MeUser | null;
  logs: string[];
};

export async function getMe(): Promise<GetMeResponse> {
  const serverLogs: string[] = [];
  const pushLog = (msg: string) => serverLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ");

    pushLog(`Backend URL target: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    pushLog(`Cookies picked up by Next.js Server: ${cookieHeader ? "YES (Found tokens)" : "NO COOKIES FOUND"}`);

    if (cookieHeader) {
      const hasAccessToken = cookieHeader.includes("kpolo_access_token");
      const hasRefreshToken = cookieHeader.includes("kpolo_refresh_token");
      pushLog(`Has Access Token: ${hasAccessToken} | Has Refresh Token: ${hasRefreshToken}`);
    }

    if (!cookieHeader.includes("kpolo_access_token")) {
      pushLog("Aborting fetch: kpolo_access_token missing in cookie header string.");
      return { user: null, logs: serverLogs };
    }

    // Pass down the log accumulator down to the fetcher functions
    const result = await fetchMe(cookieHeader, pushLog);
    pushLog(`fetchMe initial attempt outcome: ${JSON.stringify(result)}`);

    if (result === "UNAUTHENTICATED") {
      pushLog("Token expired. Attempting token rotation via /refresh...");
      const newCookieHeader = await refreshTokens(cookieHeader, pushLog);

      if (!newCookieHeader) {
        pushLog("Refresh failed: /refresh endpoint did not yield cookies.");
        return { user: null, logs: serverLogs };
      }

      pushLog("Refresh succeeded. Retrying fetchMe with new credentials...");
      const retryResult = await fetchMe(newCookieHeader, pushLog);
      pushLog(`fetchMe retry attempt outcome: ${JSON.stringify(retryResult)}`);

      return {
        user: retryResult === "UNAUTHENTICATED" ? null : retryResult,
        logs: serverLogs
      };
    }

    return { user: result, logs: serverLogs };
  } catch (err: any) {
    pushLog(`Top level catastrophic error: ${err?.message || err}`);
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

    pushLog(`fetchMe HTTP Status Response: ${res.status} ${res.statusText}`);

    // Let's inspect the content type to check if Cloudflare returned a webpage instead of JSON
    const contentType = res.headers.get("content-type") || "";
    pushLog(`fetchMe Response Content-Type: ${contentType}`);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "Unreadable raw body");
      pushLog(`fetchMe bad response body snippet: ${errorBody.slice(0, 150)}`);
      return null;
    }

    const textResponse = await res.text();
    pushLog(`Raw text payload received (first 200 chars): ${textResponse.slice(0, 200)}`);

    let json;
    try {
      json = JSON.parse(textResponse);
    } catch (parseError) {
      pushLog(`JSON parsing completely failed on response text.`);
      return null;
    }

    const isUnauth = json.errors?.some((e: any) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.message.toLowerCase().includes("not authenticated")
    );

    if (isUnauth) return "UNAUTHENTICATED";
    if (json.errors?.length) {
      pushLog(`GraphQL Error Array: ${JSON.stringify(json.errors)}`);
      return null;
    }

    return json?.data?.me ?? null;
  } catch (error: any) {
    pushLog(`Network/Runtime error caught in fetchMe: ${error?.message || error}`);
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

    pushLog(`/refresh HTTP Status Response: ${res.status}`);
    if (!res.ok) return null;

    const setCookie = res.headers.getSetCookie?.() ?? [];
    pushLog(`Set-Cookie headers pulled from backend refresh: ${JSON.stringify(setCookie)}`);

    if (!setCookie.length) return null;

    const newCookies = setCookie.map(cookie => cookie.split(";")[0]).join("; ");
    const existing = cookieHeader
        .split("; ")
        .filter(cookie => !newCookies.includes(cookie.split("=")[0]))
        .join("; ");

    return [existing, newCookies].filter(Boolean).join("; ");
  } catch (error: any) {
    pushLog(`Error during token rotation fetch: ${error?.message || error}`);
    return null;
  }
}
import type { Me } from "@/generated/graphql";
import type { NextRequest } from 'next/server';

type GraphQLErrorLike = {
    extensions?: {
        code?: string;
    };
    message?: string;
};

/**
 * Fetches the current user from the GraphQL API
 */
export async function fetchMe(cookieHeader: string): Promise<Me | 'UNAUTHENTICATED' | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookieHeader,
            },
            body: JSON.stringify({ query: 'query GetMe { me { name clubId clubName roles } }' }),
            cache: 'no-store',
        });

        if (!response.ok) return null;

        const json = await response.json();
        const isUnauthenticated = json.errors?.some((error: GraphQLErrorLike) =>
            error.extensions?.code === 'UNAUTHENTICATED' ||
            String(error.message ?? '').toLowerCase().includes('not logged in')
        );

        if (isUnauthenticated) return 'UNAUTHENTICATED';
        if (json.errors?.length) return null;

        return json?.data?.me ?? null;
    } catch (error) {
        console.error('Auth lookup failed:', error);
        return null;
    }
}

/**
 * Refreshes the authentication tokens
 */
export async function refreshTokens(cookieHeader: string): Promise<string[] | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`, {
            method: 'POST',
            headers: {
                Cookie: cookieHeader,
            },
            cache: 'no-store',
        });

        if (!response.ok) return null;

        return response.headers.getSetCookie?.() ?? [];
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}

/**
 * Merges updated cookies from refresh response with existing cookies
 */
export function mergeSetCookies(cookieHeader: string, setCookies: string[]): string {
    const cookieMap = new Map(
        cookieHeader
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
                const [name, ...rest] = cookie.split('=');
                return [name, rest.join('=')];
            })
    );

    setCookies.forEach((cookie) => {
        const [name, ...rest] = cookie.split(';')[0].split('=');
        cookieMap.set(name, rest.join('='));
    });

    return Array.from(cookieMap.entries())
        .filter(([name, value]) => name && value !== undefined)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
}

/**
 * Build a Cookie header string from a NextRequest (used in middleware).
 */
export function buildCookieHeaderFromRequest(request: NextRequest): string {
    return request.cookies.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * Build a Cookie header string from a CookieStore (returned by next/headers cookies()).
 * We accept the minimal shape used in our code so this is easy to call from server components.
 */
export function buildCookieHeaderFromCookieStore(cookieStore: { getAll: () => Array<{ name: string; value: string }> }): string {
    return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * High-level authenticate helper that attempts to fetch the user and
 * refresh tokens if needed. Returns any Set-Cookie headers that should
 * be appended to the outgoing response (middleware) and the possibly-updated
 * cookie header that was used for the successful lookup.
 */
export async function authenticateWithCookieHeader(cookieHeader: string): Promise<{
    user: Me | null;
    setCookies: string[];
    cookieHeaderAfter?: string;
}> {
    const hasAccess = cookieHeader.includes('kpolo_access_token');
    const hasRefresh = cookieHeader.includes('kpolo_refresh_token');

    if (!hasAccess && !hasRefresh) {
        return { user: null, setCookies: [] };
    }

    let setCookies: string[] = [];
    let currentHeader = cookieHeader;

    let user = await fetchMe(currentHeader);

    if (user === 'UNAUTHENTICATED' && hasRefresh) {
        const refreshed = await refreshTokens(currentHeader);
        if (!refreshed) {
            return { user: null, setCookies: [] };
        }

        setCookies = refreshed;
        currentHeader = mergeSetCookies(currentHeader, refreshed);
        user = await fetchMe(currentHeader);
    }

    if (user === 'UNAUTHENTICATED') return { user: null, setCookies };

    return { user: user ?? null, setCookies, cookieHeaderAfter: currentHeader };
}


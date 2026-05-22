import { NextResponse, type NextRequest } from 'next/server';
import type { MeUser } from '@/app/lib/getMe';
import { canAccessAdminPath, getAdminRedirectPath } from '@/app/lib/authorization';

type GraphQLErrorLike = {
    extensions?: {
        code?: string;
    };
    message?: string;
};

function serializeCookies(request: NextRequest): string {
    return request.cookies.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
}

function appendSetCookies(response: NextResponse, setCookies: string[]) {
    setCookies.forEach((cookie) => {
        response.headers.append('set-cookie', cookie);
    });
}

function mergeSetCookies(cookieHeader: string, setCookies: string[]): string {
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

async function fetchMe(cookieHeader: string): Promise<MeUser | 'UNAUTHENTICATED' | null> {
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
            String(error.message ?? '').toLowerCase().includes('not authenticated')
        );

        if (isUnauthenticated) return 'UNAUTHENTICATED';
        if (json.errors?.length) return null;

        return json?.data?.me ?? null;
    } catch (error) {
        console.error('Proxy auth lookup failed:', error);
        return null;
    }
}

async function refreshTokens(cookieHeader: string): Promise<string[] | null> {
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
        console.error('Proxy refresh failed:', error);
        return null;
    }
}

async function authenticate(request: NextRequest): Promise<{ user: MeUser | null; setCookies: string[] }> {
    const cookieHeader = serializeCookies(request);
    const accessToken = request.cookies.get('kpolo_access_token')?.value;
    const refreshToken = request.cookies.get('kpolo_refresh_token')?.value;

    if (!accessToken && !refreshToken) {
        return { user: null, setCookies: [] };
    }

    const setCookies: string[] = [];
    let currentCookieHeader = cookieHeader;
    let user = await fetchMe(currentCookieHeader);

    if (user === 'UNAUTHENTICATED' && refreshToken) {
        const refreshedCookies = await refreshTokens(currentCookieHeader);
        if (!refreshedCookies) {
            return { user: null, setCookies: [] };
        }

        setCookies.push(...refreshedCookies);
        currentCookieHeader = mergeSetCookies(currentCookieHeader, refreshedCookies);
        user = await fetchMe(currentCookieHeader);
    }

    if (user === 'UNAUTHENTICATED') {
        return { user: null, setCookies };
    }

    return { user: user ?? null, setCookies };
}

function redirectWithCookies(url: URL, setCookies: string[]) {
    const response = NextResponse.redirect(url);
    appendSetCookies(response, setCookies);
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute =
        pathname.startsWith('/logout') ||
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        pathname.startsWith('/profile');
    if (!isProtectedRoute) return NextResponse.next();

    const { user, setCookies } = await authenticate(request);

    if (!user) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        url.searchParams.set('reason', 'session_invalid');
        return redirectWithCookies(url, setCookies);
    }

    if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !canAccessAdminPath(user, pathname)) {
        const url = new URL(getAdminRedirectPath(user), request.url);
        return redirectWithCookies(url, setCookies);
    }

    const response = NextResponse.next();
    appendSetCookies(response, setCookies);
    return response;
}

export const config = {
    matcher: ['/logout', '/admin', '/admin/:path*', '/profile/:path*'],
};
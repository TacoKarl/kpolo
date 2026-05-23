import { NextResponse, type NextRequest } from 'next/server';
import { authenticateWithCookieHeader, buildCookieHeaderFromRequest } from '@/lib/auth';
import { canAccessAdminPath, getAdminRedirectPath } from '@/app/lib/authorization';

function appendSetCookies(response: NextResponse, setCookies: string[]) {
    setCookies.forEach((cookie) => {
        response.headers.append('set-cookie', cookie);
    });
}


function redirectWithCookies(url: URL, setCookies: string[]) {
    const response = NextResponse.redirect(url);
    appendSetCookies(response, setCookies);
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const cookieHeader = buildCookieHeaderFromRequest(request);
    const { user, setCookies } = await authenticateWithCookieHeader(cookieHeader);

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
    matcher: ['/logout', '/admin', '/admin/:path*', '/profile', '/profile/:path*'],
};
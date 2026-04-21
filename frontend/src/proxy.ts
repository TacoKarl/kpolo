import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    // 1. Path Filtering
    const isProtectedRoute = pathname.startsWith('/logout') || pathname.startsWith('/admin');
    if (!isProtectedRoute) return NextResponse.next();

    const cookies = request.cookies;
    const accessToken = cookies.get('kpolo_access_token')?.value;
    const refreshToken = cookies.get('kpolo_refresh_token')?.value;
    const deviceId = cookies.get('kpolo_device_id')?.value;

    // 2. Full Auth Failure
    if (!accessToken && !refreshToken) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(pathname));
        return NextResponse.redirect(url);
    }

    // 3. The "Silent Refresh" Logic
    if (!accessToken && refreshToken) {
        try {
            // In Next 16, ensure your internal fetch handles the 'Cookie' header explicitly
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the encrypted cookies directly to Express
                //    'Cookie': `refresh_token=${refreshToken}`,
                },
                credentials: 'include',
            });

            if (refreshRes.ok) {
                // Create the base response
                const response = NextResponse.next();

                // NEXT 16 TIP: Use the 'set-cookie' header from the Express response
                // We must propagate these so the BROWSER receives the new tokens.
                const newCookies = refreshRes.headers.getSetCookie(); // Modern Web API method

                if (newCookies.length > 0) {
                    newCookies.forEach(cookie => {
                        response.headers.append('set-cookie', cookie);
                    });
                }

                return response;
            }
        } catch (error) {
            console.error("Middleware Refresh Error:", error);
        }

        // Refresh failed or mismatch (Token Rotation violation caught by Express)
        return NextResponse.redirect(new URL('/login?reason=session_invalid', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/logout', '/admin/:path*', '/profile/:path*'],
};
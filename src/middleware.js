import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const path = request.nextUrl.pathname;

        if (path.startsWith('/dashboard/artisan') && payload.role !== 'artisan') {
            return NextResponse.redirect(new URL('/shop', request.url));
        }

        if (path.startsWith('/dashboard/buyer') && payload.role !== 'buyer') {
            return NextResponse.redirect(new URL('/dashboard/artisan', request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/dashboard/:path*'],
};

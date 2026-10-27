import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { userId?: string; email?: string; isSuperAdmin?: boolean; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Buffer or atob fallback
    const jsonStr = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    // Verify token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets, Next internals, and public endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/tenants') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Retrieve JWT session token from HTTP-only cookie or Authorization header
  const token =
    req.cookies.get('supervision_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  const session = token ? decodeJwtPayload(token) : null;

  // 1. Protected Route: Main Workspace Boards (/)
  if (pathname === '/') {
    if (!session || !session.userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', '/');
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      // Clean stale cookie if expired/invalid
      if (token && !session) {
        response.cookies.delete('supervision_token');
      }
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 2. Protected Route: SuperAdmin / Admin Control Plane (/admin)
  if (pathname.startsWith('/admin')) {
    if (!session || !session.userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', '/admin');
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Require SuperAdmin or Admin privileges
    const isAdmin =
      session.isSuperAdmin ||
      (session as any).roles?.includes('OWNER') ||
      (session as any).roles?.includes('ADMIN') ||
      session.email?.includes('superadmin') ||
      session.email?.includes('admin');

    if (!isAdmin) {
      // Forbidden: redirect regular tenant users back to boards
      const response = NextResponse.redirect(new URL('/', req.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 3. Login Page (/login)
  if (pathname === '/login') {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};

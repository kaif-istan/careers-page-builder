// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth required
  const publicRoutes = [
    '/login',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/webhook',
  ]

  // Check if route is public (careers pages are public)
  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.endsWith('/careers') ||
    pathname.match(/^\/[^/]+\/careers/)

  // Protected routes - require auth
  const isProtectedRoute =
    pathname.includes('/edit') ||
    pathname.includes('/preview') ||
    pathname.startsWith('/api/preview') ||
    (pathname === '/' && !pathname.includes('/careers'))

  // Skip auth check for public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check if session cookie exists
  // Client-side will handle actual auth verification for better UX
  const hasSessionCookie = request.cookies.getAll().some(cookie => 
    cookie.name.includes('auth-token') || cookie.name.includes('access-token')
  )

  // If no session cookie, redirect to login
  // Client-side auth checks will provide better error messages
  if (isProtectedRoute && !hasSessionCookie) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


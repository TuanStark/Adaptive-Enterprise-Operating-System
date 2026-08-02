import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add routes that don't require authentication here
const publicRoutes = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets, API routes, and Next.js internal paths
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.includes(".") // e.g. favicon.ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("aeos_access_token")?.value;
  const isPublicRoute = publicRoutes.includes(pathname);

  // 1. Redirect unauthenticated users to /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Optional: save the URL they were trying to access to redirect them back after login
    // loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from auth pages to the dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

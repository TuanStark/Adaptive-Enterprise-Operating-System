import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add routes that don't require authentication here
const publicRoutes = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  // Since we use localStorage for auth, middleware cannot protect routes.
  // Route protection is handled client-side by AuthProvider.
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

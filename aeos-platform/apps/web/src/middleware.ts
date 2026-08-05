import NextAuth from "next-auth";
import { authOptions } from "./lib/auth/options";
import { ROLE_ROUTE_MAP, type UserRole } from "./lib/auth/constants";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authOptions);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  if (session?.user) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
      if (nextUrl.pathname.startsWith(routePrefix)) {
        const userRole = session.user.role as UserRole;
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/", nextUrl));
        }
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
};

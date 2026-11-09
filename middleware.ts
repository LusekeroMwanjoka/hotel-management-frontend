import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route guard backed by the httpOnly `hms_token` cookie
 * set by the Laravel backend (proxied via rewrites so the cookie is
 * scoped to the frontend origin).
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("hms_token")?.value;
  const { pathname } = request.nextUrl;

  if (!token && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (token && pathname === "/login") {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

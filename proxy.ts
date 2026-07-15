import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("nebula_access_token")?.value;
  const refreshToken = request.cookies.get("nebula_refresh_token")?.value;

  const path = request.nextUrl.pathname;

  // Protected paths requiring active session
  const isProtectedRoute = path.startsWith("/settings");

  // Auth pages (unauthenticated users only)
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  // Redirect unauthenticated user trying to access protected paths
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user trying to access login/register to dashboard/home
  if (isAuthRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};

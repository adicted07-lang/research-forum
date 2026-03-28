import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authHandler = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/settings", "/dashboard", "/messages", "/forum/new", "/marketplace/new", "/hire/new", "/news/submit", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export function proxy(request: NextRequest, ...args: unknown[]) {
  const { pathname } = request.nextUrl;

  // Profile URL redirects
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }
  if (pathname.startsWith("/user/")) {
    const username = pathname.slice(6);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }
  if (pathname.startsWith("/company/")) {
    const username = pathname.slice(9);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }

  return (authHandler as Function)(request, ...args);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

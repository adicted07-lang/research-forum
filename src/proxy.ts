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
  return (authHandler as Function)(request, ...args);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/settings", "/dashboard", "/messages", "/forum/new", "/marketplace/new", "/talent-board/new", "/news/submit", "/admin"];
const authPaths = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // www to non-www redirect
  if (host.startsWith("www.")) {
    const url = new URL(`https://${host.replace("www.", "")}${pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }

  // Profile URL redirects
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }

  // Check auth cookie for protected routes
  const hasSession = request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !hasSession) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPaths.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

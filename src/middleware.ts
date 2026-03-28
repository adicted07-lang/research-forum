import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /@username → /profile/username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }

  // /user/username → /profile/username
  if (pathname.startsWith("/user/")) {
    const username = pathname.slice(6);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }

  // /company/username → /profile/username
  if (pathname.startsWith("/company/")) {
    const username = pathname.slice(9);
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/@:path*", "/user/:path*", "/company/:path*"],
};

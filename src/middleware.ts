import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All known top-level routes — these should NOT be treated as usernames
const RESERVED_ROUTES = new Set([
  "admin", "api", "forum", "hire", "marketplace", "news", "search",
  "settings", "dashboard", "messages", "leaderboard", "researchers",
  "advertise", "datasets", "grants", "office-hours", "projects",
  "preview", "reactivate", "login", "signup", "user", "company",
  "_next", "favicon.ico", "uploads",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /@username → /user/username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2); // remove "/@"
    const url = request.nextUrl.clone();
    url.pathname = `/user/${username}`;
    return NextResponse.redirect(url, 301);
  }

  // Handle /profile/username → /user/username
  if (pathname.startsWith("/profile/")) {
    const username = pathname.slice(9); // remove "/profile/"
    const url = request.nextUrl.clone();
    url.pathname = `/user/${username}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/@:path*", "/profile/:path*"],
};

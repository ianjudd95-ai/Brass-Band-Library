import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyIdToken } from "@/lib/firebaseToken";

// Keeps signed-out visitors away from every page and API route except login.
// Pages and route handlers also check the session themselves (defence in depth).
export async function proxy(request: NextRequest) {
  const user = await verifyIdToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (user) return NextResponse.next();

  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|api/session|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.TRACKER_PASSWORD ?? "anne";
const COOKIE = "tracker_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API og Next.js internals — lad passere (server components kalder disse selv)
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Offentlige sider — ingen auth krævet
  if (pathname === "/login" || pathname === "/landing" || pathname === "/demo" || pathname.startsWith("/risikotest")) return NextResponse.next();

  // Alt andet: kræver gyldig session cookie
  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie === PASSWORD) return NextResponse.next();

  // Uauthentiserede brugere ser landing page i stedet for tom login-form
  return NextResponse.redirect(new URL("/landing", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

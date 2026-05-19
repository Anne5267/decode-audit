import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.TRACKER_PASSWORD ?? "anne";
const COOKIE = "tracker_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dage

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== PASSWORD) {
    return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
  return res;
}

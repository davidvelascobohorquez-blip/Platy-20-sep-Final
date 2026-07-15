import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cw_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me"
);

const ROLE_HOME: Record<string, string> = {
  SECRETARIA: "/secretaria",
  VENDEDOR: "/vendedor",
  ADMIN: "/admin",
  CUADRILLA: "/cuadrilla"
};

const PROTECTED_PREFIXES: Record<string, string> = {
  "/secretaria": "SECRETARIA",
  "/vendedor": "VENDEDOR",
  "/admin": "ADMIN",
  "/cuadrilla": "CUADRILLA"
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(PROTECTED_PREFIXES).find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;
    if (role !== PROTECTED_PREFIXES[matchedPrefix] && role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] || "/login", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/secretaria/:path*", "/vendedor/:path*", "/admin/:path*", "/cuadrilla/:path*"]
};

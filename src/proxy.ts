import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const PUBLIC_PATHS = new Set(["/signup", "/login"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("nekohub_session")?.value;
  const session = await decrypt(token);
  const isAuthenticated = !!session && new Date(session.expiresAt) > new Date();

  // Authenticated users should not see auth pages
  if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users cannot access /dashboard or any sub-route
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const signupUrl = new URL("/signup", request.url);
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

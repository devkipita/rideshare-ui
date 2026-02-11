import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/proxy")) {
    const url = req.nextUrl.clone();
    url.hostname = "api.yourbackend.com";
    url.protocol = "https";

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/proxy/:path*",
  ],
};

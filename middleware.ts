export { default } from "next-auth/middleware";

export const config = {
  // Protect all pages except auth routes, next internals, and static assets
  matcher: ["/profile/:path*"],
};

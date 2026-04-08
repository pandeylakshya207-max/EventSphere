export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/organiser/:path*", "/tickets/:path*", "/api/bookings/:path*", "/api/events/:path*"],
};

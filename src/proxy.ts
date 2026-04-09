export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/organiser/:path*", "/tickets/:path*", "/api/bookings/:path*", "/api/events/:path*"],
};

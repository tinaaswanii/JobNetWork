import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only run where auth matters; public pages and /api/cron stay untouched.
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

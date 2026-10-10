import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/server";

/** POST-only so logout can't be triggered by a link/image (CSRF). */
export async function POST(request: NextRequest) {
  await supabaseServer().auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

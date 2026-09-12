import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, filters } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Valid email required." } },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("subscribers")
    .upsert(
      { email, filters, confirmed: true }, // TODO: swap `confirmed: true` for real double opt-in email before production
      { onConflict: "email" }
    );

  if (error) {
    console.error("[api/subscribe] supabase error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Couldn't save subscription." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

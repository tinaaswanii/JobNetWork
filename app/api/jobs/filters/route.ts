import { NextResponse } from "next/server";
import { fetchFilters, ArthaApiError } from "@/lib/artha";

export async function GET() {
  try {
    const filters = await fetchFilters();
    return NextResponse.json({ success: true, data: filters });
  } catch (err) {
    if (err instanceof ArthaApiError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.status }
      );
    }
    console.error("[api/jobs/filters] unexpected error", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
      { status: 500 }
    );
  }
}

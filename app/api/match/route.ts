import { NextRequest, NextResponse } from "next/server";
import { getDocumentProxy, extractText } from "unpdf";
import {
  calculateResumeMatch,
  type ResumeMatchResult,
} from "@/lib/resume-match";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const resume = formData.get("resume");
    const jobData = formData.get("job");

    if (!(resume instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF resume.",
        },
        { status: 400 }
      );
    }

    if (!jobData || typeof jobData !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Job information is required.",
        },
        { status: 400 }
      );
    }

    if (resume.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF file.",
        },
        { status: 400 }
      );
    }

    // Keep uploads reasonably small.
    if (resume.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    let job;

    try {
      job = JSON.parse(jobData);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid job information.",
        },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(await resume.arrayBuffer());

    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });

    if (!text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't extract text from this PDF. Try a text-based PDF resume.",
        },
        { status: 400 }
      );
    }

    const result: ResumeMatchResult = calculateResumeMatch(
      text,
      {
        title: String(job.title ?? ""),
        description: String(job.description ?? ""),
        skills: Array.isArray(job.skills) ? job.skills : [],
        exp_min:
          typeof job.exp_min === "number" ? job.exp_min : null,
        exp_max:
          typeof job.exp_max === "number" ? job.exp_max : null,
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[api/match] error", error);

    return NextResponse.json(
      {
        success: false,
        error: "We couldn't process the resume. Please try again.",
      },
      { status: 500 }
    );
  }
}

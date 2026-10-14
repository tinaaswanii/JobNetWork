import { createFileRoute } from "@tanstack/react-router";

// POST /api/match — multipart { resume: PDF file, job: JSON string }.
// Same contract as the original Next.js route so the /match page is unchanged.
// Server-only modules are imported inside the handler so they never reach the
// client bundle, and ANTHROPIC_API_KEY is only ever read on the server.

const fail = (error: string, status: number) =>
  Response.json({ success: false, error }, { status });

export const Route = createFileRoute("/api/match")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const resume = formData.get("resume");
          const jobData = formData.get("job");

          if (!(resume instanceof File)) return fail("Please upload a PDF resume.", 400);
          if (!jobData || typeof jobData !== "string") {
            return fail("Job information is required.", 400);
          }
          if (resume.type !== "application/pdf") return fail("Please upload a PDF file.", 400);
          // Keep uploads reasonably small.
          if (resume.size > 5 * 1024 * 1024) return fail("Resume must be smaller than 5 MB.", 400);

          let job: Record<string, unknown>;
          try {
            job = JSON.parse(jobData) as Record<string, unknown>;
          } catch {
            return fail("Invalid job information.", 400);
          }

          const { getDocumentProxy, extractText } = await import("unpdf");
          const { calculateResumeMatch } = await import("@/lib/resume-match");
          const { calculateResumeMatchWithAI } = await import("@/lib/llm-match");

          const buffer = new Uint8Array(await resume.arrayBuffer());
          const pdf = await getDocumentProxy(buffer);
          const { text } = await extractText(pdf, { mergePages: true });

          if (!text?.trim()) {
            return fail(
              "We couldn't extract text from this PDF. Try a text-based PDF resume.",
              400,
            );
          }

          const skills = job["skills"];
          const expMin = job["exp_min"];
          const expMax = job["exp_max"];
          const jobInput = {
            title: String(job["title"] ?? ""),
            description: String(job["description"] ?? ""),
            skills: Array.isArray(skills) ? skills : [],
            exp_min: typeof expMin === "number" ? expMin : null,
            exp_max: typeof expMax === "number" ? expMax : null,
          };

          const aiResult = await calculateResumeMatchWithAI(text, jobInput);
          const result = aiResult ?? calculateResumeMatch(text, jobInput);

          return Response.json({ success: true, data: result });
        } catch (error) {
          console.error("[api/match] error", error);
          return fail("We couldn't process the resume. Please try again.", 500);
        }
      },
    },
  },
});

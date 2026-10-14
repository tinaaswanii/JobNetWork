// @vitest-environment node
// (Node's real File/FormData are needed; jsdom's File is a different class.)
import { describe, expect, it } from "vitest";

import { Route } from "@/routes/api/match";

type Handler = (ctx: { request: Request }) => Promise<Response>;
const post = (Route.options.server?.handlers as { POST: Handler }).POST;

const job = JSON.stringify({
  title: "Dev",
  description: "",
  skills: [],
  exp_min: null,
  exp_max: null,
});

async function call(form: FormData) {
  const res = await post({
    request: new Request("http://localhost/api/match", { method: "POST", body: form }),
  });
  return { status: res.status, body: (await res.json()) as { success: boolean; error?: string } };
}

describe("POST /api/match validation (same contract as the Next.js route)", () => {
  it("requires a resume file", async () => {
    const form = new FormData();
    form.set("job", job);
    const { status, body } = await call(form);
    expect(status).toBe(400);
    expect(body).toEqual({ success: false, error: "Please upload a PDF resume." });
  });

  it("requires job information", async () => {
    const form = new FormData();
    form.set("resume", new File(["x"], "cv.pdf", { type: "application/pdf" }));
    const { status, body } = await call(form);
    expect(status).toBe(400);
    expect(body.error).toBe("Job information is required.");
  });

  it("rejects non-PDF uploads", async () => {
    const form = new FormData();
    form.set("resume", new File(["x"], "cv.txt", { type: "text/plain" }));
    form.set("job", job);
    const { status, body } = await call(form);
    expect(status).toBe(400);
    expect(body.error).toBe("Please upload a PDF file.");
  });

  it("rejects malformed job JSON", async () => {
    const form = new FormData();
    form.set("resume", new File(["x"], "cv.pdf", { type: "application/pdf" }));
    form.set("job", "{not json");
    const { status, body } = await call(form);
    expect(status).toBe(400);
    expect(body.error).toBe("Invalid job information.");
  });
});

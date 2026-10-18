import { Suspense } from "react";
import MatchTool from "@/components/MatchTool";

// Static content is rendered on the server; only the upload tool is client-side.
// No ads on this page: it handles resume uploads (see components/AdSenseScript.tsx).
export default function MatchPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Match my resume</h1>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        Upload a PDF resume and see how your skills line up with a job. It is a guide, not a
        verdict.
      </p>

      <section aria-labelledby="how-match-works" className="mt-6">
        <h2 id="how-match-works" className="font-display text-lg text-ink">
          How it works
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-ink/70">
          <li>Upload your resume as a PDF.</li>
          <li>Pick a listed job or paste a job description. Coming from a job card? It is already chosen.</li>
          <li>See which skills and requirements show up on your resume, and which are missing.</li>
        </ol>
      </section>

      <section
        aria-labelledby="match-privacy"
        className="mt-6 rounded-lg border border-ink/15 bg-white p-4 text-sm leading-6 text-ink/80"
      >
        <h2 id="match-privacy" className="font-medium text-ink">
          What happens to your resume
        </h2>
        <p className="mt-1">
          Your resume is read on our server only to compare it with the job. We do not save the
          file or its text. To judge the fit, the text of your resume (up to its first 12,000
          characters) and the job details may be sent to Anthropic&apos;s Claude API; if that is not
          available, a simpler keyword check runs on our server instead.
        </p>
        {/* TODO(owner): confirm this matches production (is ANTHROPIC_API_KEY set there?) and add
            a link to Anthropic's data-retention terms if you want to state how long they keep it. */}
      </section>

      <div className="mt-8">
        <Suspense fallback={null}>
          <MatchTool />
        </Suspense>
      </div>

      {/* Safety net: hide any ad that was injected earlier in this visit. */}
      <style>{`.google-auto-placed, ins.adsbygoogle { display: none !important; }`}</style>
    </main>
  );
}

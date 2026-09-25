import type { ResumeMatchLevel, ResumeMatchResult } from "./resume-match";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

type JobInput = {
  title: string;
  description: string;
  skills: string[];
  exp_min: number | null;
  exp_max: number | null;
};

const VALID_LEVELS: ResumeMatchLevel[] = ["strong", "moderate", "weak", "limited"];

/**
 * AI-based resume/job matching that works for ANY field (sales, marketing,
 * hospitality, healthcare, finance, ops, design, etc.), not just tech —
 * unlike lib/resume-match.ts's fixed SKILL_ALIASES dictionary, which only
 * recognizes software/tech terms.
 *
 * Returns null (never throws) if ANTHROPIC_API_KEY isn't set, or if the
 * call/parse fails for any reason, so callers can fall back to the
 * keyword-based matcher instead of breaking the feature entirely.
 */
export async function calculateResumeMatchWithAI(
  resumeText: string,
  job: JobInput
): Promise<ResumeMatchResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are evaluating how well a candidate's resume fits a specific job listing. This job can be in ANY field — tech, sales, marketing, hospitality, healthcare, finance, design, operations, education, skilled trades, etc. Judge fit based on the actual responsibilities, qualifications, and experience described. Do not force a tech-skills framing onto non-tech jobs.

Job title: ${job.title}
Job description: ${job.description || "(none provided)"}
Job's explicitly listed skills (may be empty): ${job.skills.join(", ") || "(none listed)"}
Minimum years of experience required (may be unspecified): ${job.exp_min ?? "not specified"}

Resume text:
"""
${resumeText.slice(0, 12000)}
"""

Respond with ONLY a JSON object, no other text, no markdown code fences, in exactly this shape:
{
  "score": <integer 0-100, overall fit>,
  "level": "<one of: strong, moderate, weak, limited>",
  "matchedSkills": [<strings — real skills/qualifications/responsibilities from the JOB that the resume DOES show evidence of, phrased in the job's own domain language, max 10>],
  "missingSkills": [<strings — things the JOB asks for that the resume shows no evidence of, max 10>],
  "experienceDetected": <your best-guess integer years of relevant experience found in the resume, or null if you genuinely can't tell>
}

Use "limited" only when the job listing itself gives too little information to judge (e.g. no real description and no skills listed) — that reflects a data problem with the listing, not the candidate.`;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("[llm-match] Anthropic API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const textBlock = (data.content ?? []).find(
      (block: { type: string }) => block.type === "text"
    );
    if (!textBlock?.text) return null;

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const level: ResumeMatchLevel = VALID_LEVELS.includes(parsed.level)
      ? parsed.level
      : "limited";

    return {
      score: Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0))),
      level,
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills.slice(0, 10).map(String)
        : [],
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills.slice(0, 10).map(String)
        : [],
      experienceRequired: job.exp_min,
      experienceDetected:
        typeof parsed.experienceDetected === "number" ? parsed.experienceDetected : null,
    };
  } catch (error) {
    console.error("[llm-match] failed, will fall back to keyword matcher", error);
    return null;
  }
}

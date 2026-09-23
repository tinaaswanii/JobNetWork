export type ResumeMatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: number | null;
  experienceDetected: number | null;
};

const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  react: ["react", "react.js", "reactjs"],
  nextjs: ["next.js", "nextjs"],
  nodejs: ["node.js", "nodejs", "node"],
  python: ["python"],
  java: ["java"],
  cplusplus: ["c++", "cpp"],
  php: ["php"],
  sql: ["sql"],
  mysql: ["mysql"],
  postgresql: ["postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"],
  aws: ["aws", "amazon web services"],
  azure: ["azure", "microsoft azure"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  git: ["git", "github", "gitlab"],
  html: ["html", "html5"],
  css: ["css", "css3"],
  tailwind: ["tailwind", "tailwindcss"],
  powerbi: ["power bi", "powerbi"],
  tableau: ["tableau"],
  figma: ["figma"],
  photoshop: ["photoshop"],
  excel: ["excel", "microsoft excel"],
  pandas: ["pandas"],
  numpy: ["numpy"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],
  fastapi: ["fastapi"],
  flask: ["flask"],
  django: ["django"],
  springboot: ["spring boot", "springboot"],
  restapi: ["rest api", "restful api", "rest apis"],
  graphql: ["graphql"],
  machinelearning: ["machine learning", "ml"],
  artificialintelligence: ["artificial intelligence", "ai"],
  cybersecurity: ["cybersecurity", "cyber security"],
  salesforce: ["salesforce"],
  jira: ["jira"],
  canva: ["canva"],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => {
    const normalizedTerm = normalize(term);

    if (!normalizedTerm) return false;

    // Plain `text.includes(term)` was matching short aliases like "ai" or
    // "ml" *inside* unrelated words ("detail", "training", "email"), which
    // meant a listing that only had "ai" as its derived skill would match
    // almost any resume, forcing a guaranteed 100% skill score. Require the
    // term to sit on a word boundary instead of appearing anywhere as a
    // substring.
    const escaped = escapeRegExp(normalizedTerm);
    const pattern = new RegExp(`(?<![a-z0-9_])${escaped}(?![a-z0-9_])`, "i");
    return pattern.test(text);
  });
}

function extractSkills(jobText: string): string[] {
  const text = normalize(jobText);
  const found: string[] = [];

  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    if (containsTerm(text, aliases)) {
      found.push(skill);
    }
  }

  return found;
}

function extractExperience(text: string): number | null {
  const normalized = normalize(text);

  const patterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/,
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+experience/,
    /experience\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*\+?\s*years?/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

export function calculateResumeMatch(
  resumeText: string,
  job: {
    title: string;
    description: string;
    skills: string[];
    exp_min: number | null;
    exp_max: number | null;
  }
): ResumeMatchResult {
  const normalizedResume = normalize(resumeText);

  const jobText = normalize(
    [
      job.title,
      job.description,
      ...(job.skills ?? []),
    ]
      .filter(Boolean)
      .join(" ")
  );

  // Use the job's explicit skills first.
  // If the listing doesn't have skills, derive a limited set
  // from the job description.
  const explicitSkills = (job.skills ?? [])
    .map((skill) => skill.trim())
    .filter(Boolean);

  const jobSkills =
    explicitSkills.length > 0
      ? explicitSkills
      : extractSkills(jobText);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobSkills) {
    const normalizedSkill = normalize(skill);

    const aliases = SKILL_ALIASES[normalizedSkill] ?? [normalizedSkill];

    if (containsTerm(normalizedResume, aliases)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const experienceDetected = extractExperience(resumeText);

  let score = 0;

  // Skills = 80 points.
  if (jobSkills.length > 0) {
    score += Math.round(
      (matchedSkills.length / jobSkills.length) * 80
    );
  } else {
    // Don't penalize someone because the listing has no
    // usable skills information.
    score += 80;
  }

  // Experience = 20 points.
  if (job.exp_min !== null) {
    if (experienceDetected !== null) {
      if (experienceDetected >= job.exp_min) {
        score += 20;
      } else {
        const ratio = Math.max(
          0,
          Math.min(experienceDetected / job.exp_min, 1)
        );

        score += Math.round(ratio * 20);
      }
    }
  } else {
    // No experience requirement = don't penalize.
    score += 20;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    matchedSkills,
    missingSkills,
    experienceRequired: job.exp_min,
    experienceDetected,
  };
}

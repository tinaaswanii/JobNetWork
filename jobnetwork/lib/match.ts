export type ResumeMatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string | null;
  experienceDetected: number | null;
};

const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  react: ["react", "react.js", "reactjs"],
  nodejs: ["node.js", "nodejs", "node"],
  python: ["python"],
  java: ["java"],
  cplusplus: ["c++", "cpp"],
  sql: ["sql", "mysql", "postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"],
  aws: ["aws", "amazon web services"],
  azure: ["azure", "microsoft azure"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  git: ["git", "github", "gitlab"],
  html: ["html", "html5"],
  css: ["css", "css3"],
  powerbi: ["power bi", "powerbi"],
  tableau: ["tableau"],
  figma: ["figma"],
  photoshop: ["photoshop"],
  excel: ["excel", "microsoft excel"],
  pandas: ["pandas"],
  numpy: ["numpy"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsTerm(text: string, terms: string[]) {
  return terms.some((term) => {
    const normalizedTerm = normalize(term);
    return text.includes(normalizedTerm);
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

function extractYears(text: string): number | null {
  const normalized = normalize(text);

  const patterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/,
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+experience/,
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
  jobText: string
): ResumeMatchResult {
  const normalizedResume = normalize(resumeText);
  const normalizedJob = normalize(jobText);

  const jobSkills = extractSkills(normalizedJob);

  const matchedSkills = jobSkills.filter((skill) =>
    containsTerm(normalizedResume, SKILL_ALIASES[skill])
  );

  const missingSkills = jobSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const experienceRequired = normalizedJob.match(
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/
  );

  const requiredYears = experienceRequired
    ? Number(experienceRequired[1])
    : null;

  const experienceDetected = extractYears(normalizedResume);

  let score = 0;

  if (jobSkills.length > 0) {
    score = Math.round((matchedSkills.length / jobSkills.length) * 80);
  } else {
    score = 80;
  }

  if (requiredYears !== null) {
    if (experienceDetected !== null) {
      if (experienceDetected >= requiredYears) {
        score += 20;
      } else {
        const experienceRatio = Math.min(
          experienceDetected / requiredYears,
          1
        );

        score += Math.round(experienceRatio * 20);
      }
    }
  } else {
    score += 20;
  }

  return {
    score: Math.min(score, 100),
    matchedSkills,
    missingSkills,
    experienceRequired: experienceRequired
      ? experienceRequired[0]
      : null,
    experienceDetected,
  };
}

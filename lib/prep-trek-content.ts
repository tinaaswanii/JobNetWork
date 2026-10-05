// Prep Trek — role-level interview prep + study content. Deliberately
// static and field-level, not per-job: a real per-job interview prep
// feature would need per-employer interview data that no API gives us, so
// this is the honest, useful version — common questions and a learning
// path for a role family, the same way a career-center handout would be.

export type PrepQA = {
  question: string;
  answer: string;
};

export type LearningStep = {
  title: string;
  description: string;
};

export type PrepTrack = {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  overview: string;
  commonQuestions: PrepQA[];
  learningPath: LearningStep[];
  coldMailTips: string[];
};

export const prepTracks: PrepTrack[] = [
  {
    slug: "software-engineering",
    name: "Software Engineering",
    tagline: "For SDE, full-stack and backend/frontend roles",
    emoji: "💻",
    overview:
      "Most entry-level SWE interviews check three things: can you solve a problem in code under time pressure, do you understand the fundamentals behind what you've built, and can you talk through your own projects clearly. Depth beats breadth — knowing two projects cold is worth more than a long list of buzzwords.",
    commonQuestions: [
      {
        question: "Walk me through a project on your resume.",
        answer:
          "Structure it: what problem it solved, what you specifically built (not the team), one real technical decision you made and why, and one thing you'd do differently now. Avoid narrating every file in the repo — pick the one or two decisions worth defending.",
      },
      {
        question: "What's the difference between a process and a thread?",
        answer:
          "A process has its own memory space; threads within a process share memory. That's the one-line answer — be ready to follow with why that matters (context-switching cost, shared-state bugs) rather than stopping there.",
      },
      {
        question: "How would you find a cycle in a linked list?",
        answer:
          "Floyd's cycle detection (slow/fast pointers) is the expected answer for O(1) space. Say the brute-force (hash set, O(n) space) first if you're unsure, then optimize out loud — interviewers weight your reasoning process, not just the final answer.",
      },
      {
        question: "Tell me about a time you disagreed with a teammate's technical decision.",
        answer:
          "Pick a real, small disagreement. Show you argued with evidence (not just preference), and that you could also accept being overruled or find a middle path. Avoid stories where you were simply right and everyone else was wrong.",
      },
      {
        question: "What happens when you type a URL into a browser and press enter?",
        answer:
          "DNS lookup → TCP handshake → (TLS handshake if https) → HTTP request → server processes and responds → browser parses HTML/CSS/JS and renders. You don't need to go deep on every layer — name all the steps, then let the interviewer pick one to go deeper on.",
      },
    ],
    learningPath: [
      {
        title: "Nail two projects, not ten",
        description:
          "Pick your two strongest projects and be able to explain the architecture, one hard bug you hit, and one trade-off you made, out loud, in under 2 minutes each.",
      },
      {
        title: "Drill core data structures",
        description:
          "Arrays, hash maps, linked lists, trees, basic graph traversal (BFS/DFS). Most entry-level DSA rounds live almost entirely in these five.",
      },
      {
        title: "Practice explaining while coding",
        description:
          "Interviewers evaluate your thought process, not silent typing. Practice narrating your approach before you write a single line.",
      },
      {
        title: "Know one system-design basic",
        description:
          "For new-grad roles, 'design a URL shortener' or 'design a rate limiter' at a surface level is often enough — you're not expected to design Twitter.",
      },
    ],
    coldMailTips: [
      "Lead with one specific thing about their engineering work, not 'I'm very interested in your company.'",
      "Link a project, not just a resume attachment — something they can open in one click.",
      "Keep it under 150 words. A long cold email reads as unconfident.",
    ],
  },
  {
    slug: "data-analytics",
    name: "Data & Analytics",
    tagline: "For data analyst, BI and junior data science roles",
    emoji: "📊",
    overview:
      "These interviews test whether you can turn a vague business question into a specific analysis, whether your SQL is solid, and whether you can explain a finding to someone non-technical. Case-style questions are common even for junior roles.",
    commonQuestions: [
      {
        question: "Walk me through how you'd investigate a sudden drop in metric X.",
        answer:
          "Structure beats speed here: check if it's a data/tracking issue first (easy to overlook), segment by time/platform/geography to isolate where the drop is concentrated, then form 2-3 hypotheses and say how you'd test each one.",
      },
      {
        question: "Write a query to find the second-highest salary in a table.",
        answer:
          "Mention at least two approaches: a subquery with MAX() excluding the top value, or DENSE_RANK()/ROW_NUMBER() with a window function. Window functions are the more 'senior' answer — use them if comfortable, but a correct subquery is a fine fallback.",
      },
      {
        question: "How do you handle missing data?",
        answer:
          "Don't jump straight to 'fill with the mean.' First ask why it's missing (random vs. systematic) — that changes the right approach: drop, impute, or treat 'missing' as its own meaningful category.",
      },
      {
        question: "Explain a time your analysis changed a decision.",
        answer:
          "Pick a story with a concrete before/after, even from a class project or personal analysis if you lack work experience — the key is showing the chain from data to insight to action.",
      },
    ],
    learningPath: [
      {
        title: "SQL joins and window functions cold",
        description:
          "INNER/LEFT/RIGHT joins, GROUP BY with HAVING, and at least RANK()/ROW_NUMBER() — these cover the large majority of SQL screening questions.",
      },
      {
        title: "One end-to-end analysis project",
        description:
          "A single project where you pulled real data, cleaned it, found something non-obvious, and visualized it is worth more than five tutorial notebooks.",
      },
      {
        title: "Practice explaining stats simply",
        description:
          "Be able to explain p-value, correlation vs. causation, and sample size in one plain sentence each — interviewers often test for this specifically.",
      },
    ],
    coldMailTips: [
      "Reference a specific metric or public report from their company if one exists — shows real homework.",
      "Attach or link one chart from your own analysis work, not just a resume.",
      "Ask a genuine question about their data stack — it signals real interest over a template.",
    ],
  },
  {
    slug: "sales-business-development",
    name: "Sales & Business Development",
    tagline: "For SDR, BDR and junior sales roles",
    emoji: "🤝",
    overview:
      "Sales interviews are themselves a sales pitch — how you communicate in the interview is being evaluated as much as what you say. Expect roleplay ('sell me this pen'), resilience questions, and numbers (quotas, targets).",
    commonQuestions: [
      {
        question: "Sell me this pen.",
        answer:
          "Don't open by describing the pen. Ask a question first ('what do you currently use to write with, and what don't you like about it?') — discovery before pitch is the actual skill being tested, not product description.",
      },
      {
        question: "Tell me about a time you faced rejection and how you handled it.",
        answer:
          "Sales is a high-rejection job by design. Show a real instance, what you did right after (not dwelling, but also not pretending it didn't sting), and what you changed for next time.",
      },
      {
        question: "How do you handle a 'no' from a prospect?",
        answer:
          "Distinguish a hard no from a 'not now' or an objection in disguise. Show you'd ask one clarifying question before giving up on the conversation.",
      },
      {
        question: "Why sales, and why this company specifically?",
        answer:
          "Generic 'I like talking to people' answers are weak. Connect a real trait (persistence, curiosity about a specific industry) to something concrete about what this company sells and who it sells to.",
      },
    ],
    learningPath: [
      {
        title: "Learn one real sales framework",
        description:
          "SPIN selling or the simpler 'discovery before pitch' model — know the shape of a sales conversation, not just enthusiasm.",
      },
      {
        title: "Practice cold outreach out loud",
        description:
          "Write and then say, out loud, a 30-second cold call opener. Reading it silently and saying it are very different skills.",
      },
      {
        title: "Research their actual customer",
        description:
          "Before any interview, know who the company sells to and one real pain point that customer has — this comes up constantly in sales interviews specifically.",
      },
    ],
    coldMailTips: [
      "Short and punchy — sales hiring managers expect you to demonstrate good copywriting in the email itself.",
      "Lead with a specific, researched detail about their product or customer base.",
      "End with one clear, low-friction ask (a 15-minute call), not an open-ended 'let me know your thoughts.'",
    ],
  },
  {
    slug: "marketing-content",
    name: "Marketing & Content",
    tagline: "For marketing, content and social media roles",
    emoji: "📣",
    overview:
      "These interviews look for a portfolio of real work (even personal projects), a point of view on what makes content work, and comfort with at least basic metrics — views alone are rarely considered a complete answer.",
    commonQuestions: [
      {
        question: "Walk me through a piece of content you made and why it worked (or didn't).",
        answer:
          "Have one real example with a specific number attached if possible (engagement rate, shares, a before/after). 'It did well' is weak; 'it got 3x our average engagement because the hook called out the audience directly' is strong.",
      },
      {
        question: "How do you measure whether a campaign succeeded?",
        answer:
          "Tie the metric to the actual goal — awareness campaigns and conversion campaigns shouldn't be judged by the same number. Naming the right metric for the right goal is the actual skill being tested.",
      },
      {
        question: "What's a brand or campaign you admire, and why?",
        answer:
          "Avoid generic answers like 'Nike's marketing.' Pick something specific and recent, and explain the mechanism (why it worked on its audience), not just that you liked it.",
      },
    ],
    learningPath: [
      {
        title: "Build a small portfolio",
        description:
          "Three to five pieces of real work — even unpaid or personal — beats a resume full of 'managed social media' bullet points with nothing to show.",
      },
      {
        title: "Learn the basic funnel vocabulary",
        description:
          "Awareness, consideration, conversion, retention — know which metric belongs to which stage so you don't conflate reach with sales.",
      },
      {
        title: "Practice fast ideation",
        description:
          "Many marketing interviews include an on-the-spot 'pitch me 3 content ideas for X' — practice generating ideas quickly and explaining the reasoning behind each.",
      },
    ],
    coldMailTips: [
      "Show, don't tell — link your best piece of work directly in the first two lines.",
      "Reference their actual recent content/campaign, not a generic compliment.",
      "A little personality in the writing itself is an asset here, more than in other fields.",
    ],
  },
  {
    slug: "customer-support-operations",
    name: "Customer Support & Operations",
    tagline: "For support, ops and coordinator roles",
    emoji: "🧑‍💼",
    overview:
      "These interviews focus heavily on behavioral questions — patience under pressure, handling difficult people, and prioritizing when everything feels urgent. Process-mindedness is valued over raw charisma.",
    commonQuestions: [
      {
        question: "Tell me about a time you dealt with an angry or difficult customer.",
        answer:
          "Use a real structure: acknowledge their frustration first (without necessarily agreeing you were wrong), then what specific action you took, then the outcome. Avoid stories where the customer was simply unreasonable with no resolution.",
      },
      {
        question: "How do you prioritize when you have five urgent things at once?",
        answer:
          "Show a real method — even something simple like 'what has the hardest deadline, what affects the most people, what can I delegate or defer' — rather than just saying 'I stay calm.'",
      },
      {
        question: "Describe a process you improved.",
        answer:
          "Any real example counts, even informal ones (reorganizing a shared doc, creating a checklist). The key is showing you noticed inefficiency and acted without being told to.",
      },
    ],
    learningPath: [
      {
        title: "Learn to structure behavioral answers",
        description:
          "Situation → Task → Action → Result (STAR). Most support/ops interviews are 70%+ behavioral, so this structure does more for you than any trivia.",
      },
      {
        title: "Get comfortable with ambiguity questions",
        description:
          "Practice 'what would you do if you didn't know the answer to a customer's question' — the expected answer is about process (checking resources, escalating correctly), not bluffing.",
      },
    ],
    coldMailTips: [
      "Mention a specific tool you know (Zendesk, Intercom, Notion) if the role lists one — operational roles value tool familiarity.",
      "Keep tone warm but professional — this role is being evaluated partly through the email itself.",
    ],
  },
  {
    slug: "design",
    name: "Design (UI/UX & Graphic)",
    tagline: "For UI/UX, product design and graphic design roles",
    emoji: "🎨",
    overview:
      "Design interviews are portfolio-first — almost everything else is secondary to whether your work is strong and you can explain your decisions. Expect a portfolio walkthrough and sometimes a short live exercise.",
    commonQuestions: [
      {
        question: "Walk me through a project in your portfolio.",
        answer:
          "Lead with the problem, not the visuals. 'Users were dropping off at checkout' before 'I redesigned the checkout screen.' Then explain one real trade-off you made and what you'd change with more time.",
      },
      {
        question: "How do you handle feedback you disagree with?",
        answer:
          "Show you can separate ego from the work — ask for the reasoning behind the feedback, and give a real example of when you pushed back successfully and one where you were convinced to change your mind.",
      },
      {
        question: "How do you approach a brand-new design problem?",
        answer:
          "Research/understand the user and constraints → sketch multiple directions (not just one) → test or validate → refine. Naming more than one direction you considered shows range, not just taste.",
      },
    ],
    learningPath: [
      {
        title: "Curate, don't dump",
        description:
          "3-5 strong case studies beat 15 mediocre shots. Remove anything you can't clearly explain the reasoning behind.",
      },
      {
        title: "Practice narrating your process",
        description:
          "Interviewers weight your thinking, not just the output — practice explaining the 'why' behind a design decision out loud, not just describing what it looks like.",
      },
      {
        title: "Learn basic UX terminology",
        description:
          "Wireframe, user flow, affordance, information architecture — enough fluency to not stumble over vocabulary in a review.",
      },
    ],
    coldMailTips: [
      "Always link the portfolio directly — never make someone hunt for it.",
      "Mention one specific thing you'd improve about their actual product — shows genuine engagement over a generic pitch.",
    ],
  },
];

export function getPrepTrack(slug: string): PrepTrack | undefined {
  return prepTracks.find((t) => t.slug === slug);
}

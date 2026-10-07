// Single source of truth for everything sold on Topmate.
// To add a product later: copy one object, change the fields, save.
// Set `url` once the Topmate product exists; leave it out to show "Coming soon".

export const TOPMATE_PROFILE =
  "https://topmate.io/getyourjob?utm_source=public_profile&utm_campaign=getyourjob";

export const TOPMATE_OFFERS =
  "https://topmate.io/getyourjob/page/WRpfovg9ud#offers";

export type Guide = {
  title: string;
  emoji: string;
  price: string;
  originalPrice?: string;
  blurb: string;
  includes: string[];
  url?: string; // omit => "Coming soon"
  group: "available" | "next" | "career";
};

export const guides: Guide[] = [
  {
    title: "Interview Prep Trek Guide",
    emoji: "🧭",
    price: "₹29",
    originalPrice: "₹199",
    blurb:
      "A practical PDF for preparing for interviews in a more structured way, built from my own placement season.",
    includes: [
      "Common interview questions with answers",
      "Technical revision points",
      "HR and technical interview guidance",
      "Practical tips for interview day",
    ],
    url: "https://topmate.io/getyourjob/2334509?utm_source=public_profile&utm_campaign=getyourjob",
    group: "available",
  },
  {
    title: "Java Programming Notes",
    emoji: "☕",
    price: "₹30",
    originalPrice: "₹149",
    blurb: "Java from fundamentals through advanced topics.",
    includes: ["Fundamentals to advanced", "Interview-focused revision"],
    url: TOPMATE_OFFERS, // TODO: replace with this product's own Topmate link
    group: "available",
  },
  {
    title: "15-Minute Career Call",
    emoji: "📞",
    price: "₹100",
    originalPrice: "₹199",
    blurb: "A quick consultation on jobs and your resume.",
    includes: ["Resume feedback", "Job search questions"],
    url: TOPMATE_OFFERS, // TODO: replace with this product's own Topmate link
    group: "available",
  },
  {
    title: "30-Minute Career Guidance Call",
    emoji: "🎯",
    price: "₹150",
    originalPrice: "₹199",
    blurb: "An in-depth discussion of your job search strategy.",
    includes: ["Job search strategy", "Resume and interview plan"],
    url: TOPMATE_OFFERS, // TODO: replace with this product's own Topmate link
    group: "available",
  },

  // ---- Next: core CS notes (order = launch order) ----
    {
    title: "DBMS PrepTrek",
    emoji: "🗄️",
    price: "₹29",
    originalPrice: "₹199",
    blurb:
      "31 interview cards, 8 SQL queries with answers and 20 rapid-fire Q&As.",
    includes: [
      "31 concept cards, from keys to isolation levels",
      "8 SQL interview queries with answers",
      "20 rapid-fire answers and a night-before checklist",
    ],
    url: "https://topmate.io/getyourjob/2339522?utm_source=public_profile&utm_campaign=getyourjob",
    group: "available",
  },
  {
    title: "SQL Notes + Practice Questions",
    emoji: "🧮",
    price: "₹79",
    blurb: "From SELECT to window functions, with practice.",
    includes: [
      "SELECT, WHERE, GROUP BY",
      "Joins, subqueries, aggregates",
      "Window functions",
      "Common interview queries",
    ],
    group: "next",
  },
  {
    title: "Computer Networks Notes",
    emoji: "🌐",
    price: "₹79",
    blurb: "The networking questions that keep coming up.",
    includes: [
      "OSI and TCP/IP, IP addressing",
      "TCP vs UDP, HTTP/HTTPS, DNS",
      "Routing",
      "Common interview questions",
    ],
    group: "next",
  },
  {
    title: "Operating Systems Notes",
    emoji: "⚙️",
    price: "₹79",
    blurb: "OS concepts explained for interviews.",
    includes: [
      "Processes, threads, scheduling",
      "Deadlocks",
      "Memory management, paging, virtual memory",
      "File systems",
    ],
    group: "next",
  },
  {
    title: "Python Notes",
    emoji: "🐍",
    price: "₹79",
    blurb: "Python basics to OOP, with the usual coding questions.",
    includes: [
      "Data types, functions, OOP",
      "Exception handling",
      "Lists, dictionaries, sets",
      "Common coding questions",
    ],
    group: "next",
  },
  {
    title: "Aptitude & Placement Preparation",
    emoji: "🧠",
    price: "₹99",
    blurb: "Quant, reasoning and verbal for placement tests.",
    includes: [
      "Quantitative aptitude",
      "Logical reasoning, verbal",
      "Frequently asked question types",
      "Shortcuts and practice questions",
    ],
    group: "next",
  },

  // ---- Then: career guides ----
  {
    title: "Resume & ATS Guide",
    emoji: "📄",
    price: "₹99",
    blurb: "Write a resume that gets through applicant tracking systems.",
    includes: [],
    group: "career",
  },
  {
    title: "Placement Preparation Roadmap",
    emoji: "🗺️",
    price: "₹99",
    blurb: "A step-by-step plan for placement season.",
    includes: [],
    group: "career",
  },
  {
    title: "Freshers Job Search Guide",
    emoji: "🔎",
    price: "₹99",
    blurb: "How to look for your first job and actually get replies.",
    includes: [],
    group: "career",
  },
  {
    title: "HR Interview Questions & Answers",
    emoji: "🤝",
    price: "₹79",
    blurb: "The HR round, question by question.",
    includes: [],
    group: "career",
  },
];

// Prep Trek — role-level interview prep + study content. Deliberately
// static and field-level, not per-job: a real per-job interview prep
// feature would need per-employer interview data that no API gives us, so
// this is the honest, useful version — common questions, a 4-week study
// roadmap, a pre-interview checklist, and curated (real, stable) free
// resources for a role family, the same way a career-center handout would be.

export type PrepQA = {
  question: string;
  answer: string;
  // Optional code snippet shown below the answer in a monospace block —
  // used for tracks (Java, SWE) where a short example clarifies more than
  // another sentence would.
  code?: string;
};

export type LearningStep = {
  title: string;
  description: string;
};

export type RoadmapWeek = {
  week: number;
  title: string;
  goals: string[];
};

export type Resource = {
  name: string;
  url: string;
  note: string;
};

// An on-page teaser for a paid deeper version of a track's content, sold
// outside this site (via Topmate) rather than through a payment/accounts
// system this app doesn't have. The page shows what's in it and links out
// to buy — it never reproduces the paid material itself.
export type PremiumTeaser = {
  heading: string;
  intro: string;
  bullets: string[];
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
};

// A downloadable, nicely-typeset PDF version of this track's free content —
// for people who find a long scrolling page harder to study from than a
// file they can save, print, or read offline. Hosted as a static file in
// /public rather than generated per-request.
export type FreeDownload = {
  url: string;
  label: string;
  note: string;
};

export type PrepTrack = {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  overview: string;
  commonQuestions: PrepQA[];
  learningPath: LearningStep[];
  roadmap: RoadmapWeek[];
  checklist: string[];
  resources: Resource[];
  coldMailTips: string[];
  freeDownload?: FreeDownload;
  premium?: PremiumTeaser;
};

// Shared across every track — the universal, field-agnostic part of
// getting ready for the interview itself, not the subject matter.
export const interviewDayChecklist: string[] = [
  "Re-read the job description and highlight 3 requirements you'll tie your answers back to",
  "Look up the interviewer(s) on LinkedIn if named in the invite — one shared interest or background note is enough",
  "Prepare 2-3 questions to ask them — about the role, the team, or what success looks like in 90 days",
  "Test your camera, mic, and internet 30 minutes before (for virtual interviews) — not 2 minutes before",
  "Keep a glass of water nearby and have your resume printed or open on a second screen",
  "Plan your route or login link the night before — arriving stressed undoes all your prep",
];

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
      {
        question: "How would you design a simple rate limiter?",
        answer:
          "Name a technique (token bucket or fixed window counter), say what you'd store it in (an in-memory map for a single server, Redis for multiple servers), and flag the one real trade-off: accuracy vs. memory/complexity. You're not expected to write production code for this live.",
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
    roadmap: [
      {
        week: 1,
        title: "Foundations",
        goals: [
          "Pick your two best projects and write a 150-word summary of each (problem, your role, one trade-off)",
          "Review arrays, strings and hash maps — solve 10 easy problems using only these",
          "Read one explainer on time/space complexity (Big-O) until you can classify your own code's complexity",
        ],
      },
      {
        week: 2,
        title: "Core data structures & patterns",
        goals: [
          "Solve 10 problems each on linked lists and trees (easy → medium)",
          "Learn two-pointer and sliding-window patterns — they solve a disproportionate number of interview questions",
          "Redo 3 problems you struggled with last week from scratch, without looking at your old solution",
        ],
      },
      {
        week: 3,
        title: "Graphs, recursion & mock practice",
        goals: [
          "Learn BFS/DFS and solve 8-10 graph/tree traversal problems",
          "Do 2 timed mock interviews (45 min each) — a friend, a mentor, or recording yourself solving out loud",
          "Draft spoken answers to your 2 project walkthroughs and the 'tell me about yourself' opener",
        ],
      },
      {
        week: 4,
        title: "System design basics & polish",
        goals: [
          "Learn the shape of one basic system design answer (URL shortener or rate limiter) end to end",
          "Do one full mock interview combining a coding question + a project walkthrough + 2 behavioral questions",
          "Re-review your weakest topic from weeks 1-3 based on what tripped you up in mocks",
        ],
      },
    ],
    checklist: [
      "Can explain both chosen projects in under 2 minutes each, without notes",
      "Comfortable coding on a shared screen or whiteboard, not just in your own IDE",
      "Know your own code's time/space complexity without being asked",
      "Have one system-design answer ready end-to-end",
      "Have 2-3 questions ready about their engineering stack or team structure",
    ],
    resources: [
      { name: "LeetCode", url: "https://leetcode.com", note: "Practice problems, filterable by topic and difficulty" },
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org", note: "Free full curriculum if any fundamentals feel shaky" },
      { name: "The Odin Project", url: "https://www.theodinproject.com", note: "Free, project-based full-stack path" },
    ],
    coldMailTips: [
      "Lead with one specific thing about their engineering work, not 'I'm very interested in your company.'",
      "Link a project, not just a resume attachment — something they can open in one click.",
      "Keep it under 150 words. A long cold email reads as unconfident.",
    ],
  },
  {
    slug: "java",
    name: "Java Development",
    tagline: "Core Java interview prep — JDK to JVM internals",
    emoji: "☕",
    overview:
      "Java interviews for fresher and 0-2 year roles lean heavily on fundamentals: OOP, collections, exceptions, and the few multithreading and JVM basics that come up again and again. This track covers 14 of the most common questions in depth — enough to walk in prepared, not just familiar.",
    freeDownload: {
      url: "/prep-trek/java-free-sample.pdf",
      label: "Download the free PDF",
      note: "Same 14 questions as below, plus 2 DSA mock problems and the 60-minute mock structure — typeset to actually study from, offline or on your phone.",
    },
    commonQuestions: [
      {
        question: "What is the difference between JDK, JRE, and JVM?",
        answer:
          "The JVM runs bytecode, is platform-specific, and handles memory and garbage collection. The JRE is the JVM plus the core libraries needed to run Java programs. The JDK is the JRE plus development tools like the compiler (javac) and debugger, needed to write and build programs. So JDK contains JRE, which contains JVM — and 'write once, run anywhere' works because javac produces platform-independent bytecode while each OS has its own JVM to run it.",
      },
      {
        question: "Why is Java platform independent?",
        answer:
          "Source code compiles to bytecode, not machine code, and any machine with a JVM can run that bytecode. It's the JVM that's platform-specific, not your compiled code — each OS needs its own JVM implementation, but the .class file you ship is the same everywhere.",
      },
      {
        question: "Explain the four pillars of OOP with a Java example.",
        answer:
          "Using a payment system as the example: encapsulation keeps a field private with validated getters/setters; inheritance lets a subclass like CreditCardPayment extend a shared Payment base; polymorphism means calling process() on a Payment reference runs whichever subclass's version actually got created; abstraction means an abstract Payment class declares what must be done without callers seeing how.",
        code: "abstract class Payment {\n  abstract void process();\n}\n\nclass UpiPayment extends Payment {\n  @Override void process() { /* ... */ }\n}\n\nPayment p = new UpiPayment();\np.process(); // resolved at runtime — polymorphism",
      },
      {
        question: "Method overloading vs overriding?",
        answer:
          "Overloading happens within the same class — same method name, different parameters, resolved at compile time, and the return type can differ. Overriding happens between a parent and child class — same signature, resolved at runtime, and the return type must be the same or covariant. You cannot override a static, final, or private method.",
        code: "class Calc {\n  int add(int a, int b) { return a + b; }\n  double add(double a, double b) { return a + b; } // overload\n}\n\nclass Dog extends Animal {\n  @Override void sound() { System.out.println(\"Woof\"); } // override\n}",
      },
      {
        question: "Abstract class vs interface?",
        answer:
          "A class can extend only one abstract class but implement many interfaces. An abstract class can hold instance fields and a mix of abstract and concrete methods; an interface traditionally held only constants, though Java 8+ added default and static methods. Abstract classes can have constructors, interfaces can't. Reach for an abstract class for shared base code ('is-a'), an interface for a capability contract ('can-do').",
      },
      {
        question: "Why is String immutable in Java?",
        answer:
          "Four reasons: security, since strings often hold things like file paths or usernames that shouldn't mutate after validation; the string pool, which can only safely share literals if nothing can change them; thread safety, since immutable objects never need synchronization; and hash caching, since hashCode() can be computed once and reused, which is why strings make good HashMap keys.",
      },
      {
        question: "String vs StringBuilder vs StringBuffer?",
        answer:
          "String is immutable and thread-safe by nature, but slow for repeated edits since every change creates a new object. StringBuilder is mutable and the fastest option, but not thread-safe. StringBuffer is mutable and thread-safe (synchronized), but slower than StringBuilder as a result. Default to StringBuilder for building strings in a loop, and only reach for StringBuffer if multiple threads genuinely share it.",
      },
      {
        question: "Checked vs unchecked exceptions?",
        answer:
          "Checked exceptions are verified at compile time — you must handle or declare them — and extend Exception without extending RuntimeException; IOException and SQLException are typical examples. Unchecked exceptions extend RuntimeException and aren't enforced by the compiler, like NullPointerException or ArrayIndexOutOfBoundsException. Errors like OutOfMemoryError are serious JVM-level problems you generally don't try to catch.",
      },
      {
        question: "ArrayList vs LinkedList?",
        answer:
          "ArrayList is backed by a dynamic array: O(1) get by index, O(1) amortized add at the end, but O(n) insert/remove in the middle due to shifting. LinkedList is a doubly linked list: O(n) get by index, O(1) add/remove at the ends, and O(1) insert/remove once you've found the node — but finding it is still O(n). In practice, default to ArrayList; it usually wins even for middle inserts because of cache-friendly memory layout.",
      },
      {
        question: "How does HashMap work internally?",
        answer:
          "key.hashCode() is computed and spread to pick a bucket index. An empty bucket stores the entry directly; a collision compares keys with equals() — a match replaces the value, otherwise the entry joins that bucket's chain. Since Java 8, a long chain (8+ entries, with a large enough table) converts to a balanced tree, improving worst-case lookup from O(n) to O(log n). When size exceeds capacity times the load factor (default 0.75), the table resizes and redistributes entries. Average get/put is O(1) — and you must override hashCode() whenever you override equals(), or equal objects can land in different buckets and the map simply won't find them.",
      },
      {
        question: "Two ways to create a thread? Which is better?",
        answer:
          "Extend Thread and override run(), or implement Runnable and pass it to a Thread. Runnable is generally preferred: Java has single inheritance, so extending Thread uses up your one chance, and Runnable cleanly separates the task from the threading mechanism. In real projects, an ExecutorService is better than creating threads manually either way. One common trap: calling start() creates a new thread, while calling run() directly just runs it like a normal method on the current thread.",
      },
      {
        question: "What are lambda expressions and functional interfaces?",
        answer:
          "A functional interface has exactly one abstract method — Runnable, Comparator, and Function are common examples. A lambda is a short way to implement one inline, without a named class. The most-used built-ins are Predicate<T> for a boolean test, Function<T,R> for a transform, Consumer<T> for using a value, and Supplier<T> for providing one.",
        code: "Runnable r = () -> System.out.println(\"hello\");\nComparator<Integer> c = (a, b) -> b - a;",
      },
      {
        question: "What is the Stream API? Give an example.",
        answer:
          "Streams process collections declaratively, in three stages: a source, lazy intermediate operations, and one terminal operation that actually triggers execution. They read like a pipeline and avoid writing explicit loops for common filter/transform/collect work.",
        code: "List<String> result = names.stream()\n    .filter(n -> n.startsWith(\"A\"))\n    .map(String::toUpperCase)\n    .sorted()\n    .collect(Collectors.toList());",
      },
      {
        question: "Stack vs heap memory?",
        answer:
          "The stack holds method call frames, local variables, and object references — it's per-thread, fast, and automatically cleaned up when a method returns. The heap holds the actual objects and is shared across all threads, managed by the garbage collector. A StackOverflowError happens when the stack fills up (usually deep or infinite recursion); an OutOfMemoryError happens when the heap fills up.",
      },
    ],
    learningPath: [
      {
        title: "Core Java & OOP, cold",
        description:
          "Work through JDK/JRE/JVM, the four OOP pillars, and overloading vs overriding until you can explain each without rereading your own notes.",
      },
      {
        title: "Strings, exceptions, collections",
        description:
          "String immutability, checked vs unchecked exceptions, and ArrayList/HashMap internals — the section most fresher interviews spend the most time on.",
      },
      {
        title: "Threads, Java 8+, and the JVM",
        description:
          "Just enough multithreading to not freeze up, plus lambdas, streams, and the stack/heap split — this is usually a smaller slice of the interview, not the whole thing.",
      },
      {
        title: "Run it like a real interview",
        description:
          "Use the 60-minute mock structure (intro, DSA, fundamentals, project, close) at least twice before the real thing.",
      },
    ],
    roadmap: [
      {
        week: 1,
        title: "Core Java & OOP foundations",
        goals: [
          "Explain JDK vs JRE vs JVM and why Java is platform independent, without notes",
          "Write your own small example (not the payment one above) that clearly shows all four OOP pillars",
          "Drill overloading vs overriding and abstract class vs interface until the distinctions are automatic",
        ],
      },
      {
        week: 2,
        title: "Strings, exceptions & collections",
        goals: [
          "Explain all 4 reasons String is immutable, and when you'd reach for StringBuilder instead",
          "Practice checked vs unchecked exceptions with your own example of each",
          "Be able to explain HashMap's bucket/collision/resize behavior end to end, including why hashCode() and equals() must agree",
        ],
      },
      {
        week: 3,
        title: "Multithreading, Java 8+ & JVM",
        goals: [
          "Explain the two ways to create a thread and justify why Runnable is usually preferred",
          "Write one lambda expression and one short stream pipeline from scratch, live",
          "Explain stack vs heap, and what causes a StackOverflowError vs an OutOfMemoryError",
        ],
      },
      {
        week: 4,
        title: "Mock interviews",
        goals: [
          "Run the 60-minute mock structure at least twice: intro, DSA, fundamentals rapid-fire, project deep dive, close",
          "Solve Two Sum and Valid Parentheses using the 7-step protocol, narrating your reasoning out loud",
          "Prepare one STAR-format story about a bug or technical disagreement, timed under 90 seconds",
        ],
      },
    ],
    checklist: [
      "Can explain == vs .equals(), and why a custom class must override equals() alongside hashCode()",
      "Comfortable explaining HashMap's internal bucket/collision/resize behavior end to end",
      "Know both ways to create a thread and can justify why Runnable is usually preferred",
      "Can write a lambda expression and a simple stream pipeline live, without references",
      "Completed at least one full 60-minute mock interview covering DSA, fundamentals, a project, and behavioral questions",
      "Have one STAR-format project or bug story ready to tell in under 90 seconds",
    ],
    resources: [
      { name: "Oracle Java Documentation", url: "https://docs.oracle.com/en/java/", note: "The official spec — good for settling any 'but what does it actually say' question" },
      { name: "Baeldung", url: "https://www.baeldung.com", note: "Free, detailed write-ups on nearly every Core Java and Collections topic" },
      { name: "GeeksforGeeks — Java", url: "https://www.geeksforgeeks.org/java/", note: "Free practice questions and explanations by topic" },
      { name: "LeetCode", url: "https://leetcode.com", note: "For the DSA side of the interview, filterable by language and topic" },
    ],
    coldMailTips: [
      "Lead with one specific thing about their engineering work, not 'I'm very interested in your company.'",
      "Link a project, not just a resume attachment — something they can open in one click.",
      "Keep it under 150 words. A long cold email reads as unconfident.",
    ],
    premium: {
      heading: "Prep Trek Premium: Java Black Belt",
      intro:
        "This free track covers 14 of the 44 questions in the full Java Interview Q&A Bank, 2 of the 6 DSA mock problems, and none of the visual Java Black Belt notes. Premium picks up exactly where this leaves off.",
      bullets: [
        "30 more Q&A answers: == vs .equals(), static/final, access modifiers, wrapper classes, the full Collections set (HashMap vs ConcurrentHashMap, TreeSet, Comparable vs Comparator, fail-fast iterators), multithreading (synchronization, volatile, deadlock, thread pools), Java 8+ (Optional, map vs flatMap), and JVM internals & garbage collection",
        "The output-prediction drill — the 'what does this print?' trap questions interviewers love",
        "4 more DSA mock problems (linked lists, cycle detection, tree traversal, binary search traps) with graded hints",
        "13 more CS fundamentals answers across OOP, DBMS, Operating Systems and Computer Networks",
        "The project deep-dive question bank plus a fill-in answer template",
        "12 behavioral questions to rehearse, an interviewer scorecard, a peer-mock script, and a full 4-week mock schedule",
        "Java Black Belt visual notes — Core Java, Collections, and Threads, plus a traps quiz with an answer key",
      ],
      ctaLabel: "Get full access on Topmate",
      ctaUrl: "https://topmate.io/getyourjob/2333816?utm_source=public_profile&utm_campaign=getyourjob",
      secondaryCtaLabel: "Book a 1:1 mock interview",
      secondaryCtaUrl: "https://topmate.io/getyourjob",
    },
  },
  {
    slug: "hr-behavioral",
    name: "HR & Behavioral Interview Prep",
    tagline: "Works across every field — the round every interview has in common",
    emoji: "🎯",
    overview:
      "Whatever role you're interviewing for, there's almost always an HR or behavioral round — and it's the one most people under-prepare for because it feels like 'just talking.' It isn't. It's scored the same way a technical round is, on structure and specifics, not just confidence. This track covers the questions that come up constantly, the tricks interviewers use to see how you handle pressure, and how to actually prepare instead of hoping you'll think of something in the moment.",
    commonQuestions: [
      {
        question: "Tell me about yourself.",
        answer:
          "This isn't an invitation to recite your resume — they already have it. Use a short arc instead: where you started (your degree/background in one line), what you've built or learned since, and what you're looking for now, tied to this specific role. Keep it under 90 seconds. Practicing this one answer matters more than almost anything else, since it sets the tone for the whole interview.",
      },
      {
        question: "What are your strengths and weaknesses?",
        answer:
          "For strengths: pick one that's actually relevant to the role, and immediately back it with a 10-second example — not just the word itself. For weaknesses: name a real one (not 'I work too hard' in disguise), and show what you're actively doing about it. A weakness with no action attached sounds like you haven't thought about it; a fake weakness sounds like you're dodging the question.",
      },
      {
        question: "Why do you want to work here?",
        answer:
          "Generic answers ('great company, great culture') are instantly forgettable. Name one specific thing — a product, a value, something they're building or going through — and connect it to something real about you. This requires 10 minutes of actual research before the interview, which most candidates skip.",
      },
      {
        question: "Why should we hire you over other candidates?",
        answer:
          "Don't compare yourself to invisible competitors you know nothing about. Instead, state plainly what you bring that directly matches what the role needs, with one concrete example. Confidence here comes from specificity, not volume.",
      },
      {
        question: "Where do you see yourself in 5 years?",
        answer:
          "They're checking for realistic ambition and whether you'll stick around, not a rigid life plan. A safe, honest answer: name a direction of growth (more ownership, deeper skill in X) that plausibly builds on this exact role, without promising to become their CEO or admitting you'll probably leave in a year.",
      },
      {
        question: "Why is there a gap in your resume / why did you leave your last role?",
        answer:
          "State the real reason plainly and briefly, then pivot to what you did with that time or what you learned from leaving. Over-explaining or sounding defensive draws more attention to it than the gap itself ever would.",
      },
      {
        question: "What are your salary expectations?",
        answer:
          "Research a realistic range for the role, level, and location beforehand (Glassdoor, Levels.fyi, or simply asking people in your network) rather than guessing. Give a range, not a single number, and it's fair to ask what the budgeted range for the role is before you answer.",
      },
      {
        question: "Do you have any questions for us?",
        answer:
          "Always say yes — this is scored too. Asking nothing reads as low interest. Prepare 2-3 real questions in advance: about the team, what success looks like in the first 90 days, or what the interviewer personally enjoys about working there. Avoid questions you could've answered yourself by reading their website.",
      },
    ],
    learningPath: [
      {
        title: "Write your core answers down",
        description:
          "'Tell me about yourself,' your top strength, your real weakness, and 'why this company' — write these out fully once, then practice saying them, not reading them.",
      },
      {
        title: "Build your story bank",
        description:
          "Collect 4-5 real stories from your work, projects, or college life that can each answer multiple behavioral questions — a conflict, a failure, a time you led something, a time you learned fast.",
      },
      {
        title: "Learn to spot the trick questions",
        description:
          "Stress questions, contradiction checks, and silence tactics are common and designed to see how you react, not to find a 'correct' answer.",
      },
      {
        title: "Practice out loud, not in your head",
        description:
          "An answer that sounds complete in your head is often rambling out loud. Say every answer out loud at least 3 times before the real interview.",
      },
    ],
    roadmap: [
      {
        week: 1,
        title: "Core answers",
        goals: [
          "Write a full 'tell me about yourself' answer and read it aloud until it's under 90 seconds without rushing",
          "Pick one real strength and one real weakness, each with a concrete example or action attached",
          "Research your target company for 15-20 minutes and write down 2 genuinely specific reasons you want to work there",
        ],
      },
      {
        week: 2,
        title: "Story bank using STAR",
        goals: [
          "Learn the STAR structure (Situation, Task, Action, Result) if you haven't already",
          "Write 4-5 real stories covering: a conflict, a failure or mistake, a time you led or took initiative, and a time you learned something fast",
          "Map which story answers which common question — most stories can flex to answer 2-3 different questions",
        ],
      },
      {
        week: 3,
        title: "Handling pressure & tricky questions",
        goals: [
          "Practice staying calm through silence — if an interviewer doesn't react to your answer, resist the urge to keep talking to fill the gap",
          "Prepare an honest, non-defensive answer for your resume gap or weakest point before you're asked",
          "Practice 2-3 salary/compensation questions with a researched range ready, not a guess",
        ],
      },
      {
        week: 4,
        title: "Full mock & polish",
        goals: [
          "Do one full mock HR round, answering at least 8 of the common questions above out loud, timed",
          "Record yourself once and watch it back — most people are harsher on themselves than needed, but filler words and rambling are easy to spot this way",
          "Finalize your 2-3 questions to ask the interviewer, specific to each company you're interviewing with",
        ],
      },
    ],
    checklist: [
      "Can say 'tell me about yourself' in under 90 seconds without sounding memorized",
      "Have one real strength and one real weakness ready, each with a concrete example",
      "Have 4-5 STAR stories ready, mapped to the questions they can answer",
      "Researched a realistic salary range for this specific role and location",
      "Have 2-3 genuine, specific questions ready to ask the interviewer",
      "Practiced staying composed through silence or a flat reaction, without over-explaining",
    ],
    resources: [
      { name: "Glassdoor Interview Questions", url: "https://www.glassdoor.com/Interview/index.htm", note: "Search real, company-specific interview questions and reported experiences" },
      { name: "Levels.fyi", url: "https://www.levels.fyi", note: "Free, crowdsourced salary data by company, role and level" },
      { name: "Indeed Career Guide", url: "https://www.indeed.com/career-advice/interviewing", note: "General behavioral interview guidance by question type" },
    ],
    coldMailTips: [
      "The same honesty that works in an HR round works in a cold email — be specific about why this company, not generic.",
      "Keep it short enough that a busy hiring manager reads the whole thing, not just the first line.",
    ],
  },
  {
    slug: "interviewer-tricks-and-tactics",
    name: "Common Interview Tricks & Tactics",
    tagline: "The curveballs interviewers throw on purpose — and how to handle them",
    emoji: "🧠",
    overview:
      "Some of what happens in an interview isn't about testing your knowledge — it's about testing your composure. These tactics show up across every field and every company type, from campus placements to corporate interviews. None of them have a single 'correct' answer; what's being evaluated is how you react.",
    commonQuestions: [
      {
        question: "The interviewer goes silent after your answer instead of reacting.",
        answer:
          "This is often deliberate, not a sign you got it wrong. The instinct to fill silence by rambling or adding caveats usually makes a good answer worse. Finish your answer, then stop — a calm pause on your end reads as confidence, not a mistake.",
      },
      {
        question: "They ask the same question twice, worded differently, later in the interview.",
        answer:
          "This checks for consistency, not memory. Don't panic and change your story to seem more interesting — answer naturally each time. If your two answers genuinely conflict, address it briefly and honestly rather than pretending you didn't notice.",
      },
      {
        question: "Rapid-fire questions with almost no time to think.",
        answer:
          "The goal is to see how you think under pressure, not to get a perfect answer to every single one. It's fine to say 'let me think for a second' once or twice — a brief pause reads better than a rushed, wrong answer.",
      },
      {
        question: "A deliberately aggressive or skeptical tone ('stress interview').",
        answer:
          "Some interviewers push back hard on purpose to see if you get defensive or flustered. Stay polite and factual; don't match their energy. If a pushback is actually a fair point, it's fine to say so rather than defending a position just to avoid 'losing.'",
      },
      {
        question: "'What's your current/expected salary?' asked very early, before much else.",
        answer:
          "This is sometimes a filtering tactic. It's reasonable to give a range or redirect briefly ('I'd like to learn more about the role first, but based on my research the range is roughly X') rather than anchoring yourself too early or too low.",
      },
      {
        question: "They act uninterested, check their phone, or seem distracted.",
        answer:
          "This is sometimes used to see if it throws you off your answer. It may also just mean they're tired or busy — either way, reacting by rushing or under-explaining usually works against you. Keep your normal pace and depth.",
      },
    ],
    learningPath: [
      {
        title: "Name the tactic, don't react to it",
        description:
          "Recognizing 'this is a stress tactic' or 'this is a silence test' in the moment makes it far easier to not take it personally.",
      },
      {
        title: "Practice under mild discomfort",
        description:
          "Do at least one mock interview with a friend deliberately trying to rattle you — interrupting, staying silent, or pushing back — so the real thing feels familiar.",
      },
      {
        title: "Separate confidence from certainty",
        description:
          "You don't need to be certain you're right to sound composed. 'Here's my reasoning' delivered calmly beats a hesitant 'um, I think so?' even when the content is similar.",
      },
    ],
    roadmap: [
      {
        week: 1,
        title: "Learn the common tactics",
        goals: [
          "Read through all six tactics above until you can name each one and what it's actually testing",
          "Reflect on past interviews (yours or a friend's) and identify if any of these happened without you realizing it at the time",
        ],
      },
      {
        week: 2,
        title: "Practice composure",
        goals: [
          "Do one mock interview where your partner deliberately stays silent after every answer",
          "Do one mock interview with rapid-fire, low-think-time questions",
          "Practice the phrase 'let me take a second to think about that' until it feels natural, not awkward",
        ],
      },
    ],
    checklist: [
      "Can name at least 4 common interviewer tactics and what each is actually testing",
      "Practiced at least one mock round designed to be deliberately uncomfortable",
      "Have a calm, go-to phrase ready for when you need a moment to think",
      "Know your researched salary range well enough to not be rattled by an early salary question",
    ],
    resources: [
      { name: "Glassdoor Interview Questions", url: "https://www.glassdoor.com/Interview/index.htm", note: "Real reported interview experiences, including stress-interview accounts, by company" },
    ],
    coldMailTips: [
      "The same composure that works against a stress tactic works in a cold follow-up — calm and specific beats eager and long.",
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
      {
        question: "How would you explain a p-value to a non-technical manager?",
        answer:
          "Avoid the textbook definition. Something like: 'it's how likely we'd see a result this strong just by chance, if there was actually no real effect — low means the effect is probably real.' Simple and correct beats precise and confusing.",
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
    roadmap: [
      {
        week: 1,
        title: "SQL fundamentals",
        goals: [
          "Drill SELECT, WHERE, GROUP BY, HAVING and all join types until you don't need to look up syntax",
          "Solve 15-20 SQL practice problems, including at least 5 using window functions",
          "Pick a public dataset (government open data, Kaggle) for your end-to-end project",
        ],
      },
      {
        week: 2,
        title: "One real analysis project",
        goals: [
          "Clean your chosen dataset and document every cleaning decision you made and why",
          "Find one genuinely non-obvious insight — not just 'sales went up'",
          "Build 2-3 clear charts and write 3-4 sentences explaining what each one shows a non-technical reader",
        ],
      },
      {
        week: 3,
        title: "Statistics & case practice",
        goals: [
          "Review mean/median/variance, correlation vs. causation, and p-values until you can explain each in one plain sentence",
          "Practice 3-4 'investigate this metric drop' style case questions out loud, timed to 5-10 minutes each",
          "Learn to sanity-check: always ask 'could this be a tracking/data issue?' before a business hypothesis",
        ],
      },
      {
        week: 4,
        title: "Storytelling & mock interviews",
        goals: [
          "Turn your project into a 3-minute spoken walkthrough: problem → approach → finding → so what",
          "Do one full mock interview: a SQL question, a case question, and your project walkthrough",
          "Prepare 2-3 questions about their data stack, data quality practices, or how analytics is used in decisions",
        ],
      },
    ],
    checklist: [
      "Comfortable writing a join and a window-function query from scratch, live, without references",
      "Can explain your end-to-end project in under 3 minutes to a non-technical listener",
      "Can define p-value, correlation vs. causation, and sample size in plain language",
      "Have a structured approach ready for 'investigate this metric' style questions",
      "Have 2-3 questions ready about their data stack or how analytics drives decisions",
    ],
    resources: [
      { name: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", note: "Free, practical SQL tutorial built around real query practice" },
      { name: "Kaggle", url: "https://www.kaggle.com", note: "Free datasets and notebooks for your end-to-end project" },
      { name: "Khan Academy — Statistics", url: "https://www.khanacademy.org/math/statistics-probability", note: "Free refresher on core stats concepts" },
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
      {
        question: "How would you prioritize 50 leads with limited time?",
        answer:
          "Name a real criterion (company size, buying signal, past engagement) rather than 'I'd call them all' — show you understand time is the scarce resource in sales, not effort.",
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
    roadmap: [
      {
        week: 1,
        title: "Frameworks & company research",
        goals: [
          "Learn one sales framework (SPIN, or a simple discovery-before-pitch model) well enough to name its steps unprompted",
          "Research 2-3 target companies deeply: who they sell to, one real customer pain point, one recent news item",
          "Write your 'why sales' story and read it out loud until it doesn't sound memorized",
        ],
      },
      {
        week: 2,
        title: "Roleplay practice",
        goals: [
          "Practice 'sell me X' roleplay with a friend or by recording yourself, 5 different objects",
          "Write out 3 common objections in your target field and a discovery-first response to each",
          "Draft and read aloud a 30-second cold call opener until it's natural, not scripted-sounding",
        ],
      },
      {
        week: 3,
        title: "Resilience & numbers",
        goals: [
          "Prepare 2 real rejection stories using STAR structure (situation, task, action, result)",
          "Learn the basic sales vocabulary: quota, pipeline, conversion rate, churn — be able to use each correctly in a sentence",
          "Practice a prioritization question ('50 leads, limited time') with a clear, stated criterion",
        ],
      },
      {
        week: 4,
        title: "Mock interviews & polish",
        goals: [
          "Do 2 full mock interviews including at least one live roleplay round",
          "Tighten your cold-email template using the field-specific tips below",
          "Prepare 2-3 questions about their sales process, quota structure, or ramp-up time for new hires",
        ],
      },
    ],
    checklist: [
      "Can do a 'sell me this' roleplay opening with a discovery question, not a pitch",
      "Have 2 rejection/resilience stories ready in STAR format",
      "Comfortable using quota, pipeline, and conversion rate correctly in conversation",
      "Know who your target company sells to and one real pain point of that customer",
      "Have 2-3 questions ready about quota structure or ramp-up time",
    ],
    resources: [
      { name: "HubSpot Sales Blog", url: "https://blog.hubspot.com/sales", note: "Free, practical articles on frameworks and objection handling" },
      { name: "Glassdoor Interview Questions", url: "https://www.glassdoor.com/Interview/index.htm", note: "Search real, company-specific sales interview questions" },
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
      {
        question: "Pitch me 3 content ideas for our brand, right now.",
        answer:
          "Skim their recent posts for 30 seconds before this comes up if you can. Give 3 genuinely different angles (not 3 variations of the same idea), and briefly say who each one targets.",
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
    roadmap: [
      {
        week: 1,
        title: "Portfolio audit",
        goals: [
          "Pick your 3-5 strongest pieces of work and write one sentence each on the goal, the result, and why it worked",
          "If you lack real work, create 2 sample pieces (a post, a short video script, a landing page headline) for a brand you admire",
          "Learn funnel vocabulary (awareness/consideration/conversion/retention) and match each past piece to a stage",
        ],
      },
      {
        week: 2,
        title: "Metrics & measurement",
        goals: [
          "For each portfolio piece, identify the one metric that actually mattered for its goal",
          "Learn to read basic analytics screenshots (engagement rate, CTR, reach) if you haven't worked with them directly",
          "Write a short case study format you can reuse: goal → approach → result → learning",
        ],
      },
      {
        week: 3,
        title: "Ideation practice",
        goals: [
          "Practice the 'pitch me 3 ideas' exercise for 5 different hypothetical brands, timed to 2 minutes each",
          "Research 2-3 target companies' recent content/campaigns so you have real material to reference",
          "Write your 'brand or campaign I admire' answer and make sure it names a specific mechanism, not just a vibe",
        ],
      },
      {
        week: 4,
        title: "Mock interviews & polish",
        goals: [
          "Do 1-2 full mock interviews including a live on-the-spot ideation round",
          "Tighten your portfolio down to the 3 strongest pieces — cut anything you can't defend under questioning",
          "Prepare 2-3 questions about their content strategy or team structure",
        ],
      },
    ],
    checklist: [
      "Have 3-5 portfolio pieces, each with a goal, metric, and result memorized",
      "Can name the right metric for a given campaign goal without hesitating",
      "Practiced the 'pitch me 3 ideas' exercise at least 5 times under a 2-minute timer",
      "Have a specific, mechanism-based answer for 'a campaign you admire'",
      "Have 2-3 questions ready about their content strategy or team",
    ],
    resources: [
      { name: "HubSpot Academy", url: "https://academy.hubspot.com", note: "Free courses on content, social and inbound marketing" },
      { name: "Google Analytics Academy", url: "https://analytics.google.com/analytics/academy/", note: "Free, if you need basic metrics fluency" },
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
      {
        question: "What would you do if you didn't know the answer to a customer's question?",
        answer:
          "The expected answer is about process, not bluffing: say you'd be honest that you need to check, tell them a realistic timeline, and actually follow up — not disappear or guess.",
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
    roadmap: [
      {
        week: 1,
        title: "STAR stories",
        goals: [
          "Learn the STAR structure (Situation, Task, Action, Result) and write out 4 real work/life stories using it",
          "Make sure at least one story covers a difficult person, one covers prioritization, and one covers a process you improved",
          "Practice saying each story out loud in under 90 seconds",
        ],
      },
      {
        week: 2,
        title: "Tools & ambiguity",
        goals: [
          "If the role lists a tool (Zendesk, Intercom, Freshdesk, Notion), spend 1-2 hours in its free trial or documentation",
          "Practice answering 'what if you don't know the answer' with a clear, honest process rather than guessing",
          "Write out your own prioritization method for 'five urgent things at once' in plain, repeatable steps",
        ],
      },
      {
        week: 3,
        title: "Mock interviews",
        goals: [
          "Do 2 mock interviews focused entirely on behavioral questions",
          "Practice staying calm and structured even when a mock question catches you off guard",
          "Refine your weakest STAR story based on mock feedback",
        ],
      },
      {
        week: 4,
        title: "Final polish",
        goals: [
          "Review all 4 STAR stories until you can tell each without sounding rehearsed",
          "Prepare 2-3 questions about team structure, escalation paths, or what good performance looks like in this role",
          "Do one final run-through of your tool familiarity if the role names a specific platform",
        ],
      },
    ],
    checklist: [
      "Have 4 STAR stories ready: a difficult customer, a prioritization call, a process improvement, and a mistake you owned",
      "Can explain your own prioritization method in plain, repeatable steps",
      "Have a clear, honest process for 'what if you don't know the answer'",
      "Familiar with any tool specifically named in the job listing",
      "Have 2-3 questions ready about escalation paths or what good performance looks like",
    ],
    resources: [
      { name: "Zendesk Help Center (public docs)", url: "https://support.zendesk.com", note: "Free way to get familiar with a widely-used support tool" },
      { name: "Indeed Career Guide — Customer Service", url: "https://www.indeed.com/career-advice/interviewing", note: "General interview-question practice by role" },
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
      {
        question: "Critique this screen (shown live or sent beforehand).",
        answer:
          "Don't just list flaws. Structure it: what's the screen's goal, what works toward that goal, what works against it, and one concrete fix you'd try — critique with a point of view, not a list of nitpicks.",
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
    roadmap: [
      {
        week: 1,
        title: "Portfolio curation",
        goals: [
          "Pick your 3-5 strongest case studies and cut everything else from your main portfolio",
          "For each, write the problem statement in one sentence before describing any visuals",
          "Identify one real trade-off you made in each project and one thing you'd change with more time",
        ],
      },
      {
        week: 2,
        title: "Process & vocabulary",
        goals: [
          "Learn core UX vocabulary: wireframe, user flow, affordance, information architecture, usability testing",
          "Write out your design process in your own words (research → sketch → validate → refine, or your own version)",
          "Practice narrating one case study's process out loud, focusing on 'why' at each step",
        ],
      },
      {
        week: 3,
        title: "Critique & feedback practice",
        goals: [
          "Practice critiquing 3 real apps/websites using the structure: goal → what works → what doesn't → one fix",
          "Prepare 2 feedback stories: one where you pushed back successfully, one where you changed your mind",
          "Get a mentor or peer to mock-review one case study and ask hard questions",
        ],
      },
      {
        week: 4,
        title: "Mock interviews & polish",
        goals: [
          "Do a full portfolio walkthrough mock interview, timed to how long you'd actually get (usually 15-20 min)",
          "Practice a live whiteboard/sketch exercise for a hypothetical brief if the role might include one",
          "Prepare 2-3 questions about their design process, team size, or how design and engineering collaborate",
        ],
      },
    ],
    checklist: [
      "Portfolio trimmed to 3-5 case studies you can defend in depth",
      "Each case study opens with the problem, not the visuals",
      "Comfortable using wireframe, user flow, affordance, and information architecture correctly",
      "Have 2 feedback stories ready: pushing back, and changing your mind",
      "Have 2-3 questions ready about their design process or team collaboration",
    ],
    resources: [
      { name: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/", note: "Free, well-respected UX articles and vocabulary" },
      { name: "Behance", url: "https://www.behance.net", note: "Free portfolio hosting and inspiration from other designers" },
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

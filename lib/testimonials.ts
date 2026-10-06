// Real testimonials only — add new ones here as Tina sends them. Each
// entry should be something an actual person said, not written for them.
// Keep `role` honest (what they actually got, if anything) rather than
// inflating it.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I built Prep Trek from my own placement season — the same panic, the same last-minute scramble. These are the actual notes and drills I used.",
    name: "Tina",
    role: "Creator of Prep Trek · 4 offers (Accenture, Deloitte, Innove8, Cognizant) · resume shortlisted at Google & Amazon",
  },
  // Add real student/user testimonials below, same shape:
  // { quote: "...", name: "...", role: "e.g. Hired as SDE Intern at X" },
];

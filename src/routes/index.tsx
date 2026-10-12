import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, KanbanSquare, CalendarCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobNetWork Tracker — Your private job application dashboard" },
      { name: "description", content: "Track job applications, interviews, and follow-ups in one private dashboard. Sign in with Google." },
      { property: "og:title", content: "JobNetWork Tracker — Your private job application dashboard" },
      { property: "og:description", content: "Track job applications, interviews, and follow-ups in one private dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: KanbanSquare,
    title: "Track every application",
    text: "From saved to offer — a clear status pipeline for each job you pursue.",
  },
  {
    icon: CalendarCheck,
    title: "Manage interviews",
    text: "Schedule interview rounds and keep notes for every conversation.",
  },
  {
    icon: History,
    title: "Follow-up history",
    text: "A full activity trail so you always know where things stand.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">JobNetWork Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/jobs">Browse jobs</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="py-20 text-center">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Private by default
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Your job search, organized in one dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Save jobs, track applications through every stage, and never miss an
            interview or follow-up again.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get started with Google</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-20 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

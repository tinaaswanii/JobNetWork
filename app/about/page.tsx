import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About JobNetWork",
  description:
    "Learn about JobNetWork, a job platform for every stage of your career, from internships and first jobs to experienced and senior roles.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero */}
      <header className="bg-board text-paper px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl">
            About JobNetWork
          </h1>

          <p className="mt-4 max-w-2xl text-paper/80">
            Making jobs and internships, at every level, easier to find and
            keep up with.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-12">
        {/* Why we started */}
        <div>
          <h2 className="font-display text-2xl">Why we started JobNetWork</h2>

          <p className="mt-3 leading-7 text-muted-foreground">
            Finding a job or internship can mean searching through job
            platforms, company career pages, LinkedIn posts and different
            online communities.
          </p>

          <p className="mt-3 leading-7 text-muted-foreground">
            We started building JobNetWork with a simple goal — to make
            opportunities easier to find and keep track of, for
            everyone from students and freshers to experienced professionals.
          </p>
        </div>

        {/* What JobNetWork is */}
        <div>
          <h2 className="font-display text-2xl">What is JobNetWork?</h2>

          <p className="mt-3 leading-7 text-muted-foreground">
            JobNetWork is a job discovery platform for job seekers at every
            level. We bring jobs, internships and other career opportunities
            together so they are easier to discover.
          </p>

          <p className="mt-3 leading-7 text-muted-foreground">
            Alongside the website, we share newly added opportunities through
            our WhatsApp community and LinkedIn newsletter, giving people
            different ways to stay updated.
          </p>
        </div>

        {/* What you can find */}
        <div>
          <h2 className="font-display text-2xl">
            What you can find on JobNetWork
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Jobs across different roles and experience levels",
              "Internships and apprenticeships",
              "Fresher and graduate opportunities",
              "Opportunities for students and early-career job seekers",
              "Career resources and updates",
              "Opportunities across different locations",
            ].map((item) => (
              <div key={item} className="pinned-card p-5">
                <p className="text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="font-display text-2xl">How we share opportunities</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-6">
              <div className="text-sm font-semibold tracking-wider text-board">01</div>

              <h3 className="mt-4 font-semibold">Browse</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Explore available jobs and internships through the JobNetWork
                website.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-sm font-semibold tracking-wider text-board">02</div>

              <h3 className="mt-4 font-semibold">Stay updated</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Join our WhatsApp community to receive newly shared
                opportunities directly.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-sm font-semibold tracking-wider text-board">03</div>

              <h3 className="mt-4 font-semibold">Follow our updates</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Follow our LinkedIn newsletter for job opportunities and
                career-related updates.
              </p>
            </div>
          </div>
        </div>

        {/* Growing with the community */}
        <div>
          <h2 className="font-display text-2xl">Growing with the community</h2>

          <p className="mt-3 leading-7 text-muted-foreground">
            JobNetWork is still growing. We’re continuously improving the
            website, adding new opportunities and listening to feedback from
            the people who use it.
          </p>

          <p className="mt-3 leading-7 text-muted-foreground">
            Our goal is to build something genuinely useful for job seekers
            rather than simply adding another place
            to search for jobs.
          </p>
        </div>

        {/* Free access / safety */}
        <div className="pinned-card p-6">
          <h2 className="font-display text-2xl">Free for job seekers</h2>

          <p className="mt-3 leading-7 text-muted-foreground">
            JobNetWork does not charge candidates a registration fee to access
            or apply for the opportunities listed on the platform.
          </p>

          <p className="mt-3 leading-7 text-muted-foreground">
            Always check the original employer or application page before
            applying, and never send money to someone simply because they
            promise a job or internship.
          </p>
        </div>

        {/* Goal */}
        <div>
          <h2 className="font-display text-2xl">What we’re building toward</h2>

          <p className="mt-3 leading-7 text-muted-foreground">
            We want JobNetWork to become a useful place for job seekers at every
            stage to discover opportunities, stay updated and access helpful
            career resources. Our interview guides and 1:1 calls are aimed at
            students and freshers.
          </p>
        </div>

        {/* Closing */}
        <div className="border-t pt-8">
          <p className="text-sm text-muted-foreground">
            — The JobNetWork team
          </p>
        </div>
      </section>
    </main>
  );
}

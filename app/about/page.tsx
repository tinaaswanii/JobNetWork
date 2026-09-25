import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About JobNetWork",
  description:
    "Learn about JobNetWork, a platform helping students, freshers and early-career job seekers find jobs, internships and career opportunities.",
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
            Making jobs, internships and early-career opportunities easier to
            find and keep up with.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-12">
        {/* Why we started */}
        <div>
          <h2 className="font-display text-2xl">Why we started JobNetWork</h2>

          <p className="mt-3 leading-7 text-ink/75">
            Finding a job or internship can mean searching through job
            platforms, company career pages, LinkedIn posts and different
            online communities.
          </p>

          <p className="mt-3 leading-7 text-ink/75">
            We started building JobNetWork with a simple goal — to make
            opportunities easier to find and keep track of, especially for
            students, freshers and people starting their careers.
          </p>
        </div>

        {/* What JobNetWork is */}
        <div>
          <h2 className="font-display text-2xl">What is JobNetWork?</h2>

          <p className="mt-3 leading-7 text-ink/75">
            JobNetWork is a job discovery platform focused on students,
            freshers and early-career job seekers. We bring jobs, internships
            and other career opportunities together so they are easier to
            discover.
          </p>

          <p className="mt-3 leading-7 text-ink/75">
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
              "Student and early-career opportunities",
              "Career resources and updates",
              "Opportunities across different locations",
            ].map((item) => (
              <div key={item} className="pinned-card p-5 pl-7">
                <p className="text-ink/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="font-display text-2xl">How we share opportunities</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-6">
              <div className="text-2xl">🔎</div>

              <h3 className="mt-4 font-semibold">Browse</h3>

              <p className="mt-2 text-sm leading-6 text-ink/70">
                Explore available jobs and internships through the JobNetWork
                website.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-2xl">📲</div>

              <h3 className="mt-4 font-semibold">Stay updated</h3>

              <p className="mt-2 text-sm leading-6 text-ink/70">
                Join our WhatsApp community to receive newly shared
                opportunities directly.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-2xl">📰</div>

              <h3 className="mt-4 font-semibold">Follow our updates</h3>

              <p className="mt-2 text-sm leading-6 text-ink/70">
                Follow our LinkedIn newsletter for job opportunities and
                career-related updates.
              </p>
            </div>
          </div>
        </div>

        {/* Growing with the community */}
        <div>
          <h2 className="font-display text-2xl">Growing with the community</h2>

          <p className="mt-3 leading-7 text-ink/75">
            JobNetWork is still growing. We’re continuously improving the
            website, adding new opportunities and listening to feedback from
            the people who use it.
          </p>

          <p className="mt-3 leading-7 text-ink/75">
            Our goal is to build something genuinely useful for students and
            early-career job seekers rather than simply adding another place
            to search for jobs.
          </p>
        </div>

        {/* Free access / safety */}
        <div className="pinned-card p-6 pl-8">
          <h2 className="font-display text-2xl">Free for job seekers</h2>

          <p className="mt-3 leading-7 text-ink/75">
            JobNetWork does not charge candidates a registration fee to access
            or apply for the opportunities listed on the platform.
          </p>

          <p className="mt-3 leading-7 text-ink/75">
            Always check the original employer or application page before
            applying, and never send money to someone simply because they
            promise a job or internship.
          </p>
        </div>

        {/* Goal */}
        <div>
          <h2 className="font-display text-2xl">What we’re building toward</h2>

          <p className="mt-3 leading-7 text-ink/75">
            We want JobNetWork to become a useful place for students, freshers
            and early-career job seekers to discover opportunities, stay
            updated and access helpful career resources.
          </p>
        </div>

        {/* Closing */}
        <div className="border-t border-ink/10 pt-8">
          <p className="font-display text-xl">
            Stay calm. Start applying.
          </p>

          <p className="mt-3 text-sm text-ink/60">
            — The JobNetWork team
          </p>
        </div>
      </section>
    </main>
  );
}

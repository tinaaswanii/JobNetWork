export const metadata = {
  title: "About JobNetWork",
  description:
    "Learn about JobNetWork, a platform helping students, freshers and job seekers find jobs, internships and career opportunities.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="bg-board text-paper px-6 py-12 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl">About JobNetWork</h1>
          <p className="mt-4 max-w-2xl text-paper/80">
            Making jobs, internships and career opportunities easier to find
            and share.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-10">
        <div>
          <h2 className="font-display text-2xl">Why JobNetWork started</h2>
          <p className="mt-3 leading-7 text-ink/75">
            Finding a job or internship shouldn't mean searching through
            dozens of websites, social media posts and scattered links every
            day.
          </p>
          <p className="mt-3 leading-7 text-ink/75">
            I started JobNetWork with a simple goal — to make career
            opportunities easier to find and share, especially for students,
            freshers and job seekers.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl">What you can find here</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Jobs across different roles and experience levels",
              "Internships and apprenticeships",
              "Fresher and graduate opportunities",
              "Hackathons and student opportunities",
              "Career resources and guidance",
              "Opportunities across different locations",
            ].map((item) => (
              <div key={item} className="pinned-card p-5 pl-7">
                <p className="text-ink/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl">Built with job seekers in mind</h2>
          <p className="mt-3 leading-7 text-ink/75">
            JobNetWork is still growing. We're continuously improving the
            website, adding new opportunities and working on ways to make
            searching and sharing jobs simpler.
          </p>
          <p className="mt-3 leading-7 text-ink/75">
            Alongside the website, we also share opportunities through our
            community so useful openings can reach more students and job
            seekers.
          </p>
        </div>

        <div className="pinned-card p-6 pl-8">
          <h2 className="font-display text-2xl">No registration fees</h2>
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

        <div>
          <h2 className="font-display text-2xl">Our goal</h2>
          <p className="mt-3 leading-7 text-ink/75">
            We want JobNetWork to be more than a list of job links. The goal
            is to create a useful place where students and job seekers can
            find opportunities, share them with others and access
            career-related resources.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-8">
          <p className="font-display text-xl">
            Built for job seekers. Growing with the community.
          </p>
          <p className="mt-3 text-sm text-ink/60">
            — Tina, Founder of JobNetWork
          </p>
        </div>
      </section>
    </main>
  );
}

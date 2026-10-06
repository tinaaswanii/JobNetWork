import { testimonials } from "@/lib/testimonials";

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="border-t px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl">
          What people are saying
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={i} className="pinned-card flex flex-col p-6 pl-8">
              <blockquote className="text-sm leading-6 text-ink/80">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-ink">{t.name}</span>
                <span className="mt-0.5 block text-xs text-ink/50">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

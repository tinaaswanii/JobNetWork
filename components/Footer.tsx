const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/job-net-work/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.41v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.32 7.41a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.54 20.45H7.1V8.98H3.54v11.47z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.89c0 2.09.55 4.13 1.59 5.92L.07 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.89 0-3.18-1.24-6.16-3.42-8.4zm-8.47 18.25h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.89 9.89 0 1 1 8.4 4.65zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      </svg>
    ),
  },
  {
    name: "Newsletter",
    href: "https://www.linkedin.com/newsletters/jobnetwork-job-drops-7509184400451010561",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/tinaaswanii/JobNetWork",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.26c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5z" />
      </svg>
    ),
  },
  {
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/jobnetwork",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M13.8 12.5H10V8.25h3.8c1.2 0 2.05.9 2.05 2.13s-.85 2.12-2.05 2.12zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.8 13.5H10V18H7.5V6H14c2.72 0 4.55 1.73 4.55 4.38 0 2.7-1.83 5.12-4.75 5.12z" />
      </svg>
    ),
  },
];

const exploreLinks = [
  { name: "Jobs", href: "/" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl">JobNetWork</h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground md:max-w-sm">
              Jobs, internships and career opportunities for students,
              freshers and early-career job seekers.
            </p>

            <p className="mt-4 text-sm font-medium">
              Stay calm. Start applying.
            </p>
          </div>

          {/* Explore */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold">Explore</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              {exploreLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground transition hover:text-ink"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="mt-10 border-t pt-8">
          <h3 className="text-center text-sm font-semibold">
            Connect With Us
          </h3>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`JobNetWork on ${link.name}`}
                title={link.name}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}

            {/* Feedback */}
            <a
              href="https://wa.me/916262158299"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send feedback to JobNetWork"
              title="Feedback"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.2 9.2 0 0 1-4-.9L3 20l1.1-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 1 1 21 11.5z" />
              </svg>
              <span>Feedback</span>
            </a>

            {/* Email */}
            <a
              href="mailto:thedigitalldreamerr@gmail.com"
              aria-label="Email JobNetWork"
              title="Email"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                <path d="m22 6-10 7L2 6" />
              </svg>
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JobNetWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import {
  Linkedin,
  MessageCircle,
  Mail,
  Github,
  ExternalLink,
  ThumbsUp,
} from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/job-net-work/",
      icon: Linkedin,
      label: "LinkedIn",
    },
    {
      name: "WhatsApp",
      href: "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok",
      icon: MessageCircle,
      label: "WhatsApp",
    },
    {
      name: "Newsletter",
      href: "https://www.linkedin.com/newsletters/jobnetwork-job-drops-7509184400451010561",
      icon: Mail,
      label: "Newsletter",
    },
    {
      name: "GitHub",
      href: "https://github.com/tinaaswanii/JobNetWork",
      icon: Github,
      label: "GitHub",
    },
    {
      name: "Product Hunt",
      href: "https://www.producthunt.com/products/jobnetwork?utm_source=other&utm_medium=social",
      icon: ThumbsUp,
      label: "Product Hunt",
    },
  ];

  return (
    <footer className="mt-12 border-t px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-sm font-semibold text-ink">
            Connect With Us
          </h3>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`JobNetWork on ${link.name}`}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
                >
                  <Icon size={17} strokeWidth={2} />
                  <span>{link.label}</span>
                  <ExternalLink
                    size={13}
                    strokeWidth={1.8}
                    className="hidden opacity-50 sm:block"
                  />
                </a>
              );
            })}

            <a
              href="https://wa.me/916262158299"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send feedback to JobNetWork"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
            >
              <MessageCircle size={17} strokeWidth={2} />
              <span>Feedback</span>
            </a>

            <a
              href="mailto:thedigitalldreamerr@gmail.com"
              aria-label="Email JobNetWork"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-muted/40 sm:px-4"
            >
              <Mail size={17} strokeWidth={2} />
              <span>Email</span>
            </a>
          </div>

          <p className="mt-6 max-w-md text-xs leading-5 text-muted-foreground">
            Jobs, internships and career opportunities for students and
            freshers.
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} JobNetWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

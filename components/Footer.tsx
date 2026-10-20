import Link from "next/link";
import {
  CONTACT_EMAIL,
  FEEDBACK_WHATSAPP_URL,
} from "@/lib/config";

const TOPMATE_URL =
  "https://topmate.io/getyourjob?utm_source=public_profile&utm_campaign=getyourjob";

const iconCls = "h-5 w-5 shrink-0";

function SvgFill({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconCls} aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

function SvgStroke({ d }: { d: string | string[] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconCls} aria-hidden="true" focusable="false">
      {(Array.isArray(d) ? d : [d]).map((x) => (
        <path key={x} d={x} />
      ))}
    </svg>
  );
}

const MAIL_PATHS = ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m22 6-10 7L2 6"];
const CHAT_PATH = "M21 11.5a8.38 8.38 0 0 1-9 8.5 9.2 9.2 0 0 1-4-.9L3 20l1.1-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 1 1 21 11.5z";
const BOOK_PATHS = ["M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", "M8 7h8M8 11h8M8 15h5"];

type FooterLink = { name: string; href: string; icon?: React.ReactNode; note?: string };

const exploreLinks: FooterLink[] = [
  { name: "Jobs", href: "/jobs" },
  { name: "Prep Trek", href: "/prep-trek" },
  { name: "Guides", href: "/guides" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "About", href: "/about" },
];

const communityLinks: FooterLink[] = [
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok",
    icon: <SvgFill d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.89c0 2.09.55 4.13 1.59 5.92L.07 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.89 0-3.18-1.24-6.16-3.42-8.4zm-8.47 18.25h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.89 9.89 0 1 1 8.4 4.65zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />,
  },
  {
    name: "Telegram",
    href: "https://t.me/job_net_work",
    icon: <SvgFill d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.3 1.8 11.8c-1-.3-1-1 .2-1.5L20.4 3.2c.9-.3 1.6.2 1.5 1.1z" />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/job-net-work/",
    icon: <SvgFill d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.41v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.32 7.41a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.54 20.45H7.1V8.98H3.54v11.47z" />,
  },
  {
    name: "Newsletter",
    href: "https://www.linkedin.com/newsletters/jobnetwork-job-drops-7509184400451010561",
    icon: <SvgStroke d={MAIL_PATHS} />,
  },
  {
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/jobnetwork",
    icon: <SvgFill d="M13.8 12.5H10V8.25h3.8c1.2 0 2.05.9 2.05 2.13s-.85 2.12-2.05 2.12zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.8 13.5H10V18H7.5V6H14c2.72 0 4.55 1.73 4.55 4.38 0 2.7-1.83 5.12-4.75 5.12z" />,
  },
  {
    name: "GitHub",
    href: "https://github.com/tinaaswanii/JobNetWork",
    icon: <SvgFill d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.26c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5z" />,
  },
];

const supportLinks: FooterLink[] = [
  { name: "Feedback", href: FEEDBACK_WHATSAPP_URL, icon: <SvgStroke d={CHAT_PATH} />, note: "on WhatsApp" },
  { name: "Email", href: `mailto:${CONTACT_EMAIL}`, icon: <SvgStroke d={MAIL_PATHS} /> },
  { name: "Book a 1:1 session", href: TOPMATE_URL, icon: <SvgStroke d={BOOK_PATHS} />, note: "for students and freshers" },
];

const linkCls =
  "inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded text-sm text-muted-foreground transition hover:text-ink";

function LinkGroup({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-2 flex flex-col">
        {links.map((l) => {
          const internal = l.href.startsWith("/");
          const mail = l.href.startsWith("mailto:");
          const content = (
            <>
              {l.icon}
              <span>
                {l.name}
                {l.note && <span className="block text-xs text-muted-foreground/90">{l.note}</span>}
              </span>
              {!internal && !mail && <span className="sr-only"> (opens in a new tab)</span>}
            </>
          );
          return (
            <li key={l.name}>
              {internal ? (
                <Link href={l.href} className={linkCls}>
                  {content}
                </Link>
              ) : (
                <a
                  href={l.href}
                  {...(mail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  className={linkCls}
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="mt-12 border-t px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl">JobNetWork</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Jobs, internships and career opportunities at every level, from
              first jobs to senior roles.
            </p>
          </div>

          <LinkGroup title="Explore" links={exploreLinks} />
          <LinkGroup title="Community" links={communityLinks} />
          <LinkGroup title="Support" links={supportLinks} />
        </div>

        {/* Featured on */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Featured on</p>
          <a
            href="https://shipthing.com/projects/jobnetwork?utm_source=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://shipthing.com/shipthing/images/badges/featured-on-light.svg"
              alt="Featured on ShipThing"
              style={{ height: "40px", width: "auto" }}
            />
          </a>
          <a
            href="https://lookingfortools.com/projects/jobnetwork?utm_source=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lookingfortools.com/lookingfortools/images/badges/featured-on-light.svg"
              alt="Featured on Looking For Tools"
              style={{ height: "40px", width: "auto" }}
            />
          </a>
        </div>

        <div className="mt-6 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JobNetWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

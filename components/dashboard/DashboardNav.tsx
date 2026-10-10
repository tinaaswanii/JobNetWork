"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { name: "Overview", href: "/dashboard" },
  { name: "Applications", href: "/dashboard/applications" },
  { name: "Saved jobs", href: "/dashboard/saved-jobs" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="mb-8 flex gap-1 border-b">
      {items.map((i) => {
        const active = i.href === "/dashboard" ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm ${
              active
                ? "border-board font-semibold text-ink"
                : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            {i.name}
          </Link>
        );
      })}
    </nav>
  );
}

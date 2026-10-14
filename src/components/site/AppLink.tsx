import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Drop-in for the old Next.js `<Link href>`. Same-site paths use the router
 * (client navigation); external URLs, mailto:, in-page #hashes and static
 * files under /public use a plain anchor.
 */
export default function AppLink({ href, children, ...rest }: Props) {
  const isStaticFile = /\.[a-z0-9]+(\?.*)?$/i.test(href.split("#")[0] ?? "");
  if (EXTERNAL.test(href) || href.startsWith("#") || isStaticFile) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  const url = new URL(href, "http://local");
  const search = Object.fromEntries(url.searchParams.entries());
  // Only pass search/hash when present (exactOptionalPropertyTypes forbids undefined).
  const extras = {
    ...(Object.keys(search).length ? { search } : {}),
    ...(url.hash ? { hash: url.hash.slice(1) } : {}),
  };
  // Anchor attributes pass straight through; the cast is needed because the
  // router's link props are stricter about `undefined` than DOM attributes.
  const linkProps = { ...extras, ...rest };
  return (
    <Link
      // The target is a runtime string, so it can't satisfy the typed route union.
      to={url.pathname as never}
      {...(linkProps as Record<string, never>)}
    >
      {children}
    </Link>
  );
}

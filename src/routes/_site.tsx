import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/site/Footer";
import SiteHeader from "@/components/site/SiteHeader";

// Pathless layout: header + footer for the public JobNetWork pages
// (about, guides, prep-trek, testimonials, match). URLs are unaffected.
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      <SiteHeader />
      <Outlet />
      <Footer />
    </div>
  );
}

import DashboardNav from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-8 md:px-12">
      <DashboardNav />
      {children}
    </main>
  );
}

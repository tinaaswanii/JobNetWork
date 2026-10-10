import type { Metadata } from "next";
import { supabaseServer } from "@/lib/auth/server";
import type { Application } from "@/lib/applications";
import ApplicationsTracker from "@/components/dashboard/ApplicationsTracker";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { new?: string; open?: string };
}) {
  const { data, error } = await supabaseServer()
    .from("applications")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <ApplicationsTracker
      applications={(data ?? []) as Application[]}
      openNew={searchParams.new === "1"}
      openId={searchParams.open}
    />
  );
}

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { PublicJob } from "@/lib/jobs/types";
import { formatSalary } from "@/components/jobs/JobCard";

export default function SaveJobButton({ job }: { job: PublicJob }) {
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    setState("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState("idle");
      toast("Sign in to save jobs to your tracker");
      navigate({ to: "/auth" });
      return;
    }

    const salary = formatSalary(job);
    const { data: inserted, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_title: job.title,
        company: job.company,
        job_url: job.url,
        location: job.location,
        salary,
        status: "saved",
        notes: `Saved from JobNetWork listing (${job.slug})`,
      })
      .select("id")
      .single();

    if (error) {
      setState("idle");
      toast.error("Couldn't save this job — try again");
      return;
    }

    await supabase.from("application_activity").insert({
      application_id: inserted.id,
      user_id: user.id,
      event: "Saved from job listing",
    });

    setState("saved");
    toast.success("Saved to your tracker");
  }

  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
        <BookmarkCheck className="h-4 w-4" /> Saved to tracker
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={state === "saving"}
      className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
    >
      <Bookmark className="h-4 w-4" />
      {state === "saving" ? "Saving…" : "Save to tracker"}
    </button>
  );
}

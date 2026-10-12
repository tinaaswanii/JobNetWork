import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, Trash2, MapPin, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Application = Tables<"applications">;
type Interview = Tables<"interviews">;

const emptyInterview = { round: "", scheduled_at: "", location: "", notes: "" };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ApplicationDetail({
  application,
  open,
  onOpenChange,
}: {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyInterview);
  const [editingId, setEditingId] = useState<string | null>(null);
  const appId = application?.id;

  const { data: interviews = [] } = useQuery({
    queryKey: ["interviews", appId],
    enabled: !!appId && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("application_id", appId!)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["activity", appId],
    enabled: !!appId && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_activity")
        .select("*")
        .eq("application_id", appId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["interviews", appId] });
    queryClient.invalidateQueries({ queryKey: ["activity", appId] });
    queryClient.invalidateQueries({ queryKey: ["upcoming-interviews"] });
  }

  const saveInterview = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !appId) throw new Error("Not signed in");
      const payload = {
        round: form.round.trim(),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editingId) {
        const { error } = await supabase
          .from("interviews")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        await supabase.from("application_activity").insert({
          application_id: appId,
          user_id: user.id,
          event: `Interview updated: ${payload.round}`,
        });
      } else {
        const { error } = await supabase
          .from("interviews")
          .insert({ ...payload, application_id: appId, user_id: user.id });
        if (error) throw error;
        await supabase.from("application_activity").insert({
          application_id: appId,
          user_id: user.id,
          event: `Interview scheduled: ${payload.round}`,
        });
      }
    },
    onSuccess: () => {
      invalidate();
      setForm(emptyInterview);
      setEditingId(null);
      toast.success(editingId ? "Interview updated" : "Interview scheduled");
    },
    onError: () => toast.error("Could not save the interview. Please try again."),
  });

  const deleteInterview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("interviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Interview removed");
    },
    onError: () => toast.error("Could not remove the interview."),
  });

  function startEdit(iv: Interview) {
    setEditingId(iv.id);
    setForm({
      round: iv.round ?? "",
      scheduled_at: toLocalInput(iv.scheduled_at),
      location: iv.location ?? "",
      notes: iv.notes ?? "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {application?.job_title} · {application?.company}
          </DialogTitle>
        </DialogHeader>

        <section className="grid gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarPlus className="h-4 w-4" /> Interviews
          </h3>
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No interviews scheduled yet.
            </p>
          ) : (
            <ul className="grid gap-2">
              {interviews.map((iv) => (
                <li
                  key={iv.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{iv.round}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(iv.scheduled_at).toLocaleString()}
                    </p>
                    {iv.location && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {iv.location}
                      </p>
                    )}
                    {iv.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">{iv.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(iv)}
                      aria-label="Edit interview"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInterview.mutate(iv.id)}
                      aria-label="Delete interview"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form
            className="grid gap-3 rounded-lg border bg-muted/40 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveInterview.mutate();
            }}
          >
            <p className="text-sm font-medium">
              {editingId ? "Edit interview" : "Schedule an interview"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="iv-round">Round *</Label>
                <Input
                  id="iv-round"
                  required
                  placeholder="e.g. Phone screen"
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="iv-when">Date & time *</Label>
                <Input
                  id="iv-when"
                  required
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="iv-location">Location / link</Label>
              <Input
                id="iv-location"
                placeholder="Office address or video link"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="iv-notes">Notes</Label>
              <Textarea
                id="iv-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saveInterview.isPending}>
                {saveInterview.isPending
                  ? "Saving…"
                  : editingId
                    ? "Save changes"
                    : "Add interview"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyInterview);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="grid gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4" /> Activity
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="grid gap-2 border-l pl-4">
              {activity.map((ev) => (
                <li key={ev.id} className="text-sm">
                  <span className="font-medium">{ev.event}</span>
                  <span className="ml-2 text-muted-foreground">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

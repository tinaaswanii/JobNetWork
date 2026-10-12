import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ExternalLink,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { ApplicationDetail } from "@/components/tracker/ApplicationDetail";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — JobNetWork Tracker" },
      { name: "description", content: "Your private job application dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Application = Tables<"applications">;

const STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

const statusVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  saved: "outline",
  applied: "secondary",
  interviewing: "default",
  offer: "default",
  rejected: "destructive",
};

const emptyForm = {
  job_title: "",
  company: "",
  job_url: "",
  location: "",
  salary: "",
  status: "saved",
  notes: "",
  applied_at: "",
};

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detail, setDetail] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ["upcoming-interviews"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const in14days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("interviews")
        .select("*, applications(job_title, company)")
        .gte("scheduled_at", now)
        .lte("scheduled_at", in14days)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        job_title: form.job_title.trim(),
        company: form.company.trim(),
        job_url: form.job_url.trim() || null,
        location: form.location.trim() || null,
        salary: form.salary.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
        applied_at: form.applied_at || null,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase
          .from("applications")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        await supabase.from("application_activity").insert({
          application_id: editing.id,
          user_id: user.id,
          event: `Updated application (status: ${form.status})`,
        });
      } else {
        const insert: TablesInsert<"applications"> = { ...payload, user_id: user.id };
        const { data, error } = await supabase
          .from("applications")
          .insert(insert)
          .select("id")
          .single();
        if (error) throw error;
        await supabase.from("application_activity").insert({
          application_id: data.id,
          user_id: user.id,
          event: "Application created",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      toast.success(editing ? "Application updated" : "Application added");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setDeleting(null);
      toast.success("Application deleted");
    },
    onError: () => toast.error("Could not delete. Please try again."),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function openEdit(app: Application) {
    setEditing(app);
    setForm({
      job_title: app.job_title,
      company: app.company,
      job_url: app.job_url ?? "",
      location: app.location ?? "",
      salary: app.salary ?? "",
      status: app.status,
      notes: app.notes ?? "",
      applied_at: app.applied_at ? app.applied_at.slice(0, 10) : "",
    });
    setDialogOpen(true);
  }

  const filtered =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">JobNetWork Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs">Browse jobs</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-sm text-muted-foreground">
              {applications.length} total · {counts["interviewing"] ?? 0} interviewing ·{" "}
              {counts["offer"] ?? 0} offers
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add application
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
            Filter:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {upcoming.length > 0 && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="h-4 w-4" /> Upcoming interviews (next 14 days)
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {upcoming.map((iv) => (
                <li
                  key={iv.id}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <p className="font-medium">
                    {iv.round} — {iv.applications?.job_title} at{" "}
                    {iv.applications?.company}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(iv.scheduled_at).toLocaleString()}
                    {iv.location ? ` · ${iv.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No applications yet. Click "Add application" to start tracking.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(app)}
                  >
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1">
                        {app.job_title}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary"
                            aria-label="Open job posting"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[app.status] ?? "secondary"} className="capitalize">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(app)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(app)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit application" : "Add application"}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="job_title">Job title *</Label>
              <Input
                id="job_title"
                required
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  placeholder="e.g. $120k–$150k"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job_url">Job posting URL</Label>
              <Input
                id="job_url"
                type="url"
                placeholder="https://…"
                value={form.job_url}
                onChange={(e) => setForm({ ...form, job_url: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="applied_at">Applied on</Label>
                <Input
                  id="applied_at"
                  type="date"
                  value={form.applied_at}
                  onChange={(e) => setForm({ ...form, applied_at: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Add application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ApplicationDetail
        application={detail}
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.job_title} at {deleting?.company} will be permanently
              removed, along with its interviews and activity history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

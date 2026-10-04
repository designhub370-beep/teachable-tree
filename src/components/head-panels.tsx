import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { eventsQuery, inboxQuery, teachersQuery } from "@/lib/queries";
import { deleteEvent, deleteTeacher, markContacted, saveEvent, saveTeacher, type Section } from "@/lib/extras.functions";
import { uploadFile } from "@/lib/upload";
import { tel } from "./site-chrome";

const input = "w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const card = "rounded-2xl border border-border bg-card p-5 shadow-soft";
const lbl = "text-xs text-muted-foreground";
const btn = "rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-60";

/* ---------- Inbox ---------- */
export function InboxPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ ...inboxQuery, refetchInterval: 30000 });
  const adm = data?.admissions ?? [];
  const reg = data?.registrations ?? [];
  const fresh = adm.filter((a) => !a.contacted).length;
  return (
    <div className={`${card} border-primary/50`}>
      <h2 className="text-xl font-bold">New Admission Enquiries {fresh > 0 && <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">{fresh} new</span>}</h2>
      {adm.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No admission enquiries have arrived yet.</p>}
      <div className="mt-3 divide-y divide-border">
        {adm.map((a) => (
          <div key={a.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${a.contacted ? "opacity-50" : ""}`}>
            <div className="min-w-0">
              <p className="font-semibold">{a.student_name} <span className="text-xs text-muted-foreground">· {a.class_name}</span></p>
              <p className="text-xs text-muted-foreground">{a.parent_name && `Parent: ${a.parent_name} · `}{new Date(a.created_at).toLocaleString("en-IN")}</p>
              {a.message && <p className="text-sm text-muted-foreground">{a.message}</p>}
            </div>
            <div className="flex gap-2">
              <a href={tel(a.phone)} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground"><Phone className="size-4" /> {a.phone}</a>
              <button onClick={async () => { await markContacted({ data: { id: a.id, contacted: !a.contacted } }); qc.invalidateQueries({ queryKey: ["inbox"] }); }} className="rounded-xl border border-border px-3 py-2 text-sm">
                {a.contacted ? "Mark as pending" : "Mark as contacted ✓"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {reg.length > 0 && (
        <>
          <h3 className="mt-6 font-bold">Event registrations</h3>
          <div className="mt-2 divide-y divide-border">
            {reg.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span><b>{r.student_name}</b> · {r.class_name}{r.age ? ` · ${r.age} yrs` : ""} — <span className="text-primary">{(r.events as { title?: string } | null)?.title}</span></span>
                <a href={tel(r.phone)} className="font-semibold text-accent">{r.phone}</a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Events ---------- */
type EvForm = { id?: string; title: string; event_date: string | null; status: "upcoming" | "past"; description: string; class_range: string; age_rule: string; rules: string; photo_paths: string[] };
const emptyEv: EvForm = { title: "", event_date: "", status: "upcoming", description: "", class_range: "", age_rule: "", rules: "", photo_paths: [] };

export function EventsPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(eventsQuery);
  const [edit, setEdit] = useState<EvForm | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Explore Gallery / Events</h2>
        <button onClick={() => setEdit({ ...emptyEv })} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground"><Plus className="size-4" /> Add event</button>
      </div>
      {edit && (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-primary/40 bg-background/40 p-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const files = (e.currentTarget.elements.namedItem("photos") as HTMLInputElement).files;
              const newPaths = files ? await Promise.all(Array.from(files).map(uploadFile)) : [];
              await saveEvent({ data: { ...edit, photo_paths: [...edit.photo_paths, ...newPaths] } });
              toast.success("Event saved and published on the website");
              setEdit(null);
              qc.invalidateQueries({ queryKey: ["events"] });
            } catch (err) { toast.error((err as Error).message); }
            setBusy(false);
          }}
        >
          <label className={`${lbl} sm:col-span-2`}>Event name<input required className={input} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
          <label className={lbl}>Date<input type="date" className={input} value={edit.event_date ?? ""} onChange={(e) => setEdit({ ...edit, event_date: e.target.value })} /></label>
          <label className={lbl}>Status
            <select className={input} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as EvForm["status"] })}>
              <option value="upcoming">Upcoming (with registration form)</option><option value="past">Past (photographs only)</option>
            </select>
          </label>
          <label className={lbl}>Eligible class range<input placeholder="For example: Classes 6 to 10" className={input} value={edit.class_range} onChange={(e) => setEdit({ ...edit, class_range: e.target.value })} /></label>
          <label className={lbl}>Age requirement<input placeholder="For example: 12–16 years" className={input} value={edit.age_rule} onChange={(e) => setEdit({ ...edit, age_rule: e.target.value })} /></label>
          <label className={`${lbl} sm:col-span-2`}>Description<textarea rows={2} className={input} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
          <label className={`${lbl} sm:col-span-2`}>Rules (enter one rule per line)<textarea rows={3} className={input} value={edit.rules} onChange={(e) => setEdit({ ...edit, rules: e.target.value })} /></label>
          <label className={`${lbl} sm:col-span-2`}>Add photographs (multiple files allowed)<input name="photos" type="file" multiple accept="image/*" className={input} /></label>
          {edit.photo_paths.length > 0 && (
            <p className="text-xs text-muted-foreground sm:col-span-2">{edit.photo_paths.length} photographs are already attached. <button type="button" className="underline" onClick={() => setEdit({ ...edit, photo_paths: [] })}>Remove all</button></p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={busy} className={btn}>{busy ? "Uploading..." : "Save"}</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-xl border border-border px-4 py-2.5">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4 divide-y divide-border">
        {data.map((ev) => (
          <div key={ev.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {ev.photos[0] && <img src={ev.photos[0]} alt="" className="size-12 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="truncate font-semibold">{ev.title}</p>
                <p className="text-xs text-muted-foreground">{ev.status === "upcoming" ? "Upcoming" : "Past"} · {ev.event_date ?? "—"} · {ev.photos.length} photos</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button aria-label="Edit" onClick={() => setEdit({ id: ev.id, title: ev.title, event_date: ev.event_date, status: ev.status as EvForm["status"], description: ev.description, class_range: ev.class_range, age_rule: ev.age_rule, rules: ev.rules, photo_paths: ev.photo_paths })} className="rounded-lg border border-border p-2"><Pencil className="size-4" /></button>
              <button aria-label="Delete" onClick={async () => { if (!confirm("Delete this event?")) return; await deleteEvent({ data: { id: ev.id } }); qc.invalidateQueries({ queryKey: ["events"] }); }} className="rounded-lg border border-border p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Teachers ---------- */
type TForm = { id?: string; name: string; photo_path: string; qualification: string; subjects: string; sort_order: number; sections: Section[] };
const emptyT: TForm = { name: "", photo_path: "", qualification: "", subjects: "", sort_order: 100, sections: [] };

export function TeachersPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(teachersQuery);
  const [edit, setEdit] = useState<TForm | null>(null);
  const [busy, setBusy] = useState(false);
  const setSec = (i: number, s: Section) => edit && setEdit({ ...edit, sections: edit.sections.map((x, j) => (j === i ? s : x)) });
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Teachers & Qualification</h2>
        <button onClick={() => setEdit({ ...emptyT })} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground"><Plus className="size-4" /> Add teacher</button>
      </div>
      {edit && (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-primary/40 bg-background/40 p-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const file = (e.currentTarget.elements.namedItem("photo") as HTMLInputElement).files?.[0];
              const photo_path = file ? await uploadFile(file) : edit.photo_path;
              await saveTeacher({ data: { ...edit, photo_path } });
              toast.success("Teacher profile saved");
              setEdit(null);
              qc.invalidateQueries({ queryKey: ["teachers"] });
            } catch (err) { toast.error((err as Error).message); }
            setBusy(false);
          }}
        >
          <label className={lbl}>Name<input required className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
          <label className={lbl}>Subjects taught<input placeholder="Mathematics, Physics" className={input} value={edit.subjects} onChange={(e) => setEdit({ ...edit, subjects: e.target.value })} /></label>
          <label className={`${lbl} sm:col-span-2`}>Qualifications (enter one per line)<textarea rows={3} placeholder={"M.Sc Mathematics\nB.Ed"} className={input} value={edit.qualification} onChange={(e) => setEdit({ ...edit, qualification: e.target.value })} /></label>
          <label className={lbl}>Photo<input name="photo" type="file" accept="image/*" className={input} /></label>
          <label className={lbl}>Display order (lower numbers appear first)<input type="number" min={0} className={input} value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) || 0 })} /></label>

          <div className="space-y-3 sm:col-span-2">
            {edit.sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex gap-2">
                  <input placeholder="Heading (for example: Experience)" className={input} value={s.heading} onChange={(e) => setSec(i, { ...s, heading: e.target.value })} />
                  <button type="button" aria-label="Remove heading" onClick={() => setEdit({ ...edit, sections: edit.sections.filter((_, j) => j !== i) })}><X className="size-4" /></button>
                </div>
                {s.lines.map((l, k) => (
                  <div key={k} className="mt-2 flex gap-2">
                    <input placeholder="Line" className={input} value={l} onChange={(e) => setSec(i, { ...s, lines: s.lines.map((x, m) => (m === k ? e.target.value : x)) })} />
                    <button type="button" aria-label="Remove line" onClick={() => setSec(i, { ...s, lines: s.lines.filter((_, m) => m !== k) })}><X className="size-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setSec(i, { ...s, lines: [...s.lines, ""] })} className="mt-2 text-sm font-semibold text-primary">+ Add line</button>
              </div>
            ))}
            <button type="button" onClick={() => setEdit({ ...edit, sections: [...edit.sections, { heading: "", lines: [""] }] })} className="rounded-xl border border-dashed border-border px-3 py-2 text-sm font-semibold">+ Add heading</button>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={busy} className={btn}>{busy ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-xl border border-border px-4 py-2.5">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4 divide-y divide-border">
        {data.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {t.photo && <img src={t.photo} alt="" className="size-12 rounded-full object-cover" />}
              <div className="min-w-0"><p className="truncate font-semibold">{t.name}</p><p className="truncate text-xs text-muted-foreground">{t.subjects}</p></div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button aria-label="Edit" onClick={() => setEdit({ id: t.id, name: t.name, photo_path: t.photo_path, qualification: t.qualification, subjects: t.subjects, sort_order: t.sort_order, sections: t.sections })} className="rounded-lg border border-border p-2"><Pencil className="size-4" /></button>
              <button aria-label="Delete" onClick={async () => { if (!confirm("Remove this teacher?")) return; await deleteTeacher({ data: { id: t.id } }); qc.invalidateQueries({ queryKey: ["teachers"] }); }} className="rounded-lg border border-border p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

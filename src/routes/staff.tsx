import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, LogOut, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogoLoader } from "@/components/logo-loader";
import logo from "@/assets/logo.png";
import {
  addMaterial, createUploadUrl, deleteClass, deleteMaterial, saveClass, staffLogin, staffLogout,
  type ClassRow,
} from "@/lib/academy.functions";
import { classesQuery, materialsQuery, roleQuery } from "@/lib/queries";
import { inr } from "@/components/site-chrome";
import { EventsPanel, InboxPanel, TeachersPanel } from "@/components/head-panels";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Login — Aroma Academy of Education" },
      { name: "description", content: "Teacher aur Head ke liye material upload aur fees management." },
      { property: "og:title", content: "Staff Login — Aroma Academy" },
      { property: "og:description", content: "Teacher aur Head dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Staff,
});

const input = "w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const card = "rounded-2xl border border-border bg-card p-5 shadow-soft";

function Staff() {
  const { data, isLoading } = useQuery(roleQuery);
  const qc = useQueryClient();
  const role = data?.role;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Aroma Academy logo" width={44} height={44} className="size-11 rounded-xl bg-foreground p-1" />
          <span className="font-display text-lg font-bold">Aroma Academy <span className="text-primary">Staff</span></span>
        </Link>
        {role && (
          <button
            onClick={async () => { await staffLogout(); qc.invalidateQueries({ queryKey: ["role"] }); }}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
          >
            <LogOut className="size-4" /> Logout ({role === "head" ? "Head" : "Teacher"})
          </button>
        )}
      </div>
      {isLoading ? (
        <LogoLoader className="mx-auto mt-20" />
      ) : !role ? (
        <LoginForm />
      ) : (
        <div className="mt-8 space-y-8">
          {role === "head" && <InboxPanel />}
          <UploadPanel />
          {role === "head" && <ClassesPanel />}
          {role === "head" && <EventsPanel />}
          {role === "head" && <TeachersPanel />}
          <MaterialsPanel />
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const qc = useQueryClient();
  const [role, setRole] = useState<"teacher" | "head">("teacher");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className={`${card} mx-auto mt-14 max-w-sm`}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await staffLogin({ data: { role, password: pw } });
        setBusy(false);
        if (!r.ok) { toast.error("Galat password"); return; }
        toast.success("Login ho gaya");
        qc.invalidateQueries({ queryKey: ["role"] });
      }}
    >
      <h1 className="text-2xl font-bold">Staff Login</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["teacher", "head"] as const).map((r) => (
          <button type="button" key={r} onClick={() => setRole(r)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${role === r ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
            {r === "teacher" ? "Teacher" : "Head / Owner"}
          </button>
        ))}
      </div>
      <input type="password" required placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${input} mt-4`} />
      <button disabled={busy} className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">
        {busy ? "..." : "Login"}
      </button>
    </form>
  );
}

function UploadPanel() {
  const qc = useQueryClient();
  const { data: classes = [] } = useQuery(classesQuery);
  const [f, setF] = useState({ title: "", class_name: "", subject: "", kind: "pdf" as "pdf" | "image" | "test" | "notes", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className={card}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!file) { toast.error("File chuniye"); return; }
        setBusy(true);
        try {
          const { path, token } = await createUploadUrl({ data: { filename: file.name } });
          const { error } = await supabase.storage.from("materials").uploadToSignedUrl(path, token, file);
          if (error) throw error;
          await addMaterial({ data: { ...f, file_path: path } });
          toast.success("Upload ho gaya! Students ko dikh raha hai.");
          setF({ ...f, title: "", description: "" });
          setFile(null);
          (e.target as HTMLFormElement).reset();
          qc.invalidateQueries({ queryKey: ["materials"] });
        } catch (err) {
          toast.error((err as Error).message);
        }
        setBusy(false);
      }}
    >
      <h2 className="flex items-center gap-2 text-xl font-bold"><Upload className="size-5 text-primary" /> PDF / Image / Test upload karein</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input required maxLength={200} placeholder="Title (jaise: Ch-1 Real Numbers Notes)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
        <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as typeof f.kind })} className={input}>
          <option value="pdf">PDF</option><option value="image">Image</option><option value="test">Test / Sample paper</option><option value="notes">Notes</option>
        </select>
        <select value={f.class_name} onChange={(e) => setF({ ...f, class_name: e.target.value })} className={input}>
          <option value="">Sabhi classes</option>
          {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input maxLength={100} placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={input} />
        <input maxLength={1000} placeholder="Description (optional)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${input} sm:col-span-2`} />
        <input required type="file" accept=".pdf,image/*,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={`${input} sm:col-span-2`} />
      </div>
      <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-60">
        {busy && <Loader2 className="size-4 animate-spin" />} Upload
      </button>
    </form>
  );
}

const empty = { name: "", category: "School", subjects: "", description: "", duration: "", sale_label: "", original_price: null as number | null, sale_price: 0, sort_order: 100 };

function ClassesPanel() {
  const qc = useQueryClient();
  const { data: classes = [] } = useQuery(classesQuery);
  const [edit, setEdit] = useState<(Omit<ClassRow, "id"> & { id?: string }) | null>(null);
  const num = (v: string) => (v === "" ? null : Math.max(0, Math.round(Number(v))));
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Classes, Courses & Fees</h2>
        <button onClick={() => setEdit({ ...empty })} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
          <Plus className="size-4" /> Nayi class / college
        </button>
      </div>
      {edit && (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-primary/40 bg-background/40 p-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await saveClass({ data: { ...edit, sale_price: edit.sale_price ?? 0 } });
              toast.success("Save ho gaya");
              setEdit(null);
              qc.invalidateQueries({ queryKey: ["classes"] });
            } catch (err) { toast.error((err as Error).message); }
          }}
        >
          <label className="text-xs text-muted-foreground">Class / Course naam<input required className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Category (School, College, Govt Exam...)<input required className={input} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground sm:col-span-2">Subjects<input className={input} value={edit.subjects} onChange={(e) => setEdit({ ...edit, subjects: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Sale ka naam (jaise: Diwali Sale)<input className={input} value={edit.sale_label} onChange={(e) => setEdit({ ...edit, sale_label: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Duration<input className={input} value={edit.duration} onChange={(e) => setEdit({ ...edit, duration: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Purani price ₹ (kati hui dikhegi)<input type="number" min={0} className={input} value={edit.original_price ?? ""} onChange={(e) => setEdit({ ...edit, original_price: num(e.target.value) })} /></label>
          <label className="text-xs text-muted-foreground">Sale price ₹<input required type="number" min={0} className={input} value={edit.sale_price} onChange={(e) => setEdit({ ...edit, sale_price: num(e.target.value) ?? 0 })} /></label>
          <label className="text-xs text-muted-foreground sm:col-span-2">Description<input className={input} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Order (chhota pehle)<input type="number" min={0} className={input} value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: num(e.target.value) ?? 0 })} /></label>
          <div className="flex items-end gap-2">
            <button className="rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground">Save</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-xl border border-border px-4 py-2.5">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4 divide-y divide-border">
        {classes.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{c.name} <span className="text-xs text-muted-foreground">· {c.category}</span></p>
              <p className="text-sm">
                {c.sale_label && <span className="mr-2 text-primary">{c.sale_label}</span>}
                {c.original_price != null && c.original_price > c.sale_price && <span className="mr-2 text-muted-foreground line-through">{inr(c.original_price)}</span>}
                <span className="font-bold">{inr(c.sale_price)}</span>
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button aria-label="Edit" onClick={() => setEdit(c)} className="rounded-lg border border-border p-2"><Pencil className="size-4" /></button>
              <button aria-label="Delete" onClick={async () => {
                if (!confirm(`"${c.name}" delete karein?`)) return;
                await deleteClass({ data: { id: c.id } });
                qc.invalidateQueries({ queryKey: ["classes"] });
              }} className="rounded-lg border border-border p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsPanel() {
  const qc = useQueryClient();
  const { data: mats = [] } = useQuery(materialsQuery);
  return (
    <div className={card}>
      <h2 className="text-xl font-bold">Uploaded material ({mats.length})</h2>
      {mats.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Abhi kuch upload nahi hua.</p>}
      <div className="mt-3 divide-y divide-border">
        {mats.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 py-3">
            <a href={m.url} target="_blank" rel="noreferrer" className="min-w-0">
              <p className="truncate font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{[m.kind.toUpperCase(), m.class_name, m.subject].filter(Boolean).join(" · ")}</p>
            </a>
            <button aria-label="Delete" onClick={async () => {
              if (!confirm("Delete karein?")) return;
              await deleteMaterial({ data: { id: m.id } });
              qc.invalidateQueries({ queryKey: ["materials"] });
            }} className="rounded-lg border border-border p-2 text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

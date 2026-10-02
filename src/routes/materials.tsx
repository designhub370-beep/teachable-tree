import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, FileText, Image as ImageIcon, ClipboardList, NotebookPen, Search } from "lucide-react";
import { materialsQuery } from "@/lib/queries";

export const KIND_META: Record<string, { label: string; Icon: typeof FileText }> = {
  pdf: { label: "PDF", Icon: FileText },
  image: { label: "Image", Icon: ImageIcon },
  test: { label: "Test", Icon: ClipboardList },
  notes: { label: "Notes", Icon: NotebookPen },
};

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Study Material — Aroma Academy of Education" },
      { name: "description", content: "Rahul Sir dwara upload kiye gaye PDFs, notes, images aur test papers." },
      { property: "og:title", content: "Study Material — Aroma Academy" },
      { property: "og:description", content: "Notes, PDFs aur sample tests — students ke liye." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(materialsQuery),
  component: Materials,
});

function Materials() {
  const { data } = useSuspenseQuery(materialsQuery);
  const [kind, setKind] = useState("all");
  const [cls, setCls] = useState("all");
  const [q, setQ] = useState("");
  const classes = Array.from(new Set(data.map((m) => m.class_name).filter(Boolean)));
  const list = useMemo(
    () =>
      data.filter(
        (m) =>
          (kind === "all" || m.kind === kind) &&
          (cls === "all" || m.class_name === cls) &&
          (m.title + m.subject).toLowerCase().includes(q.toLowerCase()),
      ),
    [data, kind, cls, q],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">Study Material</h1>
      <p className="mt-3 text-muted-foreground">Notes, PDFs, images aur sample tests — seedha Rahul Sir ki taraf se.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title ya subject…" className="w-full bg-transparent py-3 outline-none" />
        </label>
        <select value={cls} onChange={(e) => setCls(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-3">
          <option value="all">Sabhi classes</option>
          {classes.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["all", ...Object.keys(KIND_META)].map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${kind === k ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
          >
            {k === "all" ? "All" : KIND_META[k]?.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Abhi koi material nahi mila.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => {
            const meta = KIND_META[m.kind] ?? KIND_META["pdf"]!;
            return (
              <article key={m.id} className="lift flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                {m.kind === "image" && m.url ? (
                  <img src={m.url} alt={m.title} loading="lazy" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="ruled grid aspect-video place-items-center bg-paper">
                    <meta.Icon className="size-10 text-primary" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{meta.label}</span>
                  <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {[m.class_name, m.subject, new Date(m.created_at).toLocaleDateString("en-IN")].filter(Boolean).join(" · ")}
                  </p>
                  {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
                  <a href={m.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink pt-2.5 pb-2.5 text-sm font-semibold text-ink-foreground mt-4">
                    <Download className="size-4" /> Open / Download
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

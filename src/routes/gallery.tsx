import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Cake, GraduationCap, ScrollText, X } from "lucide-react";
import { toast } from "sonner";
import { eventsQuery } from "@/lib/queries";
import { registerForEvent, type EventRow } from "@/lib/extras.functions";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Explore Gallery & Events — Aroma Academy of Education" },
      { name: "description", content: "Rahul Sir ke events ki photos, dates aur aane wale events mein participate karein." },
      { property: "og:title", content: "Explore Gallery — Aroma Academy" },
      { property: "og:description", content: "Past events ki photos aur upcoming events ka registration." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: Gallery,
});

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Date jaldi");

function Gallery() {
  const { data } = useSuspenseQuery(eventsQuery);
  const upcoming = data.filter((e) => e.status === "upcoming");
  const past = data.filter((e) => e.status === "past");
  const [join, setJoin] = useState<EventRow | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Explore Gallery</p>
      <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Events & Yaadein</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Rahul Sir ke saath hue events ki photos, aur aane wale events mein participate karne ka mauka.</p>

      <h2 className="mt-12 text-2xl font-bold">Aane wale events</h2>
      {upcoming.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Jaldi hi naye events announce honge.</p>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {upcoming.map((e) => (
            <article key={e.id} className="overflow-hidden rounded-3xl border border-primary/40 bg-card shadow-lift">
              {e.photos[0] && <img src={e.photos[0]} alt={e.title} loading="lazy" className="aspect-video w-full object-cover" />}
              <div className="p-5">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">Upcoming</span>
                <h3 className="mt-2 text-2xl font-bold">{e.title}</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  <p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> {fmt(e.event_date)}</p>
                  {e.class_range && <p className="flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Class: {e.class_range}</p>}
                  {e.age_rule && <p className="flex items-center gap-2"><Cake className="size-4 text-primary" /> Age: {e.age_rule}</p>}
                </div>
                {e.description && <p className="mt-3 text-muted-foreground">{e.description}</p>}
                {e.rules && (
                  <div className="mt-3 rounded-xl bg-secondary p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-bold"><ScrollText className="size-4" /> Rules</p>
                    <ul className="mt-1 list-disc pl-5 text-muted-foreground">{e.rules.split("\n").filter(Boolean).map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}
                <button onClick={() => setJoin(e)} className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground hover:opacity-90">Participate karein</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-14 text-2xl font-bold">Ho chuke events</h2>
      {past.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Photos jaldi aayengi.</p>
      ) : (
        <div className="mt-5 space-y-10">
          {past.map((e) => (
            <section key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold">{e.title}</h3>
                <span className="text-sm text-muted-foreground">{fmt(e.event_date)}</span>
              </div>
              {e.description && <p className="mt-1 text-muted-foreground">{e.description}</p>}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {e.photos.map((p) => (
                  <button key={p} onClick={() => setZoom(p)} className="lift overflow-hidden rounded-2xl">
                    <img src={p} alt={e.title} loading="lazy" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-4" onClick={() => setZoom(null)}>
          <img src={zoom} alt="" className="max-h-[85vh] rounded-2xl" />
        </div>
      )}
      {join && <JoinDialog e={join} onClose={() => setJoin(null)} />}
    </div>
  );
}

function JoinDialog({ e, onClose }: { e: EventRow; onClose: () => void }) {
  const [f, setF] = useState({ student_name: "", class_name: "", age: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const input = "w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur">
      <form
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lift"
        onSubmit={async (ev) => {
          ev.preventDefault();
          setBusy(true);
          try {
            await registerForEvent({ data: { event_id: e.id, student_name: f.student_name, class_name: f.class_name, phone: f.phone, age: f.age ? Number(f.age) : null } });
            toast.success("Registration ho gaya! Hum aapko call karenge.");
            onClose();
          } catch (err) { toast.error((err as Error).message); }
          setBusy(false);
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs text-muted-foreground">Participate</p><h3 className="text-xl font-bold">{e.title}</h3></div>
          <button type="button" onClick={onClose} aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <input required maxLength={100} placeholder="Student ka naam" className={input} value={f.student_name} onChange={(x) => setF({ ...f, student_name: x.target.value })} />
          <input required maxLength={50} placeholder={`Class ${e.class_range ? `(${e.class_range})` : ""}`} className={input} value={f.class_name} onChange={(x) => setF({ ...f, class_name: x.target.value })} />
          <input type="number" min={3} max={99} placeholder={`Age ${e.age_rule ? `(${e.age_rule})` : ""}`} className={input} value={f.age} onChange={(x) => setF({ ...f, age: x.target.value })} />
          <input required inputMode="tel" maxLength={15} placeholder="Phone number" className={input} value={f.phone} onChange={(x) => setF({ ...f, phone: x.target.value })} />
        </div>
        <button disabled={busy} className="mt-5 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Bhej rahe hain..." : "Submit"}</button>
      </form>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Phone } from "lucide-react";
import { toast } from "sonner";
import { classesQuery } from "@/lib/queries";
import { submitAdmission } from "@/lib/extras.functions";
import { PHONES, tel } from "@/components/site-chrome";

export const Route = createFileRoute("/admission")({
  head: () => ({
    meta: [
      { title: "Admission Form — Aroma Academy of Education" },
      { name: "description", content: "Submit an admission enquiry for Aroma Academy and our team will contact you." },
      { property: "og:title", content: "Admission — Aroma Academy" },
      { property: "og:description", content: "Online admission enquiry for Aroma Academy of Education." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admission,
});

function Admission() {
  const { data: classes = [] } = useQuery(classesQuery);
  const [f, setF] = useState({ student_name: "", parent_name: "", phone: "", class_name: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const input = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Admission 2026-27</p>
        <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Apply for Admission</h1>
        <p className="mt-3 text-muted-foreground">Complete the form and Rahul Sir’s team will contact you shortly. You may also call us directly:</p>
        {PHONES.map((p) => (
          <a key={p} href={tel(p)} className="mt-3 flex items-center gap-2 text-xl font-bold"><Phone className="size-5 text-primary" /> {p}</a>
        ))}
      </div>
      {done ? (
        <div className="grid place-items-center rounded-3xl border border-border bg-card p-10 text-center shadow-lift">
          <CheckCircle2 className="size-14 text-success" />
          <h2 className="mt-3 text-2xl font-bold">Thank You!</h2>
          <p className="mt-1 text-muted-foreground">We have received your details and will call you soon.</p>
        </div>
      ) : (
        <form
          className="rounded-3xl border border-border bg-card p-6 shadow-lift"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try { await submitAdmission({ data: f }); setDone(true); } catch (err) { toast.error((err as Error).message); }
            setBusy(false);
          }}
        >
          <div className="space-y-3">
            <input required maxLength={100} placeholder="Student name" className={input} value={f.student_name} onChange={(e) => setF({ ...f, student_name: e.target.value })} />
            <input maxLength={100} placeholder="Parent or guardian name" className={input} value={f.parent_name} onChange={(e) => setF({ ...f, parent_name: e.target.value })} />
            <input required inputMode="tel" maxLength={15} placeholder="Phone number" className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <select required className={input} value={f.class_name} onChange={(e) => setF({ ...f, class_name: e.target.value })}>
              <option value="">Select a class or course</option>
              {classes.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
            <textarea maxLength={1000} rows={3} placeholder="Anything else you would like us to know? (optional)" className={input} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          </div>
          <button disabled={busy} className="mt-5 w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Submitting..." : "Submit Admission Enquiry"}</button>
        </form>
      )}
    </div>
  );
}

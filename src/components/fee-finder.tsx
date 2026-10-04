import { useState } from "react";
import { Phone } from "lucide-react";
import type { ClassRow } from "@/lib/academy.functions";
import { PHONES, PriceTag, tel } from "./site-chrome";

export function FeeFinder({ classes }: { classes: ClassRow[] }) {
  const [id, setId] = useState(classes[0]?.id ?? "");
  const c = classes.find((x) => x.id === id);
  const groups = Array.from(new Set(classes.map((x) => x.category)));
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fee Finder</p>
      <h3 className="mt-1 text-2xl font-semibold">Select a class to view its fee</h3>
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="mt-4 w-full rounded-xl border border-input bg-background px-3 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {classes.filter((x) => x.category === g).map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {c && (
        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <PriceTag original={c.original_price} sale={c.sale_price} label={c.sale_label} size="lg" />
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold">{c.duration || "—"}</dd></div>
            <div><dt className="text-muted-foreground">Category</dt><dd className="font-semibold">{c.category}</dd></div>
          </dl>
          {c.subjects && <p className="mt-2 text-sm"><span className="text-muted-foreground">Subjects: </span>{c.subjects}</p>}
        </div>
      )}
      <a
        href={tel(PHONES[0])}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90"
      >
        <Phone className="size-4" /> Call for admission
      </a>
    </div>
  );
}

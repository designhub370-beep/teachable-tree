import type { ClassRow } from "@/lib/academy.functions";
import { PriceTag } from "./site-chrome";

export function ClassCard({ c }: { c: ClassRow }) {
  return (
    <div className="lift flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {c.category} {c.duration && `· ${c.duration}`}
      </span>
      <h3 className="mt-1.5 text-xl font-semibold">{c.name}</h3>
      {c.subjects && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.subjects.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{s}</span>
          ))}
        </div>
      )}
      {c.description && <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>}
      <div className="mt-auto pt-4">
        <PriceTag original={c.original_price} sale={c.sale_price} label={c.sale_label} />
      </div>
    </div>
  );
}

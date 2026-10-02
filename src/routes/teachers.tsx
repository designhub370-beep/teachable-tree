import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Award, BookOpen, UserRound } from "lucide-react";
import { teachersQuery } from "@/lib/queries";

export const Route = createFileRoute("/teachers")({
  head: () => ({
    meta: [
      { title: "Our Teachers — Aroma Academy of Education" },
      { name: "description", content: "Aroma Academy ke teachers, unki qualification aur subjects." },
      { property: "og:title", content: "Our Teachers — Aroma Academy" },
      { property: "og:description", content: "Qualified teachers jo aapke bachchon ko padhate hain." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teachersQuery),
  component: Teachers,
});

function Teachers() {
  const { data } = useSuspenseQuery(teachersQuery);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Faculty</p>
      <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Hamare Teachers</h1>
      <p className="mt-3 text-muted-foreground">Qualification aur experience — jinke saath aapka bachcha padhega.</p>
      {data.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Teachers ki jaankari jaldi aayegi.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {data.map((t) => (
            <article key={t.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-4">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} loading="lazy" className="size-24 rounded-2xl object-cover ring-2 ring-primary" />
                ) : (
                  <span className="grid size-24 place-items-center rounded-2xl bg-secondary"><UserRound className="size-10 text-primary" /></span>
                )}
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold">{t.name}</h2>
                  {t.subjects && <p className="mt-1 flex items-center gap-1.5 text-sm text-primary"><BookOpen className="size-4" /> {t.subjects}</p>}
                </div>
              </div>
              {t.qualification && (
                <div className="mt-4 rounded-xl bg-secondary p-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold"><Award className="size-4 text-primary" /> Qualification</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{t.qualification.split("\n").filter(Boolean).map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}
              {t.sections.map((s, i) => (
                <div key={i} className="mt-4">
                  <p className="font-bold">{s.heading}</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{s.lines.filter(Boolean).map((l, j) => <li key={j}>{l}</li>)}</ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

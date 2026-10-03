import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { classesQuery } from "@/lib/queries";
import { ClassCard } from "@/components/class-card";
import { FeeFinder } from "@/components/fee-finder";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses & Fees — Aroma Academy of Education" },
      { name: "description", content: "The full list of Classes 9-12, college and competitive exam batches, with fees." },
      { property: "og:title", content: "Courses & Fees — Aroma Academy" },
      { property: "og:description", content: "Fees and offers for every class and exam batch." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(classesQuery),
  component: Courses,
});

function Courses() {
  const { data: classes } = useSuspenseQuery(classesQuery);
  const groups = Array.from(new Set(classes.map((c) => c.category)));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">Courses & Fees</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">The latest fees for every class and batch. The struck-through figure beside an offer price is the original fee.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="border-b border-border pb-2 text-2xl font-semibold">{g}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {classes.filter((c) => c.category === g).map((c) => <ClassCard key={c.id} c={c} />)}
              </div>
            </section>
          ))}
        </div>
        <div className="lg:sticky lg:top-32 lg:self-start"><FeeFinder classes={classes} /></div>
      </div>
    </div>
  );
}

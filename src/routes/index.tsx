import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, FileText, Phone, Trophy, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { classesQuery, materialsQuery } from "@/lib/queries";
import { FeeFinder } from "@/components/fee-finder";
import { ClassCard } from "@/components/class-card";
import { PHONES, tel } from "@/components/site-chrome";

const EXAMS = ["SSC", "CTET", "UPTET", "DSSSB", "UP RET", "UPSC", "Delhi Police", "UP Police"];
const SUBJECTS = ["Mathematics", "Science", "Physics", "Chemistry", "Economics", "Accountancy", "English"];
const ADMISSION_COURSES = [
  "BA", "MA", "B.COM", "M.COM", "B.SC", "M.SC", "BBA", "BCA", "MBA", "MCA", "B.LIB", "M.LIB", "PGDCA", "MSW",
  "B.TECH", "M.TECH", "BA.LLB", "LLB", "LLM", "D.EL.ED", "B.Ed.", "M.Ed.", "BP.Ed", "MP.Ed.", "D.PHARMA", "B.PHARMA",
  "ANM", "GNM", "B.SC Nursing", "PhD", "MBBS", "BDS", "BAMS", "BNYS", "Hotel Management", "CMS & ED", "BPT",
  "ITI Courses — All Trades", "BMLT", "DMLT", "Polytechnic — All Trades", "Medical — All Degrees & Diplomas",
  "Yoga — All Degrees & Diplomas", "Computer — All Degrees & Diplomas", "B.Voc — All Degrees & Diplomas",
  "Fashion Designing — All Degrees & Diplomas", "N.T.T. & All Vocational Degrees & Diplomas",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aroma Academy of Education — Class 9-12 & Govt Exam Coaching" },
      { name: "description", content: "Aroma Academy, led by Rahul Sharma: Classes 9-12 in Maths, Science, Commerce and Arts, plus coaching for SSC, CTET, UPTET, DSSSB, UPSC and police exams." },
      { property: "og:title", content: "Aroma Academy of Education" },
      { property: "og:description", content: "Trusted coaching for Classes 9-12 and competitive exams, taught by Rahul Sharma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(classesQuery),
      context.queryClient.ensureQueryData(materialsQuery),
    ]),
  component: Home,
});

function Home() {
  const { data: classes } = useSuspenseQuery(classesQuery);
  const { data: materials } = useSuspenseQuery(materialsQuery);
  const featured = classes.filter((c) => c.sale_label).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-accent" /> Rahul Sharma · Director
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[0.95] sm:text-7xl">
              Aroma Academy <span className="block text-primary">of Education</span>
            </h1>
            <p className="mt-3 text-xl font-semibold">Learning that brings results.</p>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Classes 9–12 (Science, Commerce, Arts) along with SSC, CTET, UPTET, DSSSB, UPSC and Delhi &amp; UP Police preparation — all under one roof, from concept to result.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={tel(PHONES[0])} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lift hover:opacity-90">
                <Phone className="size-4" /> Call for Admission
              </a>
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 font-semibold hover:bg-secondary">
                Courses & Fees <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                { i: Users, v: "15+", l: "Batches" },
                { i: BookOpen, v: `${materials.length}+`, l: "Notes & Tests" },
                { i: Trophy, v: "100%", l: "Dedication" },
              ].map(({ i: I, v, l }) => (
                <div key={l}>
                  <I className="size-5 text-accent" />
                  <p className="mt-1 font-display text-2xl font-semibold">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Students studying at Aroma Academy" width={1536} height={1024} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
            <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-border bg-card/95 p-4 shadow-soft backdrop-blur sm:left-auto sm:w-72">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Helpline</p>
              {PHONES.map((p) => (
                <a key={p} href={tel(p)} className="block font-display text-lg font-semibold">{p}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="admissions-showcase overflow-hidden border-y border-primary/30 bg-ink-gradient py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="admissions-pulse text-sm font-bold uppercase tracking-[0.28em] text-accent">Academic Session 2026–27</p>
          <h2 className="mt-2 text-5xl font-extrabold uppercase text-primary sm:text-7xl">Admissions Open</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-foreground/75">Admissions guidance is available for the following degree, diploma, professional, and vocational programmes.</p>
        </div>
        <div className="mt-9 space-y-3" aria-label="Available admission courses">
          {[ADMISSION_COURSES.filter((_, i) => i % 2 === 0), ADMISSION_COURSES.filter((_, i) => i % 2 === 1)].map((row, index) => (
            <div key={index} className={`course-marquee ${index === 1 ? "course-marquee-reverse" : ""}`}>
              {[...row, ...row].map((course, i) => (
                <span key={`${course}-${i}`} className="inline-flex shrink-0 items-center gap-3 px-3 font-display text-lg font-bold text-ink-foreground sm:text-xl">
                  <span className="size-1.5 rounded-full bg-primary" /> {course}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl justify-center px-4">
          <Link to="/admission" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lift transition-transform hover:scale-105">
            Apply for Admission <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Subjects marquee-ish strip */}
      <section className="mt-6 border-y border-border bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-4 text-sm font-semibold text-muted-foreground">
          {SUBJECTS.map((s) => <span key={s}>{s}</span>)}
        </div>
      </section>

      {/* Fee finder + offers */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1fr_1.3fr]">
        <FeeFinder classes={classes} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Special Offers</p>
          <h2 className="mt-1 text-3xl font-semibold">This Session's Offers</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featured.map((c) => <ClassCard key={c.id} c={c} />)}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="ruled bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold sm:text-4xl">Our Programs</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Program title="Class 9 & 10" text="Maths and Science — board-focused teaching, weekly tests and doubt-clearing sessions." />
            <Program title="Class 11 & 12" text="Science (PCM), Commerce (Accountancy, Economics) and Arts — every stream covered." />
            <Program title="Competitive Exams" text="Complete preparation for teaching, SSC, UPSC and police exams." chips={EXAMS} />
          </div>
        </div>
      </section>

      {/* Explore links */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-16 sm:grid-cols-3">
        {[
          { to: "/gallery" as const, t: "Explore Gallery", d: "Photos of the events we have held, and a chance to take part in the ones coming up." },
          { to: "/teachers" as const, t: "Our Teachers", d: "See their qualifications, subjects and experience." },
          { to: "/admission" as const, t: "Admission Form", d: "Fill in your details and we will call you back." },
        ].map((x) => (
          <Link key={x.to} to={x.to} className="lift rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-bold text-primary">{x.t} →</h3>
            <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
          </Link>
        ))}
      </section>

      {/* Latest material */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">Free Sample Papers & Notes</h2>
          <Link to="/materials" className="text-sm font-semibold text-primary">View all →</Link>
        </div>
        {materials.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Rahul Sharma will be uploading notes and sample tests here soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {materials.slice(0, 6).map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="lift flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><FileText className="size-5" /></span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{m.title}</span>
                  <span className="text-xs text-muted-foreground">{[m.class_name, m.subject].filter(Boolean).join(" · ")}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Program({ title, text, chips }: { title: string; text: string; chips?: string[] }) {
  return (
    <div className="lift rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{text}</p>
      {chips && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((e) => <span key={e} className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-ink-foreground">{e}</span>)}
        </div>
      )}
    </div>
  );
}

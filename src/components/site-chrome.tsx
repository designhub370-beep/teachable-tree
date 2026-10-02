import { Link } from "@tanstack/react-router";
import { LogOut, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

export const PHONES = ["+91 99583 01091", "+91 98107 77614"];
export const tel = (p: string) => `tel:${p.replace(/\s/g, "")}`;
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function SiteHeader() {
  const linkCls = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  const active = { className: "text-foreground" };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent" /> Admissions open — 2026-27
          </span>
          <a href={tel(PHONES[0])} className="flex items-center gap-1 font-semibold">
            <Phone className="size-3" /> {PHONES[0]}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Aroma Academy logo" width={44} height={44} className="size-11 rounded-xl bg-foreground p-1" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold">Aroma Academy</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              of Education
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-5">
          <Link to="/courses" className={linkCls} activeProps={active}>Courses</Link>
          <Link to="/materials" className={linkCls} activeProps={active}>Material</Link>
          <Link to="/gallery" className={linkCls} activeProps={active}>Gallery</Link>
          <Link to="/teachers" className={linkCls} activeProps={active}>Teachers</Link>
          <Link to="/admission" className="rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">Admission</Link>
          <Link
            to="/staff"
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
          >
            Staff
          </Link>
          <button onClick={() => supabase.auth.signOut()} aria-label="Logout" className="text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink-gradient text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold">Aroma Academy of Education</p>
          <p className="mt-2 text-sm opacity-70">Director: Rahul Sharma Sir</p>
          <p className="mt-1 text-sm opacity-70">Class 9–12 · Commerce · Arts · Science · Govt Exams</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">Call us</p>
          {PHONES.map((p) => (
            <a key={p} href={tel(p)} className="mt-2 block text-lg font-semibold">{p}</a>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">Explore</p>
          <Link to="/courses">Courses & Fees</Link>
          <Link to="/materials">Study Material</Link>
          <Link to="/gallery">Explore Gallery</Link>
          <Link to="/teachers">Our Teachers</Link>
          <Link to="/admission">Admission Form</Link>
          <Link to="/staff">Teacher / Head Login</Link>
        </div>
      </div>
      <p className="border-t border-ink-foreground/10 py-4 text-center text-xs opacity-50">
        © {new Date().getFullYear()} Aroma Academy of Education
      </p>
    </footer>
  );
}

export function PriceTag({
  original,
  sale,
  label,
  size = "md",
}: {
  original: number | null;
  sale: number;
  label: string;
  size?: "md" | "lg";
}) {
  const hasSale = original != null && original > sale;
  const off = hasSale ? Math.round(((original! - sale) / original!) * 100) : 0;
  return (
    <div>
      {label && (
        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          {label}
        </span>
      )}
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={size === "lg" ? "font-display text-4xl font-semibold" : "font-display text-2xl font-semibold"}>
          {inr(sale)}
        </span>
        {hasSale && (
          <>
            <span className="text-sm text-muted-foreground line-through decoration-destructive decoration-2">
              {inr(original!)}
            </span>
            <span className="text-xs font-bold text-success">{off}% OFF</span>
          </>
        )}
      </div>
    </div>
  );
}

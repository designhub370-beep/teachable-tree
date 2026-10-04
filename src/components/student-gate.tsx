import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, BookOpen, Calculator, FlaskConical, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/aroma-academy-logo.png";
import hero from "@/assets/hero.jpg";
import { LogoLoader } from "./logo-loader";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function StudentGate({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    setGuest(window.localStorage.getItem("aroma-guest-access") === "true");
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (path.startsWith("/staff")) return <>{children}</>;
  if (session === undefined)
    return (
      <div className="grid min-h-screen place-items-center">
        <LogoLoader />
      </div>
    );
  if (!session && !guest) return <SignupScreen onGuest={() => {
    window.localStorage.setItem("aroma-guest-access", "true");
    setGuest(true);
  }} />;
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

function SignupScreen({ onGuest }: { onGuest: () => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: f.email.trim(),
            password: f.password,
            options: { data: { full_name: f.name.trim(), phone: f.phone.trim() }, emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(mode === "signup" ? "Welcome! Your account is ready." : "Welcome back!");
  }

  const input = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 overflow-hidden px-4 py-8 lg:grid-cols-[1.15fr_1fr] lg:py-10">
      <button type="button" onClick={() => window.history.back()} className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Back
      </button>
      <div>
        <div className="flex items-center gap-4">
          <img src={logo} alt="Aroma Academy logo" width={88} height={88} className="size-20 rounded-2xl bg-foreground p-1.5 sm:size-24" />
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary">Admissions open 2026-27</span>
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          Aroma Academy <span className="block text-primary">of Education</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          Classes 9–12 (Science, Commerce, Arts) and preparation for SSC, CTET, UPTET, DSSSB, UPSC and police exams, taught by Rahul Sharma.
        </p>
        <div className="mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { i: Calculator, l: "Maths" },
            { i: FlaskConical, l: "Science" },
            { i: BookOpen, l: "Notes & PDF" },
            { i: Trophy, l: "Govt Exams" },
          ].map(({ i: I, l }) => (
            <div key={l} className="rounded-xl border border-border bg-card/70 p-3">
              <I className="size-5 text-primary" />
              <p className="mt-1 text-sm font-semibold">{l}</p>
            </div>
          ))}
        </div>
        <img src={hero} alt="Students studying" width={1536} height={1024} className="mt-6 hidden aspect-[16/7] w-full max-w-lg rounded-2xl object-cover opacity-90 lg:block" />
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-border bg-card/90 p-6 shadow-lift backdrop-blur sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{mode === "signup" ? "Completely Free" : "Student Login"}</p>
        <h2 className="mt-1 text-3xl font-bold">{mode === "signup" ? "Create a free account" : "Sign in"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">To view courses, fees and study material.</p>
        <div className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <input required maxLength={80} placeholder="Full name" value={f.name} onChange={set("name")} className={input} />
              <input required maxLength={15} inputMode="tel" placeholder="Phone number" value={f.phone} onChange={set("phone")} className={input} />
            </>
          )}
          <input required type="email" placeholder="Email" value={f.email} onChange={set("email")} className={input} />
          <input required type="password" minLength={6} placeholder="Password (min 6)" value={f.password} onChange={set("password")} className={input} />
        </div>
        <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy && <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />} {mode === "signup" ? "Create Free Account" : "Sign In"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground">
          {mode === "signup" ? "Already have an account? Sign in" : "New student? Sign up free"}
        </button>
        <div className="my-4 flex items-center gap-3 text-xs uppercase text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</div>
        <button type="button" onClick={onGuest} className="w-full rounded-xl border border-primary/50 bg-secondary py-3 font-bold text-foreground transition-colors hover:bg-muted">
          Continue without signing up
        </button>
        <a href="/staff" className="mt-2 block text-center text-xs text-muted-foreground underline">Teacher / Head login</a>
      </form>
    </div>
  );
}

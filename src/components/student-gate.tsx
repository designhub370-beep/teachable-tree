import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { BookOpen, Calculator, FlaskConical, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.jpg";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function StudentGate({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (path.startsWith("/staff")) return <>{children}</>;
  if (session === undefined)
    return (
      <div className="grid min-h-screen place-items-center">
        <img src={logo} alt="" width={80} height={80} className="size-20 animate-pulse rounded-2xl bg-foreground p-2" />
      </div>
    );
  if (!session) return <SignupScreen />;
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

function SignupScreen() {
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
    else toast.success(mode === "signup" ? "Swagat hai! Account ban gaya." : "Welcome back!");
  }

  const input = "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <div className="flex items-center gap-4">
          <img src={logo} alt="Aroma Academy logo" width={88} height={88} className="size-20 rounded-2xl bg-foreground p-1.5 sm:size-24" />
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary">Admissions open 2026-27</span>
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          Aroma Academy <span className="block text-primary">of Education</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          Rahul Sharma Sir ke saath Class 9–12 (Science, Commerce, Arts) aur SSC, CTET, UPTET, DSSSB, UPSC, Police exams ki tayari.
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{mode === "signup" ? "Bilkul Free" : "Student Login"}</p>
        <h2 className="mt-1 text-3xl font-bold">{mode === "signup" ? "Free signup karein" : "Sign in karein"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Courses, fees aur study material dekhne ke liye.</p>
        <div className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <input required maxLength={80} placeholder="Poora naam" value={f.name} onChange={set("name")} className={input} />
              <input required maxLength={15} inputMode="tel" placeholder="Phone number" value={f.phone} onChange={set("phone")} className={input} />
            </>
          )}
          <input required type="email" placeholder="Email" value={f.email} onChange={set("email")} className={input} />
          <input required type="password" minLength={6} placeholder="Password (min 6)" value={f.password} onChange={set("password")} className={input} />
        </div>
        <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />} {mode === "signup" ? "Free Account Banayein" : "Sign In"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground">
          {mode === "signup" ? "Pehle se account hai? Sign in" : "Naya student? Free signup"}
        </button>
        <a href="/staff" className="mt-2 block text-center text-xs text-muted-foreground underline">Teacher / Head login</a>
      </form>
    </div>
  );
}

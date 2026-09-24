import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export type Role = "teacher" | "head";
type GateSession = { role?: Role };

function config() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "aroma-staff",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function getSession() {
  return useSession<GateSession>(config());
}

export async function currentRole(): Promise<Role | null> {
  const s = await getSession();
  return s.data.role ?? null;
}

export async function requireRole(allowed: Role[]) {
  const role = await currentRole();
  if (!role || !allowed.includes(role)) throw new Error("Unauthorized");
  return role;
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireRole } from "./gate.server";

export type Section = { heading: string; lines: string[] };
export type EventRow = {
  id: string; title: string; event_date: string | null; status: string; description: string;
  class_range: string; age_rule: string; rules: string; photo_paths: string[]; photos: string[];
};
export type TeacherRow = {
  id: string; name: string; photo_path: string; photo: string; qualification: string;
  subjects: string; sections: Section[]; sort_order: number;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function sign(paths: string[]) {
  const clean = paths.filter(Boolean);
  if (!clean.length) return {} as Record<string, string>;
  const db = await admin();
  const { data } = await db.storage.from("materials").createSignedUrls(clean, 60 * 60 * 6);
  const map: Record<string, string> = {};
  data?.forEach((d, i) => { const k = clean[i]; if (d.signedUrl && k) map[k] = d.signedUrl; });
  return map;
}

/* ---------- public ---------- */
export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("events").select("*").order("event_date", { ascending: false, nullsFirst: true });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const urls = await sign(rows.flatMap((r) => r.photo_paths));
  return rows.map((r) => ({ ...r, photos: r.photo_paths.map((p: string) => urls[p]).filter(Boolean) })) as EventRow[];
});

export const listTeachers = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("teachers").select("*").order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const urls = await sign(rows.map((r) => r.photo_path));
  return rows.map((r) => ({ ...r, photo: urls[r.photo_path] ?? "", sections: (r.sections ?? []) as Section[] })) as TeacherRow[];
});

const phone = z.string().trim().regex(/^[0-9+\s-]{7,15}$/, "Sahi phone number daaliye");

export const registerForEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    event_id: z.string().uuid(), student_name: z.string().trim().min(1).max(100),
    class_name: z.string().trim().max(50), age: z.number().int().min(3).max(99).nullable(), phone,
  }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("event_registrations").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitAdmission = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    student_name: z.string().trim().min(1).max(100), phone, class_name: z.string().trim().max(80),
    parent_name: z.string().trim().max(100), message: z.string().trim().max(1000),
  }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("admissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- head ---------- */
const eventSchema = z.object({
  id: z.string().uuid().optional(), title: z.string().trim().min(1).max(150),
  event_date: z.string().max(20).nullable(), status: z.enum(["upcoming", "past"]),
  description: z.string().trim().max(2000), class_range: z.string().trim().max(100),
  age_rule: z.string().trim().max(100), rules: z.string().trim().max(3000),
  photo_paths: z.array(z.string().max(300)).max(30),
});
export const saveEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => eventSchema.parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { id, ...rest } = data;
    const row = { ...rest, event_date: rest.event_date || null };
    const { error } = id ? await db.from("events").update(row).eq("id", id) : await db.from("events").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { error } = await db.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const teacherSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(1).max(100),
  photo_path: z.string().max(300), qualification: z.string().trim().max(500),
  subjects: z.string().trim().max(300), sort_order: z.number().int().min(0).max(10000),
  sections: z.array(z.object({ heading: z.string().trim().max(100), lines: z.array(z.string().trim().max(300)).max(30) })).max(20),
});
export const saveTeacher = createServerFn({ method: "POST" })
  .inputValidator((d) => teacherSchema.parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { id, ...rest } = data;
    const { error } = id ? await db.from("teachers").update(rest).eq("id", id) : await db.from("teachers").insert(rest);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteTeacher = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { error } = await db.from("teachers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listInbox = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["head"]);
  const db = await admin();
  const [a, r] = await Promise.all([
    db.from("admissions").select("*").order("created_at", { ascending: false }),
    db.from("event_registrations").select("*, events(title)").order("created_at", { ascending: false }),
  ]);
  return { admissions: a.data ?? [], registrations: r.data ?? [] };
});
export const markContacted = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), contacted: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    await db.from("admissions").update({ contacted: data.contacted }).eq("id", data.id);
    return { ok: true };
  });

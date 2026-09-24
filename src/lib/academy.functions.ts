import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { currentRole, getSession, passwordMatches, requireRole } from "./gate.server";

export type ClassRow = {
  id: string;
  name: string;
  category: string;
  subjects: string;
  description: string;
  duration: string;
  sale_label: string;
  original_price: number | null;
  sale_price: number;
  sort_order: number;
};

export type MaterialRow = {
  id: string;
  title: string;
  class_name: string;
  subject: string;
  kind: string;
  description: string;
  file_path: string;
  url: string;
  created_at: string;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ---------- auth ---------- */

export const staffLogin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ role: z.enum(["teacher", "head"]), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const expected =
      data.role === "head" ? process.env["HEAD_PASSWORD"] : process.env["TEACHER_PASSWORD"];
    if (!expected || !passwordMatches(data.password, expected)) return { ok: false as const };
    const s = await getSession();
    await s.update({ role: data.role });
    return { ok: true as const };
  });

export const staffLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await getSession();
  await s.clear();
  return { ok: true };
});

export const getRole = createServerFn({ method: "GET" }).handler(async () => {
  return { role: await currentRole() };
});

/* ---------- public reads ---------- */

export const listClasses = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db
    .from("classes")
    .select("id,name,category,subjects,description,duration,sale_label,original_price,sale_price,sort_order")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as ClassRow[];
});

export const listMaterials = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db
    .from("materials")
    .select("id,title,class_name,subject,kind,description,file_path,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (!rows.length) return [] as MaterialRow[];
  const { data: signed } = await db.storage
    .from("materials")
    .createSignedUrls(rows.map((r) => r.file_path), 60 * 60 * 6);
  return rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? "" })) as MaterialRow[];
});

/* ---------- teacher + head ---------- */

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ filename: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["teacher", "head"]);
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const db = await admin();
    const { data: signed, error } = await db.storage.from("materials").createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Upload failed");
    return { path, token: signed.token };
  });

const materialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  class_name: z.string().trim().max(100),
  subject: z.string().trim().max(100),
  kind: z.enum(["pdf", "image", "test", "notes"]),
  description: z.string().trim().max(1000),
  file_path: z.string().min(1).max(300),
});

export const addMaterial = createServerFn({ method: "POST" })
  .inputValidator((d) => materialSchema.parse(d))
  .handler(async ({ data }) => {
    const role = await requireRole(["teacher", "head"]);
    const db = await admin();
    const { error } = await db
      .from("materials")
      .insert({ ...data, file_url: "", uploaded_by: role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMaterial = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["teacher", "head"]);
    const db = await admin();
    const { data: row } = await db.from("materials").select("file_path").eq("id", data.id).maybeSingle();
    if (row?.file_path) await db.storage.from("materials").remove([row.file_path]);
    const { error } = await db.from("materials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- head only ---------- */

const classSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  subjects: z.string().trim().max(300),
  description: z.string().trim().max(1000),
  duration: z.string().trim().max(50),
  sale_label: z.string().trim().max(80),
  original_price: z.number().int().min(0).max(10000000).nullable(),
  sale_price: z.number().int().min(0).max(10000000),
  sort_order: z.number().int().min(0).max(10000),
});

export const saveClass = createServerFn({ method: "POST" })
  .inputValidator((d) => classSchema.parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { id, ...rest } = data;
    const q = id ? db.from("classes").update(rest).eq("id", id) : db.from("classes").insert(rest);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClass = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireRole(["head"]);
    const db = await admin();
    const { error } = await db.from("classes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

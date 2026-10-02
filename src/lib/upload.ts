import { supabase } from "@/integrations/supabase/client";
import { createUploadUrl } from "./academy.functions";

export async function uploadFile(file: File) {
  const { path, token } = await createUploadUrl({ data: { filename: file.name } });
  const { error } = await supabase.storage.from("materials").uploadToSignedUrl(path, token, file);
  if (error) throw error;
  return path;
}

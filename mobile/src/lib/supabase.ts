import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Photo upload disabled."
  );
}

export const supabase = createClient(
  SUPABASE_URL ?? "http://localhost",
  SUPABASE_ANON_KEY ?? "anon",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const DOG_PHOTOS_BUCKET = "dog-photos";

export async function uploadDogPhoto(uri: string, userId: string): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase not configured");
  }

  const extMatch = uri.split(".").pop()?.toLowerCase().split("?")[0];
  const ext = extMatch && extMatch.length <= 5 ? extMatch : "jpg";
  const path = `user/${userId}/${Date.now()}.${ext}`;
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("Empty photo file");
  }

  const { error } = await supabase.storage
    .from(DOG_PHOTOS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(DOG_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

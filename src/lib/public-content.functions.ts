import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export type PublicService = { id: string; title: string; category: string; description: string; deliverables: string[] };
export type PublicCourse = { id: string; title: string; category: string; description: string; level: string; duration: string; price_kes: number | null; is_free: boolean };

export const getPublishedServices = createServerFn({ method: "GET" }).handler(async (): Promise<PublicService[]> => {
  const { data, error } = await publicClient()
    .from("services").select("id,title,category,description,deliverables")
    .eq("is_published", true).order("sort_order").order("title");
  if (error) throw new Error("Services could not be loaded");
  return data ?? [];
});

export const getPublishedCourses = createServerFn({ method: "GET" }).handler(async (): Promise<PublicCourse[]> => {
  const { data, error } = await publicClient()
    .from("courses").select("id,title,category,description,level,duration,price_kes,is_free")
    .eq("is_published", true).order("sort_order").order("title");
  if (error) throw new Error("Courses could not be loaded");
  return data ?? [];
});

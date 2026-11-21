import { z } from "zod";
import { adminApi, type CourseDraftInput } from "@/lib/api";

const draftInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  level: z.string().trim().min(2).max(80),
  duration: z.string().trim().max(100),
  topics: z.string().trim().min(3).max(3000),
  targetAudience: z.string().trim().min(3).max(600),
});

export async function draftCourseContent(input: CourseDraftInput) {
  const parsed = draftInputSchema.parse(input);
  return adminApi.generateDraft(parsed);
}

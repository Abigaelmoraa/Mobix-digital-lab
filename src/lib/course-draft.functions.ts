import { createServerFn } from "@tanstack/react-start";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const draftInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  level: z.string().trim().min(2).max(80),
  duration: z.string().trim().max(100),
  topics: z.string().trim().min(3).max(3000),
  targetAudience: z.string().trim().min(3).max(600),
});

const draftOutputSchema = z.object({
  description: z.string().trim().min(30).max(3000),
  learningOutcomes: z.array(z.string().trim().min(8).max(240)).min(3).max(6),
});

export const draftCourseContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => draftInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: adminError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuperAdmin, error: superAdminError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });

    if (adminError || superAdminError || (!isAdmin && !isSuperAdmin)) {
      throw new Error("Course drafting is available to studio administrators only.");
    }

    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "Write clear, practical course copy for a Nairobi-based technology training studio. Use only the supplied facts; do not invent credentials, accreditation, guarantees, prices, or outcomes beyond the topics. Return a concise description and 3 to 6 observable learning outcomes, in plain language, as valid JSON matching the requested schema.",
        input: JSON.stringify({
          courseTitle: data.title,
          category: data.category,
          learnerLevel: data.level,
          statedDuration: data.duration || "Not specified",
          topics: data.topics,
          targetAudience: data.targetAudience,
        }),
        text: {
          format: {
            type: "json_schema",
            name: "course_description_and_outcomes",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                description: { type: "string" },
                learningOutcomes: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 6,
                },
              },
              required: ["description", "learningOutcomes"],
            },
          },
        },
      });

      if (response.status !== "completed" || response.error) {
        throw new Error("The AI response was incomplete.");
      }

      const text = response.output
        .flatMap((item) => item.type === "message" ? item.content : [])
        .filter((item) => item.type === "output_text")
        .map((item) => item.text)
        .join("");

      if (!text) throw new Error("The AI response did not contain a draft.");
      return draftOutputSchema.parse(JSON.parse(text));
    } catch (error) {
      if (error instanceof GatewayError) {
        console.error("[Course draft] AI Gateway request failed", {
          code: error.code,
          httpStatus: error.httpStatus,
          outcome: error.outcome,
          ids: error.ids,
        });
      }
      throw new Error("The course draft could not be generated. Please try again.");
    }
  });
import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(40).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40),
  course_id: z.union([z.string().uuid(), z.literal("other")]),
  course_title: z.string().trim().min(2, "Choose a course to enrol in").max(160),
  message: z.string().trim().max(2000).optional().default(""),
});

export const enquirySchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  service_requested: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(5).max(4000),
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(3000),
  deliverables: z.array(z.string().trim().max(500)).max(40),
  is_published: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(3000),
  level: z.string().trim().min(2).max(80),
  duration: z.string().trim().max(100).optional().default(""),
  topics: z.array(z.string().trim().max(500)).max(40),
  target_audience: z.string().trim().max(600).optional().default(""),
  learning_outcomes: z.array(z.string().trim().max(300)).max(12),
  price_kes: z.number().int().min(0).max(999999999999).nullable().optional(),
  is_free: z.boolean(),
  is_published: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export const courseDraftSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  level: z.string().trim().min(2).max(80),
  duration: z.string().trim().max(100).optional().default(""),
  topics: z.string().trim().min(3).max(3000),
  targetAudience: z.string().trim().min(3).max(600),
});

export function formatZodError(error) {
  return error.issues[0]?.message || "Invalid request";
}

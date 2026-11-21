import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { pool, query, checkConnection } from "./db.js";
import { signToken, optionalAuth, authRequired, adminRequired } from "./auth.js";
import {
  registerSchema,
  loginSchema,
  applicationSchema,
  enrollmentSchema,
  enquirySchema,
  serviceSchema,
  courseSchema,
  courseDraftSchema,
  formatZodError,
} from "./validation.js";

export const app = express();

const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ownerEmail = (
  process.env.OWNER_EMAIL || (process.env.NODE_ENV === "production" ? "" : "samwelobanyi@yahoo.com")
)
  .trim()
  .toLowerCase();

if (!ownerEmail) {
  throw new Error("OWNER_EMAIL must be set in production");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || configuredOrigins.includes(origin) || localOrigin.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

const route = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeService(row) {
  if (!row) return null;
  return {
    ...row,
    deliverables: parseArray(row.deliverables),
    is_published: Boolean(row.is_published),
  };
}

function serializeCourse(row) {
  if (!row) return null;
  return {
    ...row,
    topics: parseArray(row.topics),
    learning_outcomes: parseArray(row.learning_outcomes),
    price_kes: row.price_kes == null ? null : Number(row.price_kes),
    is_free: Boolean(row.is_free),
    is_published: Boolean(row.is_published),
  };
}

function serializeUser(row) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone || "",
    role: row.role,
  };
}

function generateCourseDraft(input) {
  const topics = input.topics
    .split(/\r?\n|,/)
    .map((topic) => topic.trim())
    .filter(Boolean);
  const duration = input.duration ? ` over ${input.duration}` : "";
  const audience = input.targetAudience.replace(/\.$/, "");
  const description = `${input.title} is a ${input.level.toLowerCase()} ${input.category.toLowerCase()} course${duration}, designed for ${audience}. The course focuses on practical, hands-on work across ${topics.join(", ")}. Each section combines clear explanation with realistic exercises so learners can apply what they have covered with confidence.`;
  const verbs = [
    "Explain the core concepts of",
    "Apply",
    "Build a practical example using",
    "Evaluate common approaches to",
    "Troubleshoot basic issues in",
    "Present a solution based on",
  ];
  const learningOutcomes = topics
    .slice(0, 6)
    .map((topic, index) => `${verbs[index % verbs.length]} ${topic.replace(/\.$/, "")}.`);
  while (learningOutcomes.length < 3) {
    learningOutcomes.push("Apply the course concepts to a practical project.");
  }
  return {
    description: description.slice(0, 3000),
    learningOutcomes: learningOutcomes.slice(0, 6),
  };
}

app.get(
  "/api/health",
  route(async (_request, response) => {
    await checkConnection();
    response.json({ ok: true, service: "mobix-digital-lab-api" });
  }),
);

app.get(
  "/api/services",
  route(async (_request, response) => {
    const rows = await query(
      "SELECT id, title, category, description, deliverables, is_published, sort_order, created_at, updated_at FROM services WHERE is_published = 1 ORDER BY sort_order ASC, title ASC",
    );
    response.json(rows.map(serializeService));
  }),
);

app.get(
  "/api/courses",
  route(async (_request, response) => {
    const rows = await query(
      "SELECT id, title, category, description, level, duration, topics, target_audience, learning_outcomes, price_kes, is_free, is_published, sort_order, created_at, updated_at FROM courses WHERE is_published = 1 ORDER BY sort_order ASC, title ASC",
    );
    response.json(rows.map(serializeCourse));
  }),
);

app.post(
  "/api/applications",
  route(async (request, response) => {
    const input = applicationSchema.parse(request.body);
    let courseTitle = input.course_title;
    if (input.course_id !== "other") {
      const courses = await query("SELECT title FROM courses WHERE id = ? AND is_published = 1", [
        input.course_id,
      ]);
      if (!courses.length) {
        return response.status(400).json({ error: "Choose a published course" });
      }
      courseTitle = courses[0].title;
    }
    const id = crypto.randomUUID();
    await query(
      "INSERT INTO course_applications (id, full_name, email, phone, course_id, course_title, message) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.full_name,
        input.email,
        input.phone,
        input.course_id === "other" ? null : input.course_id,
        courseTitle,
        input.message,
      ],
    );
    return response.status(201).json({ id });
  }),
);

app.post(
  "/api/enrollments",
  optionalAuth,
  route(async (request, response) => {
    const input = enrollmentSchema.parse(request.body);
    const courses = await query("SELECT id, title FROM courses WHERE id = ? AND is_published = 1", [
      input.course_id,
    ]);
    if (!courses.length) {
      return response.status(400).json({ error: "Choose a published course" });
    }
    const id = crypto.randomUUID();
    const userId = request.auth?.id ?? null;
    await query(
      "INSERT IGNORE INTO course_enrollments (id, user_id, full_name, email, phone, course_id, course_title, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        userId,
        input.full_name,
        input.email,
        input.phone,
        input.course_id,
        courses[0].title,
        input.message,
      ],
    );
    const rows = await query(
      "SELECT id FROM course_enrollments WHERE email = ? AND course_id = ?",
      [input.email, input.course_id],
    );
    return response.status(201).json({ id: rows[0].id, alreadyEnrolled: rows[0].id !== id });
  }),
);

app.get(
  "/api/enrollments/mine",
  authRequired,
  route(async (request, response) => {
    const rows = await query(
      "SELECT e.id, e.course_id, e.course_title, e.status, e.message, e.created_at, c.level, c.duration, c.is_free, c.price_kes FROM course_enrollments e LEFT JOIN courses c ON c.id = e.course_id WHERE e.user_id = ? OR LOWER(e.email) = LOWER(?) ORDER BY e.created_at DESC",
      [request.auth.id, request.auth.email],
    );
    response.json(
      rows.map((row) => ({
        ...row,
        is_free: Boolean(row.is_free),
        price_kes: row.price_kes == null ? null : Number(row.price_kes),
      })),
    );
  }),
);

app.post(
  "/api/enquiries",
  route(async (request, response) => {
    const input = enquirySchema.parse(request.body);
    const id = crypto.randomUUID();
    await query(
      "INSERT INTO service_enquiries (id, full_name, email, phone, service_requested, message) VALUES (?, ?, ?, ?, ?, ?)",
      [id, input.full_name, input.email, input.phone, input.service_requested, input.message],
    );
    response.status(201).json({ id });
  }),
);

app.post(
  "/api/auth/register",
  route(async (request, response) => {
    const input = registerSchema.parse(request.body);
    const existing = await query("SELECT id FROM users WHERE email = ?", [input.email]);
    if (existing.length) {
      return response.status(409).json({ error: "An account with this email already exists" });
    }
    const user = {
      id: crypto.randomUUID(),
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
      role: "customer",
    };
    const passwordHash = await bcrypt.hash(input.password, 10);
    await query(
      "INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, user.full_name, user.email, user.phone, passwordHash, user.role],
    );
    return response.status(201).json({ token: signToken(user), user: serializeUser(user) });
  }),
);

app.post(
  "/api/auth/login",
  route(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const rows = await query("SELECT * FROM users WHERE email = ?", [input.email]);
    const row = rows[0];
    if (!row || !(await bcrypt.compare(input.password, row.password_hash))) {
      return response.status(401).json({ error: "Invalid email or password" });
    }
    const user = serializeUser(row);
    return response.json({ token: signToken(user), user });
  }),
);

app.get(
  "/api/auth/me",
  authRequired,
  route(async (request, response) => {
    const rows = await query("SELECT id, email, full_name, phone, role FROM users WHERE id = ?", [
      request.auth.id,
    ]);
    if (!rows.length) {
      return response.status(401).json({ error: "Account not found" });
    }
    return response.json({ user: serializeUser(rows[0]) });
  }),
);

app.post(
  "/api/auth/claim-admin",
  authRequired,
  route(async (request, response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [claims] = await connection.query("SELECT id FROM admin_bootstrap WHERE id = 1");
      const [users] = await connection.query("SELECT id, email FROM users WHERE id = ?", [
        request.auth.id,
      ]);
      if (
        claims.length ||
        !users.length ||
        String(users[0].email).trim().toLowerCase() !== ownerEmail
      ) {
        await connection.commit();
        return response.json({ claimed: false });
      }
      await connection.query("UPDATE users SET role = 'super_admin' WHERE id = ?", [
        request.auth.id,
      ]);
      await connection.query("INSERT INTO admin_bootstrap (id, claimed_by) VALUES (1, ?)", [
        request.auth.id,
      ]);
      await connection.commit();
      return response.json({ claimed: true, role: "super_admin" });
    } catch (error) {
      await connection.rollback();
      if (error?.code === "ER_DUP_ENTRY") {
        return response.json({ claimed: false });
      }
      throw error;
    } finally {
      connection.release();
    }
  }),
);

app.get(
  "/api/admin/services",
  adminRequired,
  route(async (_request, response) => {
    const rows = await query(
      "SELECT id, title, category, description, deliverables, is_published, sort_order, created_at, updated_at FROM services ORDER BY sort_order ASC, title ASC",
    );
    response.json(rows.map(serializeService));
  }),
);

app.post(
  "/api/admin/services",
  adminRequired,
  route(async (request, response) => {
    const input = serviceSchema.parse(request.body);
    const id = input.id || crypto.randomUUID();
    const values = [
      id,
      input.title,
      input.category,
      input.description,
      JSON.stringify(input.deliverables),
      input.is_published ? 1 : 0,
      input.sort_order ?? 0,
    ];
    if (input.id) {
      const result = await query(
        "UPDATE services SET title = ?, category = ?, description = ?, deliverables = ?, is_published = ?, sort_order = ? WHERE id = ?",
        values.slice(1).concat(id),
      );
      if (!result.affectedRows) return response.status(404).json({ error: "Service not found" });
    } else {
      await query(
        "INSERT INTO services (id, title, category, description, deliverables, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        values,
      );
    }
    const rows = await query("SELECT * FROM services WHERE id = ?", [id]);
    return response.status(input.id ? 200 : 201).json(serializeService(rows[0]));
  }),
);

app.get(
  "/api/admin/courses",
  adminRequired,
  route(async (_request, response) => {
    const rows = await query(
      "SELECT id, title, category, description, level, duration, topics, target_audience, learning_outcomes, price_kes, is_free, is_published, sort_order, created_at, updated_at FROM courses ORDER BY sort_order ASC, title ASC",
    );
    response.json(rows.map(serializeCourse));
  }),
);

app.post(
  "/api/admin/courses",
  adminRequired,
  route(async (request, response) => {
    const input = courseSchema.parse(request.body);
    const id = input.id || crypto.randomUUID();
    const values = [
      id,
      input.title,
      input.category,
      input.description,
      input.level,
      input.duration || "",
      JSON.stringify(input.topics),
      input.target_audience || "",
      JSON.stringify(input.learning_outcomes),
      input.is_free ? null : (input.price_kes ?? null),
      input.is_free ? 1 : 0,
      input.is_published ? 1 : 0,
      input.sort_order ?? 0,
    ];
    if (input.id) {
      const result = await query(
        "UPDATE courses SET title = ?, category = ?, description = ?, level = ?, duration = ?, topics = ?, target_audience = ?, learning_outcomes = ?, price_kes = ?, is_free = ?, is_published = ?, sort_order = ? WHERE id = ?",
        values.slice(1).concat(id),
      );
      if (!result.affectedRows) return response.status(404).json({ error: "Course not found" });
    } else {
      await query(
        "INSERT INTO courses (id, title, category, description, level, duration, topics, target_audience, learning_outcomes, price_kes, is_free, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        values,
      );
    }
    const rows = await query("SELECT * FROM courses WHERE id = ?", [id]);
    return response.status(input.id ? 200 : 201).json(serializeCourse(rows[0]));
  }),
);

app.post(
  "/api/admin/course-draft",
  adminRequired,
  route(async (request, response) => {
    const input = courseDraftSchema.parse(request.body);
    response.json(generateCourseDraft(input));
  }),
);

app.get(
  "/api/admin/enquiries",
  adminRequired,
  route(async (_request, response) => {
    const rows = await query("SELECT * FROM service_enquiries ORDER BY created_at DESC");
    response.json(rows);
  }),
);

app.use((error, _request, response, _next) => {
  if (error instanceof z.ZodError) {
    return response.status(400).json({ error: formatZodError(error) });
  }
  if (error?.message === "Origin not allowed") {
    return response.status(403).json({ error: "Origin not allowed" });
  }
  if (error?.code === "ER_DUP_ENTRY") {
    return response.status(409).json({ error: "A record with this value already exists" });
  }
  console.error(error);
  return response.status(500).json({ error: "Server error" });
});

import "dotenv/config";
import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";

const directory = path.dirname(fileURLToPath(import.meta.url));
const database = process.env.DB_NAME || "mobix_digital_lab";
const schema = await readFile(path.join(directory, "schema.sql"), "utf8");

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true,
});

const seedServices = [
  {
    title: "Websites & web applications",
    category: "Digital solutions",
    description:
      "Fast, accessible websites and practical web applications built around the way your business actually works.",
    deliverables: [
      "Discovery and content plan",
      "Responsive UI design",
      "Frontend and backend build",
      "Deployment and handover",
    ],
    sort_order: 1,
  },
  {
    title: "Brand & digital design",
    category: "Creative studio",
    description:
      "Clear visual identity and digital design that helps a growing business look consistent everywhere it appears.",
    deliverables: [
      "Brand direction",
      "Logo and visual system",
      "Social templates",
      "Design guidelines",
    ],
    sort_order: 2,
  },
  {
    title: "Automation & integrations",
    category: "Operations",
    description:
      "Connect the tools you already use and remove repetitive work with dependable, maintainable automations.",
    deliverables: ["Workflow mapping", "API integration", "Data sync", "Monitoring and support"],
    sort_order: 3,
  },
];

const seedCourses = [
  {
    title: "Web Development Foundations",
    category: "Technology",
    description:
      "Learn how the web works and build your first responsive, interactive website with modern tools.",
    level: "Beginner",
    duration: "6 weeks",
    topics: [
      "HTML and semantic structure",
      "CSS layout and responsiveness",
      "JavaScript fundamentals",
      "Working with APIs",
      "Deploying a website",
    ],
    target_audience: "Complete beginners and career changers",
    learning_outcomes: [
      "Explain how browsers request and render web pages",
      "Build a responsive page with semantic HTML and CSS",
      "Add interactivity with JavaScript",
      "Connect a page to a simple API",
    ],
    price_kes: 18000,
    is_free: false,
    sort_order: 1,
  },
  {
    title: "Digital Marketing Essentials",
    category: "Marketing",
    description:
      "Understand how to plan, publish, and measure digital campaigns that reach the right audience.",
    level: "Beginner",
    duration: "4 weeks",
    topics: [
      "Audience research",
      "Content planning",
      "Social media channels",
      "Search fundamentals",
      "Campaign measurement",
    ],
    target_audience: "Business owners and marketing assistants",
    learning_outcomes: [
      "Define a target audience",
      "Create a simple content calendar",
      "Choose suitable channels",
      "Read basic campaign metrics",
    ],
    price_kes: 12000,
    is_free: false,
    sort_order: 2,
  },
  {
    title: "AI Tools for Everyday Work",
    category: "Technology",
    description:
      "A practical introduction to using AI assistants safely and effectively in everyday professional work.",
    level: "All levels",
    duration: "2 weeks",
    topics: [
      "Prompt writing",
      "Research and summarising",
      "Document drafting",
      "Privacy and verification",
    ],
    target_audience: "Professionals who want to work more efficiently",
    learning_outcomes: [
      "Write clear, useful prompts",
      "Review AI output for accuracy",
      "Apply AI to routine work",
      "Recognise privacy risks",
    ],
    price_kes: null,
    is_free: true,
    sort_order: 3,
  },
];

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.query(`USE \`${database}\``);
  for (const statement of schema
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)) {
    await connection.query(statement);
  }

  const [serviceCount] = await connection.query("SELECT COUNT(*) AS total FROM services");
  if (serviceCount[0].total === 0) {
    for (const item of seedServices) {
      await connection.query(
        "INSERT INTO services (id, title, category, description, deliverables, is_published, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [
          crypto.randomUUID(),
          item.title,
          item.category,
          item.description,
          JSON.stringify(item.deliverables),
          item.sort_order,
        ],
      );
    }
  }

  const [courseCount] = await connection.query("SELECT COUNT(*) AS total FROM courses");
  if (courseCount[0].total === 0) {
    for (const item of seedCourses) {
      await connection.query(
        "INSERT INTO courses (id, title, category, description, level, duration, topics, target_audience, learning_outcomes, price_kes, is_free, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
        [
          crypto.randomUUID(),
          item.title,
          item.category,
          item.description,
          item.level,
          item.duration,
          JSON.stringify(item.topics),
          item.target_audience,
          JSON.stringify(item.learning_outcomes),
          item.price_kes,
          item.is_free ? 1 : 0,
          item.sort_order,
        ],
      );
    }
  }

  console.log(
    `Database "${database}" is ready with ${serviceCount[0].total || seedServices.length} services and ${courseCount[0].total || seedCourses.length} courses.`,
  );
} finally {
  await connection.end();
}

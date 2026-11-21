export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
};

export type ServiceRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  duration: string;
  topics: string[];
  target_audience: string;
  learning_outcomes: string[];
  price_kes: number | null;
  is_free: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceInput = {
  id?: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  is_published: boolean;
  sort_order?: number;
};

export type CourseInput = {
  id?: string;
  title: string;
  category: string;
  description: string;
  level: string;
  duration: string;
  topics: string[];
  target_audience: string;
  learning_outcomes: string[];
  price_kes: number | null;
  is_free: boolean;
  is_published: boolean;
  sort_order?: number;
};

export type ApplicationInput = {
  full_name: string;
  email: string;
  phone: string;
  course_id: string;
  course_title: string;
  message: string;
};

export type EnrollmentInput = {
  course_id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
};

export type EnrollmentRow = {
  id: string;
  course_id: string;
  course_title: string;
  status: "registered" | "contacted" | "confirmed" | "completed" | "cancelled";
  message: string;
  created_at: string;
  level: string | null;
  duration: string | null;
  is_free: boolean;
  price_kes: number | null;
};

export type EnquiryInput = {
  full_name: string;
  email: string;
  phone: string;
  service_requested: string;
  message: string;
};

export type CourseDraftInput = {
  title: string;
  category: string;
  level: string;
  duration: string;
  topics: string;
  targetAudience: string;
};

const TOKEN_KEY = "mobix_access_token";
const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function resolveApiBaseUrl() {
  if (typeof window !== "undefined") {
    return import.meta.env["VITE_API_URL"] || DEFAULT_API_BASE_URL;
  }
  if (typeof process !== "undefined" && process.env["API_BASE_URL"]) {
    return process.env["API_BASE_URL"];
  }
  return DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  const authToken = token === undefined ? getToken() : token;
  if (authToken) requestHeaders.set("Authorization", `Bearer ${authToken}`);

  const init: RequestInit = { ...rest, headers: requestHeaders };
  if (body !== undefined) init.body = JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError("Could not connect to the server. Check that the API is running.", 0);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const contentApi = {
  services: () => apiFetch<ServiceRow[]>("/services"),
  courses: () => apiFetch<CourseRow[]>("/courses"),
  submitEnquiry: (input: EnquiryInput) =>
    apiFetch<{ id: string }>("/enquiries", {
      method: "POST",
      body: input,
      token: null,
    }),
  submitApplication: (input: ApplicationInput) =>
    apiFetch<{ id: string }>("/applications", {
      method: "POST",
      body: input,
      token: null,
    }),
};

export const enrollmentApi = {
  enroll: (input: EnrollmentInput) =>
    apiFetch<{ id: string; alreadyEnrolled: boolean }>("/enrollments", {
      method: "POST",
      body: input,
    }),
  mine: () => apiFetch<EnrollmentRow[]>("/enrollments/mine"),
};

export const authApi = {
  register: (input: { fullName: string; email: string; password: string; phone: string }) =>
    apiFetch<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: input,
      token: null,
    }),
  login: (input: { email: string; password: string }) =>
    apiFetch<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: input,
      token: null,
    }),
  me: (token: string | null = null) => apiFetch<{ user: ApiUser }>("/auth/me", { token }),
  claimAdmin: () =>
    apiFetch<{ claimed: boolean; role?: string }>("/auth/claim-admin", { method: "POST" }),
};

export const adminApi = {
  services: () => apiFetch<ServiceRow[]>("/admin/services"),
  courses: () => apiFetch<CourseRow[]>("/admin/courses"),
  saveService: (input: ServiceInput) =>
    apiFetch<ServiceRow>("/admin/services", {
      method: "POST",
      body: input,
    }),
  saveCourse: (input: CourseInput) =>
    apiFetch<CourseRow>("/admin/courses", {
      method: "POST",
      body: input,
    }),
  generateDraft: (input: CourseDraftInput) =>
    apiFetch<{ description: string; learningOutcomes: string[] }>("/admin/course-draft", {
      method: "POST",
      body: input,
    }),
};

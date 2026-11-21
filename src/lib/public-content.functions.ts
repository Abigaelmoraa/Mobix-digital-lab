import { createServerFn } from "@tanstack/react-start";
import { contentApi, type CourseRow, type ServiceRow } from "@/lib/api";

export type PublicService = ServiceRow;
export type PublicCourse = CourseRow;

export const getPublishedServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicService[]> => {
    return contentApi.services();
  },
);

export const getPublishedCourses = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCourse[]> => {
    return contentApi.courses();
  },
);

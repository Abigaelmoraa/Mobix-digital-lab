import { queryOptions } from "@tanstack/react-query";
import { getPublishedCourses, getPublishedServices } from "./public-content.functions";
export const servicesQuery = queryOptions({
  queryKey: ["public", "services"],
  queryFn: () => getPublishedServices(),
});
export const coursesQuery = queryOptions({
  queryKey: ["public", "courses"],
  queryFn: () => getPublishedCourses(),
});

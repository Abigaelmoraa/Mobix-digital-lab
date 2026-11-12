export function hasStudioAccess(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}
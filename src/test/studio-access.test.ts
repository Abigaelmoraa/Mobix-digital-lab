import { describe, expect, it } from "vitest";
import { hasStudioAccess } from "@/lib/studio-access";

describe("studio publishing access", () => {
  it("allows only admin and super-admin roles to manage listings", () => {
    expect(hasStudioAccess("admin")).toBe(true);
    expect(hasStudioAccess("super_admin")).toBe(true);
    expect(hasStudioAccess("student")).toBe(false);
    expect(hasStudioAccess("customer")).toBe(false);
    expect(hasStudioAccess(null)).toBe(false);
  });
});

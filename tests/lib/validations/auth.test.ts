import { describe, it, expect } from "vitest";
import { loginSchema, researcherSignupSchema, companySignupSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });
  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });
  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("researcherSignupSchema", () => {
  it("validates correct researcher signup", () => {
    const result = researcherSignupSchema.safeParse({ name: "Sarah Chen", email: "sarah@example.com", password: "securepass123", username: "sarahchen" });
    expect(result.success).toBe(true);
  });
  it("rejects username with spaces", () => {
    const result = researcherSignupSchema.safeParse({ name: "Sarah Chen", email: "sarah@example.com", password: "securepass123", username: "sarah chen" });
    expect(result.success).toBe(false);
  });
  it("rejects username shorter than 3 chars", () => {
    const result = researcherSignupSchema.safeParse({ name: "Sarah", email: "sarah@example.com", password: "securepass123", username: "sc" });
    expect(result.success).toBe(false);
  });
});

describe("companySignupSchema", () => {
  it("validates correct company signup", () => {
    const result = companySignupSchema.safeParse({ companyName: "Acme Research", email: "info@acme.com", password: "securepass123", username: "acme", industry: "Technology" });
    expect(result.success).toBe(true);
  });
  it("requires companyName", () => {
    const result = companySignupSchema.safeParse({ email: "info@acme.com", password: "securepass123", username: "acme" });
    expect(result.success).toBe(false);
  });
});

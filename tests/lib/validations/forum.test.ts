import { describe, it, expect } from "vitest";
import { questionSchema, answerSchema, commentSchema } from "@/lib/validations/forum";

describe("questionSchema", () => {
  it("validates correct question", () => {
    const result = questionSchema.safeParse({
      title: "How do I validate qualitative research?",
      body: "I need help with validation techniques.",
      tags: ["Qualitative"],
      category: "Research Methodologies",
    });
    expect(result.success).toBe(true);
  });
  it("rejects empty title", () => {
    const result = questionSchema.safeParse({ title: "", body: "Some body", tags: [], category: "General Discussion" });
    expect(result.success).toBe(false);
  });
  it("rejects title over 300 chars", () => {
    const result = questionSchema.safeParse({ title: "a".repeat(301), body: "Body", tags: [], category: "General Discussion" });
    expect(result.success).toBe(false);
  });
});

describe("answerSchema", () => {
  it("validates correct answer", () => {
    expect(answerSchema.safeParse({ body: "Here is my answer." }).success).toBe(true);
  });
  it("rejects empty body", () => {
    expect(answerSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("validates correct comment", () => {
    expect(commentSchema.safeParse({ body: "Great insight!" }).success).toBe(true);
  });
  it("rejects empty comment", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { loginSchema, researcherSignupSchema, companySignupSchema } from "@/lib/validations/auth";
import { isCorporateEmail } from "@/lib/validations/corporate-email";
import { UserRole } from "@prisma/client";

export type AuthActionResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const raw = { email: formData.get("email"), password: formData.get("password") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
    return { success: true };
  } catch (error: unknown) {
    // NextAuth/Next.js throws redirect errors on successful sign-in — re-throw those
    const err = error as { digest?: string; message?: string };
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    // AuthError from next-auth has a `type` property
    const authErr = error as { type?: string };
    if (authErr?.type === "CredentialsSignin") {
      return { error: "Invalid email or password" };
    }
    // Unknown error — could still be auth success with unexpected throw
    console.error("Login error:", error);
    return { error: "Invalid email or password" };
  }
}

export async function researcherSignupAction(formData: FormData): Promise<AuthActionResult> {
  const raw = { name: formData.get("name"), email: formData.get("email"), password: formData.get("password"), username: formData.get("username") };
  const parsed = researcherSignupSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] },
  });
  if (existingUser) {
    return { error: existingUser.email === parsed.data.email ? "Email already registered" : "Username already taken" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      name: parsed.data.name, email: parsed.data.email, username: parsed.data.username, role: UserRole.RESEARCHER,
      accounts: { create: { type: "credentials", provider: "credentials", providerAccountId: parsed.data.email, access_token: hashedPassword } },
    },
  });

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
    return { success: true };
  } catch {
    return { error: "Account created but login failed. Please try logging in." };
  }
}

export async function companySignupAction(formData: FormData): Promise<AuthActionResult> {
  const raw = { companyName: formData.get("companyName"), email: formData.get("email"), password: formData.get("password"), username: formData.get("username"), industry: formData.get("industry") };
  const parsed = companySignupSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.email;
  if (!isCorporateEmail(email)) {
    return { error: "Please use your company email address" };
  }

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] },
  });
  if (existingUser) {
    return { error: existingUser.email === parsed.data.email ? "Email already registered" : "Username already taken" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      companyName: parsed.data.companyName, email: parsed.data.email, username: parsed.data.username, role: UserRole.COMPANY,
      industry: parsed.data.industry || null,
      accounts: { create: { type: "credentials", provider: "credentials", providerAccountId: parsed.data.email, access_token: hashedPassword } },
    },
  });

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
    return { success: true };
  } catch {
    return { error: "Account created but login failed. Please try logging in." };
  }
}

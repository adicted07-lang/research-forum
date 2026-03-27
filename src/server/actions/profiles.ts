"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function getResearcherProfile(username: string) {
  try {
    const user = await db.user.findFirst({
      where: { username, role: "RESEARCHER", deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        about: true,
        expertise: true,
        experienceYears: true,
        hourlyRate: true,
        availability: true,
        socialLinks: true,
        image: true,
        banner: true,
        isVerified: true,
        points: true,
        currentStreak: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            followers: true,
            following: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function getCompanyProfile(username: string) {
  try {
    const user = await db.user.findFirst({
      where: { username, role: "COMPANY", deletedAt: null },
      select: {
        id: true,
        companyName: true,
        username: true,
        description: true,
        about: true,
        industry: true,
        companySize: true,
        website: true,
        socialLinks: true,
        companyLogo: true,
        banner: true,
        hiringStatus: true,
        createdAt: true,
        _count: {
          select: {
            companyJobs: true,
            followers: true,
            following: true,
          },
        },
        companyJobs: {
          where: { status: "OPEN", deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            projectType: true,
            locationPreference: true,
            budgetMin: true,
            budgetMax: true,
            budgetNegotiable: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user) return { error: "User not found" };

    const newUsername = formData.get("username") as string | null;
    if (newUsername && newUsername !== session.user.username) {
      const existing = await db.user.findUnique({ where: { username: newUsername } });
      if (existing) return { error: "Username already taken" };
    }

    if (user.role === "RESEARCHER") {
      const expertiseRaw = formData.get("expertise") as string | null;
      const expertise = expertiseRaw
        ? expertiseRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const socialLinksRaw: Record<string, string> = {};
      const website = formData.get("socialLinks.website") as string | null;
      const twitter = formData.get("socialLinks.twitter") as string | null;
      const linkedin = formData.get("socialLinks.linkedin") as string | null;
      if (website) socialLinksRaw.website = website;
      if (twitter) socialLinksRaw.twitter = twitter;
      if (linkedin) socialLinksRaw.linkedin = linkedin;

      const hourlyRateRaw = formData.get("hourlyRate");
      const experienceYearsRaw = formData.get("experienceYears");

      await db.user.update({
        where: { id: session.user.id },
        data: {
          name: (formData.get("name") as string) || undefined,
          username: newUsername || undefined,
          bio: (formData.get("bio") as string) || undefined,
          about: (formData.get("about") as string) || undefined,
          expertise: expertise,
          hourlyRate: hourlyRateRaw ? parseFloat(hourlyRateRaw as string) : undefined,
          experienceYears: experienceYearsRaw
            ? parseInt(experienceYearsRaw as string, 10)
            : undefined,
          availability: (formData.get("availability") as "AVAILABLE" | "BUSY" | "NOT_AVAILABLE") || undefined,
          socialLinks: Object.keys(socialLinksRaw).length > 0 ? socialLinksRaw : undefined,
          image: (formData.get("image") as string) || undefined,
        },
      });
    } else if (user.role === "COMPANY") {
      const socialLinksRaw: Record<string, string> = {};
      const twitter = formData.get("socialLinks.twitter") as string | null;
      const linkedin = formData.get("socialLinks.linkedin") as string | null;
      if (twitter) socialLinksRaw.twitter = twitter;
      if (linkedin) socialLinksRaw.linkedin = linkedin;

      await db.user.update({
        where: { id: session.user.id },
        data: {
          companyName: (formData.get("companyName") as string) || undefined,
          username: newUsername || undefined,
          description: (formData.get("description") as string) || undefined,
          about: (formData.get("about") as string) || undefined,
          industry: (formData.get("industry") as string) || undefined,
          companySize: (formData.get("companySize") as "SIZE_1_10" | "SIZE_11_50" | "SIZE_51_200" | "SIZE_201_500" | "SIZE_500_PLUS") || undefined,
          website: (formData.get("website") as string) || undefined,
          socialLinks: Object.keys(socialLinksRaw).length > 0 ? socialLinksRaw : undefined,
          companyLogo: (formData.get("image") as string) || undefined,
        },
      });
    }

    return { success: true };
  } catch {
    return { error: "Failed to update profile" };
  }
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const account = await db.account.findFirst({
      where: { userId: session.user.id, provider: "credentials" },
    });
    if (!account?.access_token) {
      return { error: "No password set for this account" };
    }

    const isValid = await bcrypt.compare(oldPassword, account.access_token);
    if (!isValid) return { error: "Current password is incorrect" };

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.account.update({
      where: { id: account.id },
      data: { access_token: hashed },
    });

    return { success: true };
  } catch {
    return { error: "Failed to change password" };
  }
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  } catch {
    return { error: "Failed to delete account" };
  }
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        about: true,
        expertise: true,
        experienceYears: true,
        hourlyRate: true,
        availability: true,
        socialLinks: true,
        image: true,
        banner: true,
        isVerified: true,
        points: true,
        currentStreak: true,
        role: true,
        companyName: true,
        companyLogo: true,
        description: true,
        industry: true,
        companySize: true,
        website: true,
        hiringStatus: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

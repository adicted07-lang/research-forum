"use server";

import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import {
  newFollowerEmail,
  newAnswerEmail,
  applicationStatusEmail,
  newMessageEmail,
  newsletterEmail,
} from "@/lib/email-templates";

export async function getEmailPreview(template: string): Promise<string> {
  const templates: Record<string, string> = {
    "new-follower": newFollowerEmail("Jane Doe"),
    "new-answer": newAnswerEmail(
      "How to handle missing data in longitudinal studies?"
    ),
    "application-status": applicationStatusEmail(
      "ML Research Engineer",
      "SHORTLISTED"
    ),
    "new-message": newMessageEmail("Alice Chen"),
    newsletter: newsletterEmail(
      "Weekly Research Digest",
      "<p>This week's top research discussions and highlights from the community.</p>"
    ),
  };
  return templates[template] || "<p>Template not found</p>";
}

export async function sendTestEmail(template: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return { error: "Forbidden" };
  if (!session.user.email) return { error: "No email on account" };

  const html = await getEmailPreview(template);
  await sendEmail({
    to: session.user.email,
    subject: `[TEST] Email Template Preview: ${template}`,
    html,
  });
  return { success: true };
}

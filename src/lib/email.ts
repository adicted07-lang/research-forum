import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) return; // Skip if not configured
    await resend.emails.send({
      from: "ResearchHub <noreply@researchhub.com>",
      to,
      subject,
      html,
    });
  } catch {
    // Email sending failed — log but don't throw
  }
}

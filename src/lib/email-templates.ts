const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #ffffff;
  color: #1a1a1a;
`;

const buttonStyles = `
  display: inline-block;
  padding: 10px 20px;
  background: #DA552F;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-top: 16px;
`;

const footerStyles = `
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #9ca3af;
`;

export function newFollowerEmail(followerName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        You have a new follower!
      </h2>
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 15px;">
        <strong>${followerName}</strong> started following you on The Intellectual Exchange.
      </p>
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        Connect with your community and share your research insights.
      </p>
      <a href="https://theintellectualexchange.com" style="${buttonStyles}">
        View The Exchange
      </a>
      <div style="${footerStyles}">
        <p>You're receiving this email because you're a member of The Intellectual Exchange.</p>
      </div>
    </div>
  `;
}

export function newAnswerEmail(questionTitle: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        New answer on your question
      </h2>
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 15px;">
        Someone answered your question: <strong>${questionTitle}</strong>
      </p>
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        Check out the answer and mark it as accepted if it solves your problem.
      </p>
      <a href="https://theintellectualexchange.com/forum" style="${buttonStyles}">
        View Answer
      </a>
      <div style="${footerStyles}">
        <p>You're receiving this email because someone answered your question on The Intellectual Exchange.</p>
      </div>
    </div>
  `;
}

export function applicationStatusEmail(jobTitle: string, status: string): string {
  const statusMessages: Record<string, string> = {
    SHORTLISTED: "Great news — you've been shortlisted!",
    ACCEPTED: "Congratulations — your application was accepted!",
    REJECTED: "Your application status has been updated.",
    PENDING: "Your application is being reviewed.",
  };

  const message = statusMessages[status] ?? "Your application status has been updated.";

  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        Application Update
      </h2>
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 15px;">
        ${message}
      </p>
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        Position: <strong>${jobTitle}</strong>
      </p>
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        Status: <strong>${status}</strong>
      </p>
      <a href="https://theintellectualexchange.com/talent-board" style="${buttonStyles}">
        View Applications
      </a>
      <div style="${footerStyles}">
        <p>You're receiving this email because you applied to a job on The Intellectual Exchange.</p>
      </div>
    </div>
  `;
}

export function newMessageEmail(senderName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        New message from ${senderName}
      </h2>
      <p style="margin: 0 0 16px; color: #6b7280; font-size: 15px;">
        <strong>${senderName}</strong> sent you a message on The Intellectual Exchange.
      </p>
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        Log in to read and reply to the message.
      </p>
      <a href="https://theintellectualexchange.com/messages" style="${buttonStyles}">
        View Message
      </a>
      <div style="${footerStyles}">
        <p>You're receiving this email because someone messaged you on The Intellectual Exchange.</p>
      </div>
    </div>
  `;
}

export function newsletterEmail(subject: string, body: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700;">
        ${subject}
      </h2>
      <div style="margin: 0 0 16px; color: #374151; font-size: 14px; line-height: 1.6;">
        ${body}
      </div>
      <div style="${footerStyles}">
        <p>You're receiving this because you subscribed to The Intellectual Exchange newsletters.</p>
        <p><a href="https://theintellectualexchange.com/settings" style="color: #DA552F;">Manage preferences</a></p>
      </div>
    </div>
  `;
}

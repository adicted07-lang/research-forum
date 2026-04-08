const FREE_EMAIL_PROVIDERS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "live.com", "aol.com", "icloud.com", "protonmail.com",
  "mail.com", "zoho.com", "yandex.com", "tutanota.com",
  "gmx.com", "fastmail.com", "hey.com", "pm.me",
  "proton.me", "yahoo.co.uk", "hotmail.co.uk",
];

export function isCorporateEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !FREE_EMAIL_PROVIDERS.includes(domain);
}

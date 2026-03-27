import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/server/actions/profiles";
import { PageLayout } from "@/components/layout/page-layout";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { NewsletterSettings } from "@/components/settings/newsletter-settings";
import { getUserSubscriptions } from "@/server/actions/newsletter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings — ResearchHub",
  description: "Manage your account settings and profile on ResearchHub.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { subscriptions } = await getUserSubscriptions();

  const socialLinks =
    typeof user.socialLinks === "object" && user.socialLinks !== null && !Array.isArray(user.socialLinks)
      ? (user.socialLinks as Record<string, string>)
      : null;

  const initialData = {
    name: user.name,
    username: user.username,
    bio: user.bio,
    about: user.about,
    expertise: user.expertise,
    experienceYears: user.experienceYears,
    hourlyRate: user.hourlyRate,
    availability: user.availability,
    socialLinks,
    companyName: user.companyName,
    description: user.description,
    industry: user.industry,
    companySize: user.companySize,
    website: user.website,
    image: user.image,
  };

  const isResearcher = user.role === "RESEARCHER";
  const displayName = user.name || user.companyName || user.username || "Your Account";

  return (
    <PageLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            Settings
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Manage your profile and account settings for{" "}
            <span className="font-medium">{displayName}</span>
          </p>
        </div>

        {/* Profile section */}
        <section className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            {isResearcher ? "Researcher Profile" : "Company Profile"}
          </h2>
          <ProfileSettingsForm
            role={user.role as "RESEARCHER" | "COMPANY" | "MODERATOR" | "ADMIN"}
            initialData={initialData}
          />
        </section>

        {/* Password section */}
        <section className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-1">
            Change Password
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
            Update your password. If you signed in with Google, you may not have a password set.
          </p>
          <PasswordForm />
        </section>

        {/* Newsletter Preferences */}
        <section className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-1">
            Newsletter Preferences
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
            Choose which newsletters you&apos;d like to receive.
          </p>
          <NewsletterSettings initialSubscriptions={subscriptions} />
        </section>

        {/* Danger zone */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Danger Zone
          </h2>
          <DangerZone />
        </section>
      </div>
    </PageLayout>
  );
}

"use client";

import { useState } from "react";
import { updateProfile } from "@/server/actions/profiles";
import { FileUpload } from "@/components/shared/file-upload";
import { AvatarPicker } from "@/components/settings/avatar-picker";

type UserRole = "RESEARCHER" | "COMPANY" | "MODERATOR" | "ADMIN";
type Availability = "AVAILABLE" | "BUSY" | "NOT_AVAILABLE";
type CompanySize = "SIZE_1_10" | "SIZE_11_50" | "SIZE_51_200" | "SIZE_201_500" | "SIZE_500_PLUS";

interface ProfileSettingsFormProps {
  role: UserRole;
  initialData: {
    name?: string | null;
    username?: string | null;
    bio?: string | null;
    about?: string | null;
    expertise?: string[];
    experienceYears?: number | null;
    hourlyRate?: number | null;
    availability?: Availability | null;
    socialLinks?: Record<string, string> | null;
    companyName?: string | null;
    description?: string | null;
    industry?: string | null;
    companySize?: CompanySize | null;
    website?: string | null;
    image?: string | null;
  };
}

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: "AVAILABLE", label: "Available for hire" },
  { value: "BUSY", label: "Busy" },
  { value: "NOT_AVAILABLE", label: "Not available" },
];

const companySizeOptions: { value: CompanySize; label: string }[] = [
  { value: "SIZE_1_10", label: "1–10 employees" },
  { value: "SIZE_11_50", label: "11–50 employees" },
  { value: "SIZE_51_200", label: "51–200 employees" },
  { value: "SIZE_201_500", label: "201–500 employees" },
  { value: "SIZE_500_PLUS", label: "500+ employees" },
];

export function ProfileSettingsForm({ role, initialData }: ProfileSettingsFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.image ?? "");

  const socialLinks = initialData.socialLinks ?? {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setPending(false);
    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error as string });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully" });
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const labelClass = "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {role === "RESEARCHER" ? (
        <>
          <div>
            <label className={labelClass}>Avatar</label>
            <input type="hidden" name="image" value={avatarUrl} />
            <AvatarPicker
              selected={avatarUrl}
              onChange={setAvatarUrl}
            />
            <div className="mt-3">
              <p className="text-xs text-text-tertiary mb-2">Or upload a photo:</p>
              <FileUpload
                accept="image/jpeg,image/png,image/gif,image/webp"
                maxSize={5 * 1024 * 1024}
                onChange={setAvatarUrl}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" defaultValue={initialData.name ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="username">Username</label>
              <input id="username" name="username" type="text" defaultValue={initialData.username ?? ""} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={2}
              defaultValue={initialData.bio ?? ""}
              placeholder="A short description about yourself"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="about">About</label>
            <textarea
              id="about"
              name="about"
              rows={5}
              defaultValue={initialData.about ?? ""}
              placeholder="Tell the community more about yourself, your research background, and your work"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="expertise">Expertise (comma-separated)</label>
            <input
              id="expertise"
              name="expertise"
              type="text"
              defaultValue={(initialData.expertise ?? []).join(", ")}
              placeholder="e.g. Qualitative Research, Survey Design, Data Analysis"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} htmlFor="experienceYears">Years of experience</label>
              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                defaultValue={initialData.experienceYears ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="hourlyRate">Hourly rate (USD)</label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initialData.hourlyRate ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="availability">Availability</label>
              <select
                id="availability"
                name="availability"
                defaultValue={initialData.availability ?? ""}
                className={inputClass}
              >
                <option value="">Select...</option>
                {availabilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className={labelClass}>Social links</p>
            <div className="space-y-2">
              <input
                name="socialLinks.website"
                type="url"
                defaultValue={socialLinks.website ?? ""}
                placeholder="Website URL"
                className={inputClass}
              />
              <input
                name="socialLinks.twitter"
                type="text"
                defaultValue={socialLinks.twitter ?? ""}
                placeholder="Twitter handle (e.g. @username)"
                className={inputClass}
              />
              <input
                name="socialLinks.linkedin"
                type="url"
                defaultValue={socialLinks.linkedin ?? ""}
                placeholder="LinkedIn profile URL"
                className={inputClass}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={labelClass}>Avatar</label>
            <input type="hidden" name="image" value={avatarUrl} />
            <AvatarPicker
              selected={avatarUrl}
              onChange={setAvatarUrl}
            />
            <div className="mt-3">
              <p className="text-xs text-text-tertiary mb-2">Or upload a logo:</p>
              <FileUpload
                accept="image/jpeg,image/png,image/gif,image/webp"
                maxSize={5 * 1024 * 1024}
                onChange={setAvatarUrl}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                defaultValue={initialData.companyName ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={initialData.username ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={initialData.description ?? ""}
              placeholder="A short description of your company"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="about">About</label>
            <textarea
              id="about"
              name="about"
              rows={5}
              defaultValue={initialData.about ?? ""}
              placeholder="Tell researchers about your company, mission, and research needs"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} htmlFor="industry">Industry</label>
              <input
                id="industry"
                name="industry"
                type="text"
                defaultValue={initialData.industry ?? ""}
                placeholder="e.g. Healthcare, Technology"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="companySize">Company size</label>
              <select
                id="companySize"
                name="companySize"
                defaultValue={initialData.companySize ?? ""}
                className={inputClass}
              >
                <option value="">Select...</option>
                {companySizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                defaultValue={initialData.website ?? ""}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Social links</p>
            <div className="space-y-2">
              <input
                name="socialLinks.twitter"
                type="text"
                defaultValue={socialLinks.twitter ?? ""}
                placeholder="Twitter handle (e.g. @company)"
                className={inputClass}
              />
              <input
                name="socialLinks.linkedin"
                type="url"
                defaultValue={socialLinks.linkedin ?? ""}
                placeholder="LinkedIn company URL"
                className={inputClass}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

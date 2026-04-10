import { notFound } from "next/navigation";
import { getResearcherProfile } from "@/server/actions/profiles";

export default async function EmbedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getResearcherProfile(username);
  if (!profile) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
  const badgeUrl = `${baseUrl}/api/embed/profile/${username}`;
  const profileUrl = `${baseUrl}/profile/${username}`;

  const htmlSnippet = `<a href="${profileUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="${profile.name || username} on The Intellectual Exchange" width="320" height="80" /></a>`;

  const markdownSnippet = `[![${profile.name || username} on TIE](${badgeUrl})](${profileUrl})`;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
        Embed Your Profile Badge
      </h1>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-8">
        Add your researcher badge to your website, blog, or GitHub profile.
      </p>

      {/* Preview */}
      <div className="mb-8 p-6 bg-surface-secondary dark:bg-surface-dark-secondary rounded-lg border border-border dark:border-border-dark">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">Preview</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="Badge preview" width={320} height={80} />
      </div>

      {/* HTML */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">HTML</h3>
        <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
          <code>{htmlSnippet}</code>
        </pre>
      </div>

      {/* Markdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-2">Markdown</h3>
        <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
          <code>{markdownSnippet}</code>
        </pre>
      </div>

      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
        Badge auto-updates with your latest stats. Cached for 1 hour.
      </p>
    </div>
  );
}

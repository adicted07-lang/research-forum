import Link from "next/link";

const ARTICLE_CATEGORIES = [
  { label: "News", value: "news" },
  { label: "Opinion", value: "opinion" },
  { label: "How-To", value: "how_to" },
  { label: "Interview", value: "interview" },
  { label: "Announcement", value: "announcement" },
  { label: "Makers", value: "makers" },
];

export function NewsSidebar() {
  return (
    <div className="space-y-6">
      {/* Submit Article CTA */}
      <Link
        href="/news/submit"
        className="block w-full text-center px-4 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(218,85,47,0.25)]"
      >
        Submit Article
      </Link>

      {/* Categories */}
      <div className="bg-white border border-border-light rounded-md p-4 dark:bg-surface-dark dark:border-border-dark-light">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-3">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/news"
              className="block px-2 py-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-primary hover:bg-primary-lighter rounded-md transition-colors"
            >
              All Articles
            </Link>
          </li>
          {ARTICLE_CATEGORIES.map((cat) => (
            <li key={cat.value}>
              <Link
                href={`/news?category=${encodeURIComponent(cat.value)}`}
                className="block px-2 py-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-primary hover:bg-primary-lighter rounded-md transition-colors"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

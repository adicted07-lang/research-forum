import Link from "next/link";
import { MessageSquare, FileText, Network } from "lucide-react";

interface RelatedItem {
  type: "question" | "article";
  title: string;
  url: string;
}

export function RelatedContent({ items }: { items: RelatedItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Network className="w-4 h-4 text-text-tertiary" />
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
          Related Content
        </h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              href={item.url}
              className="flex items-start gap-2 py-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
            >
              {item.type === "question" ? (
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span className="line-clamp-2">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

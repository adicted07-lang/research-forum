interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div
      className={[
        "prose prose-base max-w-none",
        "text-text-primary dark:text-text-dark-primary",
        "prose-headings:text-text-primary dark:prose-headings:text-text-dark-primary",
        "prose-headings:font-bold prose-headings:leading-tight",
        "prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4",
        "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3",
        "prose-p:text-text-primary dark:prose-p:text-text-dark-primary",
        "prose-p:leading-relaxed prose-p:mb-4",
        "prose-strong:text-text-primary dark:prose-strong:text-text-dark-primary",
        "prose-code:text-text-primary dark:prose-code:text-text-dark-primary",
        "prose-code:bg-surface dark:prose-code:bg-surface-dark",
        "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
        "prose-blockquote:border-l-primary prose-blockquote:text-text-secondary dark:prose-blockquote:text-text-dark-secondary",
        "prose-blockquote:bg-surface/50 dark:prose-blockquote:bg-surface-dark/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic",
        "prose-li:text-text-primary dark:prose-li:text-text-dark-primary",
        "prose-li:my-1",
        "prose-ul:my-4 prose-ol:my-4",
        "prose-a:text-primary hover:prose-a:text-primary-hover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div
      className={[
        "prose prose-sm max-w-none",
        "text-text-primary dark:text-text-dark-primary",
        "prose-headings:text-text-primary dark:prose-headings:text-text-dark-primary",
        "prose-p:text-text-primary dark:prose-p:text-text-dark-primary",
        "prose-strong:text-text-primary dark:prose-strong:text-text-dark-primary",
        "prose-code:text-text-primary dark:prose-code:text-text-dark-primary",
        "prose-code:bg-surface dark:prose-code:bg-surface-dark",
        "prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
        "prose-blockquote:border-l-primary prose-blockquote:text-text-secondary dark:prose-blockquote:text-text-dark-secondary",
        "prose-li:text-text-primary dark:prose-li:text-text-dark-primary",
        "prose-a:text-primary hover:prose-a:text-primary-hover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

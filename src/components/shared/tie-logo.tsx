export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
  const r = Math.round(size * 0.25);
  const fontSize = size * 0.32;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="22" fill="#DA552F" />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="var(--font-outfit), system-ui, sans-serif"
        fontWeight="700"
        fontSize="32"
        letterSpacing="1"
      >
        T.I.E
      </text>
    </svg>
  );
}

export function TieWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-medium text-text-tertiary dark:text-text-dark-tertiary">The</span>
      {" "}
      <span className="font-bold text-text-primary dark:text-text-dark-primary">Intellectual</span>
      {" "}
      <span className="font-bold text-text-primary dark:text-text-dark-primary">Exchange</span>
    </span>
  );
}

export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
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

export function TieBrand({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <TieLogo size={30} />
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-bold tracking-wide text-text-primary dark:text-text-dark-primary uppercase" style={{ letterSpacing: "0.12em" }}>
          T.I.E
        </span>
        {!compact && (
          <span className="hidden sm:block text-[9px] font-medium tracking-widest text-text-tertiary dark:text-text-dark-tertiary uppercase" style={{ letterSpacing: "0.15em" }}>
            Intellectual Exchange
          </span>
        )}
      </span>
    </span>
  );
}

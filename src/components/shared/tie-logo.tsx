/* eslint-disable @next/next/no-img-element */

export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="T.I.E"
      width={size}
      height={size}
      className={`rounded-[${Math.round(size * 0.22)}px] ${className || ""}`}
      style={{ borderRadius: size * 0.22 }}
    />
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

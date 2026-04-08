/* eslint-disable @next/next/no-img-element */

export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="The Intellectual Exchange"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: size * 0.22 }}
    />
  );
}

export function TieBrand() {
  return <TieLogo size={40} />;
}

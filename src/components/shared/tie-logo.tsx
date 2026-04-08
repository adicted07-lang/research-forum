import Image from "next/image";

export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="The Intellectual Exchange"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: size * 0.22 }}
    />
  );
}

export function TieBrand({ compact }: { compact?: boolean }) {
  return <TieLogo size={compact ? 28 : 40} />;
}

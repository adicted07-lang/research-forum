import Image from "next/image";

export function TieLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/favicon.svg"
      alt="The Intellectual Exchange"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function TieBrand({ compact }: { compact?: boolean }) {
  return <TieLogo size={compact ? 32 : 44} />;
}

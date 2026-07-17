import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Image
      src={inverted ? "/media/logo-white.png" : "/media/logo-black.png"}
      alt="EsExpress"
      width={620}
      height={220}
      priority
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}

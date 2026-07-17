import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, text, align = "left", className }: { eyebrow?: string; title: string; text?: string; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.34em] text-black/50">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl leading-[0.96] tracking-[-0.04em] sm:text-5xl lg:text-7xl">{title}</h2>
      {text ? <p className="mt-6 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">{text}</p> : null}
    </div>
  );
}

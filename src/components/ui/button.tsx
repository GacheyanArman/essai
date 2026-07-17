import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const base = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const variants = {
  dark: "bg-black text-white hover:bg-neutral-800 focus-visible:ring-black",
  light: "bg-white text-black hover:bg-stone-100 focus-visible:ring-white",
  outline: "border border-black/20 bg-transparent text-black hover:border-black hover:bg-black hover:text-white focus-visible:ring-black",
  ghost: "bg-transparent text-current hover:bg-black/5 focus-visible:ring-black",
};

type Variant = keyof typeof variants;

export function Button({ className, variant = "dark", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({ href, children, className, variant = "dark" }: { href: string; children: ReactNode; className?: string; variant?: Variant }) {
  return <Link href={href} className={cn(base, variants[variant], className)}>{children}</Link>;
}

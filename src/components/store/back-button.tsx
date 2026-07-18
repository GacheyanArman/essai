"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()} 
      className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/40 transition hover:text-black"
    >
      <ArrowLeft className="h-3 w-3" />
      Назад
    </button>
  );
}

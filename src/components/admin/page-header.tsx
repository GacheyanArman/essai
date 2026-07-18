import type { ReactNode } from "react";

export function PageHeader({ eyebrow = "EsExpress admin", title, text, action }: { eyebrow?: string; title: string; text?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/40">{eyebrow}</p><h1 className="mt-3 font-display text-5xl tracking-[-0.05em] sm:text-6xl">{title}</h1>{text ? <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">{text}</p> : null}</div>{action}</div>;
}

export function Notice({ type, error }: { type?: string; error?: string }) {
  if (error) {
    return <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>;
  }
  if (!type) return null;
  return <div className="mb-6 rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm">{type === "deleted" ? "Запись удалена." : "Изменения сохранены."}</div>;
}
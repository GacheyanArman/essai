"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  productName: string;
  price: string;
  productUrl: string;
  className?: string;
  label?: string;
};

export function TelegramOrderButton({ username, productName, price, productUrl, className, label = "Купить через Telegram" }: Props) {
  const [opening, setOpening] = useState(false);

  function openTelegram() {
    setOpening(true);
    const cleanUsername = username.replace(/^@/, "");
    const message = [
      "Здравствуйте!",
      "",
      "Хочу заказать товар.",
      "",
      `Название: ${productName}`,
      `Цена: ${price}`,
      `Ссылка: ${productUrl}`,
      "",
      "Спасибо!",
    ].join("\n");
    const encoded = encodeURIComponent(message);
    const appUrl = `tg://resolve?domain=${cleanUsername}&text=${encoded}`;
    const webUrl = `https://t.me/${cleanUsername}?text=${encoded}`;
    window.location.href = appUrl;
    window.setTimeout(() => {
      if (document.visibilityState === "visible") window.location.href = webUrl;
      setOpening(false);
    }, 750);
  }

  return (
    <button
      type="button"
      onClick={openTelegram}
      disabled={opening}
      className={cn("inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-black px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01] hover:bg-neutral-800 disabled:opacity-70 sm:w-auto", className)}
    >
      <Send className="h-4 w-4" aria-hidden="true" />
      {opening ? "Открываем Telegram…" : label}
    </button>
  );
}

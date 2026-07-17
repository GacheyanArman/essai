import type { Metadata } from "next";
import { ArrowUpRight, Send } from "lucide-react";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Контакты", description: "Связаться с менеджером EsExpress и оформить персональный заказ." };

export default async function ContactsPage() {
  const settings = await getSettings();
  const manager = settings.telegramUsername.replace(/^@/, "");
  const channel = settings.channelUsername.replace(/^@/, "");
  return (
    <div className="mx-auto max-w-[1560px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">Private contact</p><h1 className="mt-5 font-display text-7xl leading-[.84] tracking-[-0.06em] sm:text-8xl">Начнём с вашего желания</h1><p className="mt-8 max-w-xl text-sm leading-8 text-black/60">Отправьте менеджеру название, ссылку или фотографию товара. Мы проверим возможность выкупа, цену и срок доставки.</p></div>
        <div className="rounded-[2rem] bg-black p-8 text-white sm:p-10"><Send className="h-7 w-7" /><h2 className="mt-14 font-display text-5xl tracking-[-0.045em]">Telegram</h2><p className="mt-5 text-sm leading-7 text-white/55">Живой менеджер отвечает на вопросы, помогает подобрать позицию и ведёт заказ до получения.</p><a href={`https://t.me/${manager}`} target="_blank" rel="noreferrer" className="mt-9 flex min-h-14 items-center justify-between rounded-full bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">@{manager}<ArrowUpRight className="h-4 w-4" /></a><a href={`https://t.me/${channel}`} target="_blank" rel="noreferrer" className="mt-3 flex min-h-14 items-center justify-between rounded-full border border-white/20 px-6 text-[10px] font-semibold uppercase tracking-[0.18em]">Канал @{channel}<ArrowUpRight className="h-4 w-4" /></a></div>
      </div>
      <div className="mt-20 grid gap-4 sm:grid-cols-3">{[{ n: "01", t: "Что отправить", d: "Ссылку, название, размер, цвет или фотографию нужной позиции." }, { n: "02", t: "Что получите", d: "Подтверждение наличия, источника, итоговой цены и ориентировочного срока." }, { n: "03", t: "Когда ответим", d: "Менеджер отвечает вручную в рабочее время — без автоматического спама." }].map((item) => <div key={item.n} className="rounded-[1.7rem] border border-black/10 p-7"><span className="text-[10px] tracking-[0.2em] text-black/35">{item.n}</span><h2 className="mt-12 font-display text-3xl tracking-[-0.035em]">{item.t}</h2><p className="mt-4 text-sm leading-7 text-black/55">{item.d}</p></div>)}</div>
    </div>
  );
}

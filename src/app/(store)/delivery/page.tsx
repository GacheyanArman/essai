import type { Metadata } from "next";
import { CreditCard, PackageCheck, Plane, Truck } from "lucide-react";
import { OrderSteps } from "@/components/store/order-steps";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Доставка и оплата", description: "Как проходит заказ, выкуп и доставка EsExpress из Европы и Китая." };

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-[1560px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Delivery & payment" title="Понятный путь заказа" text="Сроки и финальная стоимость подтверждаются менеджером до оплаты. Заказ сопровождается на каждом этапе." />
      <div className="mt-14"><OrderSteps /></div>
      <div className="mt-20 grid gap-5 md:grid-cols-2">
        {[{ icon: Plane, title: "Международная доставка", text: "Под заказ из Европы или Китая — ориентировочно 10–12 дней до Москвы. Фактический срок зависит от бренда и страны отправления." }, { icon: PackageCheck, title: "Склад в Москве", text: "Товары в наличии собираем обычно за 1–3 дня. Перед отправкой проверяем состояние и надёжно упаковываем, особенно парфюмерию." }, { icon: Truck, title: "По России", text: "Отправляем СДЭКом в пункт выдачи в любом городе. По Москве можно заказать курьерскую доставку." }, { icon: CreditCard, title: "Оплата", text: "Менеджер подтверждает итоговую стоимость и реквизиты. Для заказных позиций выкуп начинается после оплаты." }].map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-[2rem] border border-black/10 p-8 sm:p-10"><Icon className="h-7 w-7" strokeWidth={1.4} /><h2 className="mt-12 font-display text-4xl tracking-[-0.04em]">{item.title}</h2><p className="mt-5 text-sm leading-7 text-black/55">{item.text}</p></article>; })}
      </div>
      <div className="mt-20 rounded-[2rem] bg-black p-8 text-white sm:p-12"><h2 className="font-display text-5xl tracking-[-0.045em]">Важно</h2><p className="mt-6 max-w-4xl text-sm leading-7 text-white/60">Для редких и заказных позиций сроки могут меняться из-за наличия у ритейлера, международной логистики или таможенных процедур. Менеджер сообщает актуальный статус и предупреждает об изменениях.</p></div>
    </div>
  );
}

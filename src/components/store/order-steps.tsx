import { MessageCircle, PackageCheck, SearchCheck, Truck } from "lucide-react";

const steps = [
  { icon: MessageCircle, title: "Запрос", text: "Пишите менеджеру в Telegram и отправляете ссылку или описание нужной позиции." },
  { icon: SearchCheck, title: "Проверка", text: "Проверяем наличие, цену, источник и подтверждаем финальные условия до оплаты." },
  { icon: PackageCheck, title: "Выкуп", text: "Покупаем только у официальных сайтов брендов и авторизованных ритейлеров." },
  { icon: Truck, title: "Доставка", text: "Ведём заказ до Москвы, тщательно упаковываем и отправляем СДЭКом в ваш город." },
];

export function OrderSteps() {
  return (
    <div className="grid border-l border-t border-black/10 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="min-h-72 border-b border-r border-black/10 p-7 sm:p-8">
            <div className="flex items-start justify-between">
              <Icon className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-[0.2em] text-black/35">0{index + 1}</span>
            </div>
            <h3 className="mt-16 font-display text-4xl tracking-[-0.04em]">{step.title}</h3>
            <p className="mt-4 text-sm leading-7 text-black/55">{step.text}</p>
          </div>
        );
      })}
    </div>
  );
}

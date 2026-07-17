import { updateSettings } from "@/app/admin/actions";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { getSettings } from "@/lib/data";

type SearchParams = Promise<{ saved?: string }>;
export const dynamic = "force-dynamic";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) { return <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{label}</span>{children}{hint ? <span className="mt-2 block text-xs text-black/35">{hint}</span> : null}</label>; }

export default async function HomeSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return <><PageHeader title="Главная и SEO" text="Тексты бренда, Telegram-контакты, метаданные и ключевые блоки главной страницы." /><Notice type={params.saved ? "saved" : undefined} />
    <form action={updateSettings} className="space-y-6">
      <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-6 sm:p-8"><h2 className="font-display text-4xl tracking-[-0.04em]">Бренд и контакты</h2><div className="mt-7 grid gap-5 md:grid-cols-2"><Field label="Название магазина"><Input name="storeName" defaultValue={settings.storeName} /></Field><Field label="Короткий слоган"><Input name="tagline" defaultValue={settings.tagline} /></Field><Field label="Telegram менеджера" hint="Без ссылки, можно с @"><Input name="telegramUsername" defaultValue={settings.telegramUsername} /></Field><Field label="Telegram-канал"><Input name="channelUsername" defaultValue={settings.channelUsername} /></Field><Field label="Верхняя строка сайта"><Input name="announcement" defaultValue={settings.announcement} /></Field><Field label="Текст в футере"><Input name="footerText" defaultValue={settings.footerText} /></Field></div></section>
      <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-6 sm:p-8"><h2 className="font-display text-4xl tracking-[-0.04em]">Первый экран</h2><div className="mt-7 space-y-5"><Field label="Надзаголовок"><Input name="heroEyebrow" defaultValue={settings.heroEyebrow} /></Field><Field label="Главный заголовок"><Textarea name="heroTitle" defaultValue={settings.heroTitle} className="min-h-28" /></Field><Field label="Описание"><Textarea name="heroText" defaultValue={settings.heroText} /></Field></div></section>
      <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-6 sm:p-8"><h2 className="font-display text-4xl tracking-[-0.04em]">История основателя</h2><div className="mt-7 space-y-5"><Field label="Заголовок"><Input name="founderTitle" defaultValue={settings.founderTitle} /></Field><Field label="Текст"><Textarea name="founderText" defaultValue={settings.founderText} className="min-h-36" /></Field></div></section>
      <section className="rounded-[1.5rem] border border-black/10 bg-white/75 p-6 sm:p-8"><h2 className="font-display text-4xl tracking-[-0.04em]">SEO по умолчанию</h2><div className="mt-7 space-y-5"><Field label="Meta title"><Input name="seoTitle" defaultValue={settings.seoTitle} /></Field><Field label="Meta description"><Textarea name="seoDescription" defaultValue={settings.seoDescription} /></Field></div></section>
      <Button type="submit" className="w-full sm:w-auto">Сохранить настройки</Button>
    </form>
  </>;
}

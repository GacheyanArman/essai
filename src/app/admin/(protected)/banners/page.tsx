import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { createBanner, deleteBanner, updateBanner } from "@/app/admin/actions";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { db } from "@/lib/store-db";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;
export const dynamic = "force-dynamic";

function BannerFields({ banner }: { banner?: { id: string; eyebrow: string; title: string; subtitle: string; image: string; ctaLabel: string; ctaHref: string; theme: string; position: number; isActive: boolean } }) {
  return <><Input name="eyebrow" defaultValue={banner?.eyebrow} placeholder="Надзаголовок" /><Input name="title" required defaultValue={banner?.title} placeholder="Заголовок" /><Input name="image" defaultValue={banner?.image} placeholder="URL изображения" /><Input type="file" name="imageFile" accept="image/*" className="h-auto py-3" /><Input name="ctaLabel" defaultValue={banner?.ctaLabel ?? "Смотреть коллекцию"} placeholder="Текст кнопки" /><Input name="ctaHref" defaultValue={banner?.ctaHref ?? "/catalog"} placeholder="Ссылка кнопки" /><Input name="theme" defaultValue={banner?.theme ?? "dark"} placeholder="Тема" /><Input type="number" name="position" defaultValue={banner?.position ?? 0} placeholder="Порядок" /><Textarea name="subtitle" defaultValue={banner?.subtitle} placeholder="Подзаголовок" className="md:col-span-2" /><label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm md:col-span-2"><input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} /> Активен</label></>;
}

export default async function BannersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams; const banners = await db.banner.findMany({ orderBy: { position: "asc" } });
  return <><PageHeader title="Баннеры" text="Большие имиджевые блоки главной страницы." /><Notice type={params.deleted ? "deleted" : params.saved ? "saved" : undefined} />
    <details className="mb-6 rounded-[1.5rem] border border-black/10 bg-white/75 p-5 open:pb-7"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> Добавить баннер</summary><form action={createBanner} className="mt-6 grid gap-4 md:grid-cols-2"><BannerFields /><Button className="md:col-span-2">Создать баннер</Button></form></details>
    <div className="space-y-4">{banners.map((banner: import("@/lib/types").Banner) => <details key={banner.id} className="rounded-[1.5rem] border border-black/10 bg-white/75 p-5 open:pb-6"><summary className="grid cursor-pointer list-none gap-4 md:grid-cols-[220px_1fr_auto] md:items-center"><div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#eee]"><Image src={banner.image || "/media/perfume-amouage.webp"} alt={banner.title} fill className="object-cover" /></div><div><p className="text-[9px] uppercase tracking-[0.2em] text-black/35">{banner.eyebrow}</p><h2 className="mt-2 font-display text-3xl tracking-[-0.035em]">{banner.title}</h2><p className="mt-2 text-xs text-black/45">Позиция {banner.position} · {banner.isActive ? "активен" : "выключен"}</p></div><span className="text-xs text-black/40">Редактировать</span></summary><form action={updateBanner} className="mt-6 grid gap-4 border-t border-black/10 pt-6 md:grid-cols-2"><input type="hidden" name="id" value={banner.id} /><BannerFields banner={banner} /><Button className="md:col-span-2">Сохранить</Button></form><form action={deleteBanner} className="mt-3"><input type="hidden" name="id" value={banner.id} /><button className="flex items-center gap-2 text-xs text-red-600"><Trash2 className="h-4 w-4" /> Удалить баннер</button></form></details>)}</div>
  </>;
}

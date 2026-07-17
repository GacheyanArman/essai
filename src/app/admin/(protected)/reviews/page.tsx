import { Plus, Trash2 } from "lucide-react";
import { createReview, deleteReview, toggleReview } from "@/app/admin/actions";
import { Notice, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { db } from "@/lib/store-db";

type SearchParams = Promise<{ saved?: string; deleted?: string }>;
export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const reviews = await db.review.findMany({ include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return <><PageHeader title="Отзывы" text="Публикуйте только проверенные отзывы и управляйте их видимостью на главной." /><Notice type={params.deleted ? "deleted" : params.saved ? "saved" : undefined} />
    <details className="mb-6 rounded-[1.5rem] border border-black/10 bg-white/75 p-5 open:pb-7"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> Добавить отзыв</summary><form action={createReview} className="mt-6 grid gap-4 md:grid-cols-2"><Input name="author" required placeholder="Имя" /><Input name="city" placeholder="Город" /><Input type="number" min="1" max="5" name="rating" defaultValue="5" /><label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm"><input type="checkbox" name="isApproved" defaultChecked /> Опубликовать</label><Textarea name="text" required placeholder="Текст отзыва" className="md:col-span-2" /><Button className="md:col-span-2">Добавить отзыв</Button></form></details>
    <div className="grid gap-4 xl:grid-cols-2">{reviews.map((review: import("@/lib/types").Review & { product: { name: string } | null }) => <article key={review.id} className="rounded-[1.5rem] border border-black/10 bg-white/75 p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs tracking-[0.18em]">{"★".repeat(review.rating)}</p><h2 className="mt-4 font-display text-3xl tracking-[-0.035em]">{review.author}{review.city ? ` · ${review.city}` : ""}</h2></div></div><blockquote className="mt-6 text-sm leading-7 text-black/60">«{review.text}»</blockquote>{review.product ? <p className="mt-4 text-xs text-black/35">Товар: {review.product.name}</p> : null}<div className="mt-7 flex gap-3 border-t border-black/10 pt-5"><form action={toggleReview}><input type="hidden" name="id" value={review.id} /><button className="rounded-full border border-black/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white">{review.isApproved ? "Скрыть" : "Опубликовать"}</button></form><form action={deleteReview}><input type="hidden" name="id" value={review.id} /><button className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 hover:bg-red-600 hover:text-white" aria-label="Удалить"><Trash2 className="h-4 w-4" /></button></form></div></article>)}</div>
  </>;
}

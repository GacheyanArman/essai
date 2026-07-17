import Image from "next/image";
import Link from "next/link";
import type { Brand, Product, ProductImage } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ProductCardProduct = Product & { brand: Brand; images: ProductImage[] };

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const image = product.images[0]?.url || "/media/logo-card.webp";
  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-[1.75rem] bg-[#f0efe8]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="flex flex-wrap gap-2">
              {product.isNew ? <span className="rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]">Новинка</span> : null}
              {product.isOnSale ? <span className="rounded-full bg-black px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white">Sale</span> : null}
            </div>
          </div>
          <div className="absolute inset-x-4 bottom-4 translate-y-4 rounded-full bg-black px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Смотреть товар
          </div>
        </div>
      </Link>
      <div className="px-1 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">{product.brand.name}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 block text-sm leading-6 transition hover:opacity-60">{product.name}</Link>
        <div className="mt-2 flex items-center gap-2 text-sm font-medium">
          <span>{formatPrice(product.price, product.currency)}</span>
          {product.compareAtPrice ? <span className="text-black/35 line-through">{formatPrice(product.compareAtPrice, product.currency)}</span> : null}
        </div>
      </div>
    </article>
  );
}

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, productName }: { images: ProductImage[], productName: string }) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const displayImages = images.length ? images : [{ id: "fallback", url: "/media/logo-card.webp", alt: productName, sortOrder: 0, productId: "fallback" } as ProductImage];

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (zoomIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [zoomIndex]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {displayImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setZoomIndex(index)}
            className={`relative overflow-hidden rounded-[1.7rem] bg-[#eeece4] cursor-zoom-in block outline-none focus-visible:ring-2 focus-visible:ring-black ${index === 0 ? "sm:col-span-2 aspect-[4/3]" : "aspect-[4/5]"}`}
          >
            <Image 
              src={image.url} 
              alt={image.alt || productName} 
              fill 
              priority={index === 0} 
              sizes="(max-width: 1024px) 100vw, 55vw" 
              className="object-cover transition-transform duration-500 hover:scale-[1.02]" 
            />
          </button>
        ))}
      </div>

      {zoomIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setZoomIndex(null)}
        >
          <button 
            type="button" 
            className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setZoomIndex(null); }}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full w-full max-w-6xl cursor-default" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={displayImages[zoomIndex].url} 
              alt={displayImages[zoomIndex].alt || productName} 
              fill 
              className="object-contain animate-in fade-in zoom-in duration-300" 
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

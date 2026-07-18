import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "light",
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EsExpress — оригинальные бренды и нишевая парфюмерия",
    template: "%s — EsExpress",
  },
  description:
    "Оригинальная одежда, обувь, аксессуары и нишевая парфюмерия из Европы и Китая с доставкой по России.",
  applicationName: "EsExpress",
  openGraph: {
    title: "EsExpress — оригинальные бренды и нишевая парфюмерия",
    description:
      "Оригинальная одежда, обувь, аксессуары и нишевая парфюмерия из Европы и Китая с доставкой по России.",
    url: siteUrl,
    siteName: "EsExpress",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/media/founder.jpg",
        width: 697,
        height: 782,
        alt: "EsExpress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EsExpress — оригинальные бренды и нишевая парфюмерия",
    description:
      "Оригинальная одежда, обувь, аксессуары и нишевая парфюмерия из Европы и Китая с доставкой по России.",
    images: ["/media/founder.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/media/logo-card.webp",
    shortcut: "/media/logo-card.webp",
    apple: "/media/logo-card.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

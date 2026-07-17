import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/utils";

export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "light" };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.seoTitle, template: `%s — ${settings.storeName}` },
    description: settings.seoDescription,
    applicationName: settings.storeName,
    openGraph: { title: settings.seoTitle, description: settings.seoDescription, url: siteUrl, siteName: settings.storeName, locale: "ru_RU", type: "website", images: [{ url: "/media/founder.jpg", width: 697, height: 782, alt: settings.storeName }] },
    twitter: { card: "summary_large_image", title: settings.seoTitle, description: settings.seoDescription, images: ["/media/founder.jpg"] },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}

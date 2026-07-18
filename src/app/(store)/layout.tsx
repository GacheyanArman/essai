import Script from "next/script";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.storeName,
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/media/logo-black.png`,
    sameAs: [`https://t.me/${settings.channelUsername.replace(/^@/, "")}`],
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", url: `https://t.me/${settings.telegramUsername.replace(/^@/, "")}` },
  };
  return <><Header announcement={settings.announcement} telegramUsername={settings.telegramUsername} /><main>{children}</main><Footer telegramUsername={settings.telegramUsername} channelUsername={settings.channelUsername} footerText={settings.footerText} /><Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} /></>;
}

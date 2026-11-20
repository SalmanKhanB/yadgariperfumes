import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import WhatsAppChatWidget from "@/components/storefront/WhatsAppChatWidget";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";

export const revalidate = 86400; // Cache on CDN Edge (invalidated on-demand on CMS or settings update)

export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedSiteSettings();
  const cleanSettings = JSON.parse(JSON.stringify(settings));
  
  return (
    <CurrencyProvider currency={cleanSettings.currency || "USD"}>
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans">
        <Navbar settings={cleanSettings} />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Footer settings={cleanSettings} />
        <WhatsAppChatWidget settings={cleanSettings} />
      </div>
    </CurrencyProvider>
  );
}

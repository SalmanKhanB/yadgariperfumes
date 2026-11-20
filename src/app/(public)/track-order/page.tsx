import { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { Truck, Clock, ShieldCheck, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `Track Your Order | Real-Time Delivery Status | ${storeName}`,
    description: `Track your luxury fragrance parcel in real-time. Enter your Order ID and email to view dispatch status, tracking code, and estimated delivery.`,
    keywords: [
      "Track order",
      "Yadgari perfume delivery status",
      "Parcel tracking",
      "Order lookup",
      "Courier status"
    ],
    openGraph: {
      title: `Track Your Order | ${storeName}`,
      description: `Track your fragrance parcel in real-time with your Order ID.`,
      url: `${baseUrl}/track-order`,
      siteName: storeName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `Track Your Order | ${storeName}`,
      description: `Check live delivery and courier status for your order.`
    },
    alternates: {
      canonical: `${baseUrl}/track-order`
    }
  };
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-32 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Track Order' }]} />

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles size={13} /> Real-Time Courier Tracking
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground font-serif">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Enter your Order ID (from your confirmation email/SMS) and the email address used at checkout to monitor live dispatch status.
          </p>
        </div>

        {/* Value Proposition Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">24–48h Dispatch</p>
              <p className="text-[11px] text-muted-foreground">Carefully inspected & packed</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Express Transit</p>
              <p className="text-[11px] text-muted-foreground">Doorstep tracked courier</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Tamper-Proof</p>
              <p className="text-[11px] text-muted-foreground">Sealed luxury box flacons</p>
            </div>
          </div>
        </div>

        {/* Tracking Form & Results Client */}
        <TrackOrderClient />
      </div>
    </div>
  );
}

import { getProducts } from "@/server/repositories/productRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import WishlistClientGrid from "./WishlistClientGrid";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
export const metadata = {
  title: "My Wishlist",
  description: "View your saved products",
};

export default async function WishlistPage() {
  const settings = await getSiteSettings();
  
  const cols = settings?.storefrontLayout?.productGridColumns || "4";
  const gridClass = 
    cols === "2" ? "grid-cols-2 lg:grid-cols-2" :
    cols === "3" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";
    
  const cardStyle = settings?.storefrontLayout?.productCardStyle || "standard";

  return (
    <div className="flex flex-col min-h-screen pt-24 overflow-hidden relative bg-background">
      {/* Flagship Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <section className="relative py-24 px-6 overflow-hidden z-10">
        <div className="relative z-10 max-w-[90rem] mx-auto flex flex-col items-center text-center">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: 'Wishlist' }]} />
          </div>
          <Heart size={48} className="mb-6 text-primary animate-pulse" />
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-6 text-foreground">
            Your Wishlist
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Pieces you've saved for later. Ready to make them yours?
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="relative z-10 pb-24 px-6 max-w-[90rem] mx-auto w-full">
        <WishlistClientGrid 
          gridClass={gridClass} 
          cardStyle={cardStyle} 
          showSoldOutBadge={settings?.storefrontLayout?.showSoldOutBadge !== false} 
        />
      </section>
    </div>
  );
}

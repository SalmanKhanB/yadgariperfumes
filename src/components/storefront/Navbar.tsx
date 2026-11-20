"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { ShoppingBag, Menu, X, Search, User, Heart, Sparkles, Home, Info, Phone, ChevronRight, Mail, ShoppingCart, Star, Tag, Box, Hash, Settings, MessageCircle, MapPin, Calendar, Camera, Video, Music, Book, FileText, CheckCircle, AlertCircle, Gift, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession, signOut } from "next-auth/react";
import ThemeSwitcher from "@/components/storefront/ThemeSwitcher";
import GoogleTranslate from "@/components/ui/GoogleTranslate";

export default function Navbar({ settings, isPreview = false }: { settings: any, isPreview?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const cart = useAppStore((state) => state.cart);
  const cartItemCount = cart.length; // Show number of distinct line items in cart
  const { wishlistIds } = useWishlist();
  const { language, setLanguage } = useLanguage();
  const wishlistCount = wishlistIds.length;
  const headerLinks = settings.headerLinks || [];
  const name = settings.name || "STOREFRONT";

  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      // If we are on the homepage, we trigger the solid nav after 50px of scroll
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Init state in case we reload half way down the page
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const announcementBar = settings?.announcementBar;

  // Determine navbar styling based on scroll and page, and ensure the first section is a hero
  const sectionOrder = settings?.storefrontLayout?.sectionOrder || ["hero"];
  const isTransparent = isHome && !scrolled && sectionOrder[0] === 'hero';
  
  const navBgClass = isTransparent ? "bg-transparent" : "bg-background";
  const navBgColor = isTransparent ? "transparent" : (settings?.headerStyle?.backgroundColor || "#F4F1EA");
  const navTextColor = isTransparent ? "#ffffff" : (settings?.headerStyle?.textColor || "#141210");
  const navBorderColor = isTransparent ? "transparent" : `${navTextColor}1A`; // 10% opacity
  const rawAnnBg = settings?.announcementBar?.backgroundColor;
  const announcementBg = (!rawAnnBg || rawAnnBg === "#111827" || rawAnnBg === "#0f172a") ? "#141210" : rawAnnBg;
  const announcementText = settings?.announcementBar?.textColor || "#FFFFFF";

  const logoAlignment = settings?.logoAlignment || settings?.headerStyle?.logoAlignment || "left";
  const showLogo = settings?.showLogo ?? settings?.headerStyle?.showLogo ?? true;
  const showStoreName = settings?.showStoreName !== false && settings?.headerStyle?.showStoreName !== false;

  const renderLogo = (sizeClass = "h-6 sm:h-7") => {
    if (!showLogo) return null;
    if (settings?.logo && typeof settings.logo === "string" && settings.logo.trim() !== "") {
      return (
        <div className="shrink-0">
          <img 
            src={settings.logo} 
            alt={name} 
            className={`${sizeClass} w-auto object-contain`} 
          />
        </div>
      );
    }
    return (
      <div className="shrink-0 p-1 rounded bg-foreground/5 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-foreground" />
      </div>
    );
  };

  const renderMobileBrand = () => {
    const parts = name.trim().split(" ");
    return (
      <Link href="/" className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 group overflow-hidden py-0.5">
        {renderLogo("h-6 sm:h-7")}
        {showStoreName && (
          parts.length > 1 ? (
            <div className="flex flex-col items-center justify-center text-center leading-[0.85] space-y-0">
              <span className="text-base sm:text-lg md:text-xl font-price font-bold uppercase tracking-[0.16em] text-foreground">
                {parts[0]}
              </span>
              <span className="text-[11px] sm:text-xs md:text-sm font-price font-bold uppercase tracking-[0.22em] text-foreground/90 -mt-1">
                {parts.slice(1).join(" ")}
              </span>
            </div>
          ) : (
            <span className="text-lg sm:text-xl md:text-2xl font-price font-bold uppercase tracking-[0.15em] text-foreground">
              {name}
            </span>
          )
        )}
      </Link>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] w-full shadow-sm bg-background border-b border-foreground/10 transition-colors duration-500">
        {/* Continuous Marquee Announcement Ticker Bar */}
        {(announcementBar?.enabled ?? true) && announcementBar?.text && (
          <div
            className="w-full h-8 overflow-hidden relative flex items-center border-b border-white/5 whitespace-nowrap"
            style={{ backgroundColor: announcementBg, color: announcementText }}
          >
            <div className="w-max flex items-center gap-12 text-[11px] font-sans tracking-widest uppercase animate-marquee">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0">
                  {announcementBar.badgeText && (
                    <span className="px-2 py-0.5 border border-white/20 shrink-0 text-[9px] font-bold">
                      {announcementBar.badgeText}
                    </span>
                  )}
                  <span className="shrink-0">{announcementBar.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Header */}
        <header className="w-full bg-background text-foreground transition-colors duration-500">
          <div className="max-w-[100rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* MOBILE PHONE HEADER (Always Centered Brand with 2-Line Split Name) */}
            <div className="flex lg:hidden items-center justify-between w-full">
              <button 
                className="hover:opacity-60 transition-opacity text-foreground p-1"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>

              <div className="flex-1 flex items-center justify-center text-center px-2">
                {renderMobileBrand()}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-foreground">


                <ThemeSwitcher />
                <Link href="/search" className="hover:opacity-60 transition-opacity" aria-label="Search">
                  <Search size={18} strokeWidth={1.5} />
                </Link>
                <Link href="/cart" className="relative hover:opacity-60 transition-opacity flex items-center justify-center">
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {mounted && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* DESKTOP HEADER (Respects logoAlignment setting & equal 3-column alignment) */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {logoAlignment === "center" ? (
                <>
                  {/* Center Logo Layout - Left: Desktop Navlinks */}
                  <div className="flex items-center justify-start flex-1 min-w-0 gap-6">
                    {headerLinks.slice(0, 4).map((link: any, i: number) => {
                      const isActive = pathname === link.url || (link.url !== '/' && pathname.startsWith(link.url));
                      return (
                        <Link 
                          key={i} 
                          href={link.url}
                          className={`text-xs lg:text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-foreground font-bold' : 'text-foreground/75 hover:text-foreground'}`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Center Logo Layout - Center: Logo + Store Name */}
                  <div className="flex items-center justify-center text-center shrink-0 px-4">
                    <Link href="/" className="flex items-center justify-center gap-2 sm:gap-3 overflow-hidden">
                      {renderLogo("h-5 sm:h-6")}
                      {showStoreName && (
                        <span className="text-lg sm:text-xl md:text-2xl font-price font-bold uppercase tracking-[0.12em] truncate text-foreground">
                          {name}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Center Logo Layout - Right: Nav & Actions */}
                  <div className="flex items-center justify-end flex-1 min-w-0 gap-3 sm:gap-4 lg:gap-6 text-foreground">
                    {headerLinks.slice(4).map((link: any, i: number) => {
                      const isActive = pathname === link.url || (link.url !== '/' && pathname.startsWith(link.url));
                      return (
                        <Link 
                          key={i} 
                          href={link.url}
                          className={`text-xs lg:text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-foreground font-bold' : 'text-foreground/75 hover:text-foreground'}`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}

                    {/* Language Switcher Tab for Center Logo Layout */}
                    <div className="notranslate flex items-center bg-foreground/5 p-0.5 rounded-lg border border-foreground/10 text-foreground">
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          language === "en" ? "bg-foreground text-background shadow-xs" : "opacity-60 hover:opacity-100"
                        }`}
                        title="English"
                      >
                        ENG
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("ar")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          language === "ar" ? "bg-foreground text-background shadow-xs" : "opacity-60 hover:opacity-100"
                        }`}
                        title="العربية (Arabic)"
                      >
                        عربي
                      </button>
                    </div>

                    {/* Google Translate Instant Translator */}
                    <div className="hidden xl:block">
                      <GoogleTranslate />
                    </div>

                    <ThemeSwitcher />

                    <Link href="/search" className="hover:opacity-60 transition-opacity hidden sm:block" aria-label="Search">
                      <Search size={18} strokeWidth={1.5} />
                    </Link>

                    <Link href="/account" className="hover:opacity-80 transition-opacity flex items-center justify-center" aria-label="Account / Sign In">
                      {session?.user?.image || (session?.user as any)?.avatar ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-foreground/30 shadow-2xs shrink-0 flex items-center justify-center bg-muted/40">
                          <img 
                            src={session?.user?.image || (session?.user as any)?.avatar} 
                            alt={session?.user?.name || "Account"} 
                            decoding="async"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : session?.user?.name ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-foreground text-background font-mono text-[11px] font-bold shrink-0 flex items-center justify-center shadow-2xs">
                          {session.user.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <User size={18} strokeWidth={1.5} />
                      )}
                    </Link>

                    <Link href="/wishlist" className="relative hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center" aria-label="Wishlist">
                      <Heart size={18} strokeWidth={1.5} />
                      {mounted && wishlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link href="/cart" className="relative hover:opacity-60 transition-opacity flex items-center justify-center">
                      <ShoppingBag size={18} strokeWidth={1.5} />
                      {mounted && cartItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Standard Left Logo Layout - Left: Logo + Name */}
                  <div className="flex items-center justify-start flex-1 min-w-0">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                      {renderLogo("h-5 sm:h-6")}
                      {showStoreName && (
                        <span className="text-lg sm:text-xl md:text-2xl font-price font-bold uppercase tracking-[0.1em] truncate text-foreground">
                          {name}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Standard Left Logo Layout - Center: Desktop Navlinks */}
                  <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-4 gap-8">
                    {headerLinks.map((link: any, i: number) => {
                      const isActive = pathname === link.url || (link.url !== '/' && pathname.startsWith(link.url));
                      return (
                        <Link 
                          key={i} 
                          href={link.url}
                          className={`text-xs lg:text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-foreground font-bold' : 'text-foreground/75 hover:text-foreground'}`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Standard Left Logo Layout - Right: Search, Account, Cart, Language & Theme */}
                  <div className="flex items-center justify-end flex-1 min-w-0 gap-3 sm:gap-4 lg:gap-5 text-foreground">
                    <Link href="/search" prefetch={false} className="hover:opacity-60 transition-opacity hidden sm:block" aria-label="Search">
                      <Search size={18} strokeWidth={1.5} />
                    </Link>

                    <Link href="/account" prefetch={false} className="hover:opacity-80 transition-opacity flex items-center justify-center" aria-label="Account / Sign In">
                      {session?.user?.image || (session?.user as any)?.avatar ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-foreground/30 shadow-2xs shrink-0 flex items-center justify-center bg-muted/40">
                          <img 
                            src={session?.user?.image || (session?.user as any)?.avatar} 
                            alt={session?.user?.name || "Account"} 
                            decoding="async"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : session?.user?.name ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-foreground text-background font-mono text-[11px] font-bold shrink-0 flex items-center justify-center shadow-2xs">
                          {session.user.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <User size={18} strokeWidth={1.5} />
                      )}
                    </Link>

                    <Link href="/wishlist" prefetch={false} className="relative hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center" aria-label="Wishlist">
                      <Heart size={18} strokeWidth={1.5} />
                      {mounted && wishlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link href="/cart" prefetch={false} className="relative hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center">
                      <ShoppingBag size={18} strokeWidth={1.5} />
                      {mounted && cartItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>

                    {/* Language Switcher Tab */}
                    <div className="notranslate flex items-center bg-foreground/5 p-0.5 rounded-lg border border-foreground/10 text-foreground">
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          language === "en" ? "bg-foreground text-background shadow-xs" : "opacity-60 hover:opacity-100"
                        }`}
                        title="English"
                      >
                        ENG
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("ar")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          language === "ar" ? "bg-foreground text-background shadow-xs" : "opacity-60 hover:opacity-100"
                        }`}
                        title="العربية (Arabic)"
                      >
                        عربي
                      </button>
                    </div>

                    {/* Google Translate Instant Translator */}
                    <div className="flex items-center">
                      <GoogleTranslate />
                    </div>

                    <ThemeSwitcher />
                  </div>
                </>
              )}
            </div>

          </div>
        </header>
      </div>

      {/* Mobile Drawer Menu */}
      <div 
        className={`fixed inset-0 z-[100] bg-background text-foreground transition-transform duration-500 ease-in-out flex flex-col ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full px-6 py-6 max-w-lg mx-auto w-full">
          {/* Mobile Drawer Header */}
          <div className="flex items-start justify-between border-b border-foreground/15 mb-8 pb-4">
            <div className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 mt-1">
                {renderLogo("h-6 w-auto")}
                {showStoreName && (
                  <span className="text-lg font-serif uppercase tracking-[0.12em] text-foreground">
                    {name}
                  </span>
                )}
              </Link>
              {/* Language Switcher Tab for Mobile Drawer */}
              <div className="notranslate flex items-center bg-foreground/5 p-1 rounded-xl border border-foreground/10 text-foreground w-full self-center mb-2">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    language === "en" ? "bg-foreground text-background shadow-md" : "opacity-60 hover:opacity-100"
                  }`}
                  title="English"
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    language === "ar" ? "bg-foreground text-background shadow-md" : "opacity-60 hover:opacity-100"
                  }`}
                  title="العربية (Arabic)"
                >
                  العربية
                </button>
              </div>
            </div>
            <button 
              className="p-2 -mr-2 text-foreground hover:opacity-70 transition-opacity cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Drawer Nav Links */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
            {(() => {
              const homeLink = headerLinks.find((l: any) => l.label.toLowerCase() === 'home' || l.url === '/');
              const aboutLink = headerLinks.find((l: any) => l.label.toLowerCase() === 'about us');
              const contactLink = headerLinks.find((l: any) => l.label.toLowerCase() === 'contact us');
              
              const otherLinks = headerLinks.filter((l: any) => 
                l !== homeLink && l !== aboutLink && l !== contactLink
              );

              const getIcon = (link: any) => {
                if (link?.icon && link.icon !== 'auto') {
                  switch (link.icon) {
                    case 'home': return <Home size={18} strokeWidth={1.5} />;
                    case 'info': return <Info size={18} strokeWidth={1.5} />;
                    case 'phone': return <Phone size={18} strokeWidth={1.5} />;
                    case 'mail': return <Mail size={18} strokeWidth={1.5} />;
                    case 'shopping-bag': return <ShoppingBag size={18} strokeWidth={1.5} />;
                    case 'shopping-cart': return <ShoppingCart size={18} strokeWidth={1.5} />;
                    case 'user': return <User size={18} strokeWidth={1.5} />;
                    case 'heart': return <Heart size={18} strokeWidth={1.5} />;
                    case 'sparkles': return <Sparkles size={18} strokeWidth={1.5} />;
                    case 'star': return <Star size={18} strokeWidth={1.5} />;
                    case 'tag': return <Tag size={18} strokeWidth={1.5} />;
                    case 'box': return <Box size={18} strokeWidth={1.5} />;
                    case 'chevron-right': return <ChevronRight size={18} strokeWidth={1.5} />;
                    case 'hash': return <Hash size={18} strokeWidth={1.5} />;
                    case 'settings': return <Settings size={18} strokeWidth={1.5} />;
                    case 'message-circle': return <MessageCircle size={18} strokeWidth={1.5} />;
                    case 'map-pin': return <MapPin size={18} strokeWidth={1.5} />;
                    case 'calendar': return <Calendar size={18} strokeWidth={1.5} />;
                    case 'camera': return <Camera size={18} strokeWidth={1.5} />;
                    case 'video': return <Video size={18} strokeWidth={1.5} />;
                    case 'music': return <Music size={18} strokeWidth={1.5} />;
                    case 'book': return <Book size={18} strokeWidth={1.5} />;
                    case 'file-text': return <FileText size={18} strokeWidth={1.5} />;
                    case 'check-circle': return <CheckCircle size={18} strokeWidth={1.5} />;
                    case 'alert-circle': return <AlertCircle size={18} strokeWidth={1.5} />;
                    case 'gift': return <Gift size={18} strokeWidth={1.5} />;
                  }
                }
                const l = (link?.label || '').toLowerCase();
                if (l === 'home') return <Home size={18} strokeWidth={1.5} />;
                if (l === 'about us') return <Info size={18} strokeWidth={1.5} />;
                if (l === 'contact us') return <Phone size={18} strokeWidth={1.5} />;
                if (l.includes('shop') || l.includes('store') || l.includes('product')) return <ShoppingBag size={18} strokeWidth={1.5} />;
                return <ChevronRight size={18} strokeWidth={1.5} />;
              };

              const renderHeaderLink = (link: any, key: string | number) => {
                if (!link) return null;
                const isActive = pathname === link.url || (link.url !== '/' && pathname.startsWith(link.url));
                return (
                  <Link 
                    key={key} 
                    href={link.url}
                    className={`flex items-center gap-4 text-base font-sans uppercase tracking-[0.2em] py-1.5 border-b border-foreground/5 transition-all ${
                      isActive ? 'font-bold text-foreground tracking-[0.25em] pl-2' : 'text-foreground/70 hover:text-foreground hover:pl-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getIcon(link)}
                    {link.label}
                  </Link>
                );
              };

              return (
                <>
                  {renderHeaderLink(homeLink || { label: 'HOME', url: '/' }, 'home')}
                  
                  {/* Search */}
                  <Link 
                    href="/search"
                    className="flex items-center gap-4 text-base font-sans uppercase tracking-[0.2em] py-1.5 border-b border-foreground/5 transition-all text-foreground/70 hover:text-foreground hover:pl-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search size={18} strokeWidth={1.5} />
                    Search
                  </Link>

                  {/* Cart */}
                  <Link 
                    href="/cart"
                    className="flex items-center gap-4 text-base font-sans uppercase tracking-[0.2em] py-1.5 border-b border-foreground/5 transition-all text-foreground/70 hover:text-foreground hover:pl-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <ShoppingBag size={18} strokeWidth={1.5} />
                      {mounted && cartItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                    Cart
                  </Link>

                  {/* Wishlist */}
                  <Link 
                    href="/wishlist"
                    className="flex items-center gap-4 text-base font-sans uppercase tracking-[0.2em] py-1.5 border-b border-foreground/5 transition-all text-foreground/70 hover:text-foreground hover:pl-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <Heart size={18} strokeWidth={1.5} />
                      {mounted && wishlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 text-[9px] font-sans w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    Wishlist
                  </Link>

                  {renderHeaderLink(aboutLink, 'about')}
                  {renderHeaderLink(contactLink, 'contact')}
                  
                  {otherLinks.map((link: any, i: number) => renderHeaderLink(link, `other-${i}`))}
                </>
              );
            })()}
          </nav>

          {/* Mobile Drawer Footer Actions (Account & Logout) */}
          <div className="mt-auto border-t border-foreground/15 pt-6 pb-6 space-y-3">
            {session?.user ? (
              <>
                <div className="flex items-center justify-between p-2.5 bg-foreground/5 rounded-2xl border border-foreground/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-foreground/20 bg-background flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-2xs">
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mono text-sm font-bold text-foreground">
                          {(session.user.name || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">
                        {session.user.name || "Account"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  {session.user.role === "SUPER_ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2 py-1 rounded bg-primary/20 text-primary font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0"
                    >
                      <Shield size={10} /> Admin
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    href="/account" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center justify-center py-3 rounded-xl bg-foreground text-background font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity gap-2"
                  >
                    <User size={15} strokeWidth={2} />
                    Account
                  </Link>

                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut({ callbackUrl: "/" });
                    }}
                    type="button"
                    className="flex items-center justify-center py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all gap-2 cursor-pointer"
                  >
                    <LogOut size={15} strokeWidth={2} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/account/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center justify-center w-full py-4 rounded-xl bg-foreground text-background font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity gap-2"
              >
                <User size={18} strokeWidth={2} />
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Layout Spacer so content renders cleanly below fixed header */}
      <div className={(announcementBar?.enabled ?? true) && announcementBar?.text ? "h-24" : "h-16"} />
    </>
  );
}

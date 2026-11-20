"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Star, 
  Palette, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Settings,
  Store,
  LayoutGrid,
  Layers,
  Tag,
  MessageSquare,
  MonitorPlay,
  FileCode2,
  X,
  Mail,
  Award,
  LogOut,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { useAdminUI } from "./AdminUIProvider";

const navigation = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Product Content", href: "/admin/product-content", icon: MonitorPlay },
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Tags", href: "/admin/tags", icon: Tag },
      { name: "Celebrity Reviews", href: "/admin/celebrity-reviews", icon: Star },
      { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
      { name: "Global FAQs", href: "/admin/faqs", icon: FileText },
      { name: "Certificates & Awards", href: "/admin/certificates", icon: Award },
      { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    ]
  },
  {
    title: "Sales",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    ]
  },
  {
    title: "Customers",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ]
  },
  {
    title: "Storefront (CMS)",
    items: [
      { name: "Live Customization", href: "/admin/customizer", icon: Palette },
      { name: "Navigation Links", href: "/admin/settings?tab=navigation", icon: Globe },
    ]
  },
  {
    title: "Marketing",
    items: [
      { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { name: "SEO Settings", href: "/admin/seo?tab=seo", icon: Globe },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings?tab=general", icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useAdminUI();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const adminName = session?.user?.name || "Super Admin";
  const adminEmail = session?.user?.email || "admin";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "SA";

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/50 sticky top-0 bg-transparent z-10 backdrop-blur-xl">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-black text-xl tracking-tight text-foreground">
          <Store className="text-primary" size={24} />
          SQODEX <span className="text-primary font-bold text-xs">SUPER ADMIN</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="p-4 space-y-8 flex-1 overflow-y-auto">
        {navigation.map((group, i) => (
          <div key={i}>
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-border/60 mt-auto bg-muted/20 space-y-2">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 ring-1 ring-primary/30">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{adminName}</span>
              <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                <ShieldCheck size={10} /> Super Admin
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
            title="View Storefront"
          >
            <ExternalLink size={13} />
            Store
          </Link>
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors border border-red-500/20 cursor-pointer"
            title="Log Out of Admin Panel"
          >
            <LogOut size={13} />
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/50 glass-panel hidden md:flex flex-col h-screen overflow-y-auto print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden print:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="relative w-72 max-w-[calc(100vw-3rem)] h-full bg-card border-r border-border flex flex-col shadow-2xl animate-in slide-in-from-left print:hidden">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

"use client";

import { Menu, Search, Bell, ShoppingBag, Sun, Moon, Languages, LogOut, User, ShieldCheck, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { fetchOrdersAction } from "@/server/actions/orderActions";
import { useAdminUI } from "./AdminUIProvider";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "next-themes";

export default function AdminHeader() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { setMobileMenuOpen } = useAdminUI();
  const { formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isDarkMode = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  const toggleAdminTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setTheme(nextTheme);
  };

  useEffect(() => {
    async function loadNotifications() {
      const res = await fetchOrdersAction();
      if (res.success) {
        const recent = res.data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setRecentOrders(recent);
      }
    }
    loadNotifications();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
    }
    return 'Admin';
  };

  return (
    <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10 print:hidden">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <h1 className="text-lg font-bold text-foreground hidden sm:block">
          {generateTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-64 bg-muted border-transparent rounded-full py-1.5 pl-9 pr-4 text-sm focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
          />
        </div>



        {/* Admin Dark / Light Mode Toggle */}
        <div className="flex items-center" title={isDarkMode ? "Switch Admin Panel to Light Mode" : "Switch Admin Panel to Dark Mode"}>
          <ToggleSwitch checked={isDarkMode} onChange={toggleAdminTheme} variant="theme" />
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {recentOrders.length > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full border border-card" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-border bg-muted/50">
                <h3 className="font-bold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No new notifications
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors flex gap-3">
                      <div className="mt-1 bg-primary/10 text-primary p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                        <ShoppingBag size={14} />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">New Order:</span> {formatPrice(order.totals?.total || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-border bg-muted/30 text-center">
                <a href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
                  View all orders
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-full hover:bg-muted transition-colors border border-border/50"
            title="Super Admin Profile & Logout"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {initials}
            </div>
            <span className="text-xs font-bold text-foreground hidden sm:inline max-w-[100px] truncate">
              {adminName.split(" ")[0]}
            </span>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50 p-2">
              <div className="p-3 border-b border-border/60 mb-1">
                <p className="text-xs font-bold text-foreground truncate">{adminName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{adminEmail}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                  <ShieldCheck size={10} /> Super Admin
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  View Storefront
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}

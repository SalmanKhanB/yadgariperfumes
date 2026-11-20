import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";
import { getUserById } from "@/server/repositories/userRepository";
import { getOrdersByCustomerId } from "@/server/repositories/userRepository";
import Link from "next/link";
import { Package, Heart, MapPin, Settings, ChevronRight, LogOut, ShoppingBag, Clock } from "lucide-react";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import { logoutAction } from "@/server/actions/customerAuthActions";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { formatCurrency } from "@/lib/utils/format";

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login");

  // For env-based admin, skip DB lookup
  const isEnvAdmin = session.user.id === "admin-1";
  let user = null;
  let recentOrders: any[] = [];

  if (!isEnvAdmin) {
    user = await getUserById(session.user.id);
    if (user) {
      const orders = await getOrdersByCustomerId(session.user.id);
      recentOrders = JSON.parse(JSON.stringify(orders.slice(0, 5)));
    }
  }

  const siteSettings = await getSiteSettings();
  const currency = siteSettings?.currency || "USD";

  const displayName = user?.name || session.user.name || "Customer";
  const displayEmail = user?.email || session.user.email || "";

  const accountLinks = [
    { label: "Order History", href: "/account/orders", icon: Package, desc: "Track and view your past orders" },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart, desc: "Products you've saved for later" },
    { label: "Addresses", href: "/account/addresses", icon: MapPin, desc: "Manage your shipping addresses" },
    { label: "Account Settings", href: "/account/settings", icon: Settings, desc: "Update your profile and password" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'My Account' }]} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted/40 shrink-0 flex items-center justify-center shadow-sm">
                {user?.image || user?.avatar || session.user.image ? (
                  <img
                    src={(user?.image || user?.avatar || session.user.image) as string}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black text-foreground font-mono">
                    {(displayName || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground">
                  Hello, {displayName.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">{displayEmail}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group glass-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <link.icon size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-1">{link.label}</h3>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1 shrink-0" />
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-2xl border border-border p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/all"
                className="inline-block mt-4 px-6 py-3 bg-foreground text-background rounded-xl text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const statusColors: Record<string, string> = {
                  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
                  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
                  shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
                  delivered: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                };
                return (
                  <Link
                    key={String(order._id)}
                    href={`/order-confirmation/${order._id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          Order #{String(order._id).slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">{orderDate} · {order.items?.length || 0} item(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-foreground font-price">
                        {formatCurrency(order.totals?.total || 0, currency)}
                      </span>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

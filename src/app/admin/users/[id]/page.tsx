"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  fetchUserDetailAction, 
  toggleUserDisabledAction, 
  updateUserRoleAction, 
  deleteUserAction 
} from "@/server/actions/userActions";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CreditCard,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface IUserDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  avatar?: string;
  role: "SUPER_ADMIN" | "USER";
  isDisabled: boolean;
  disabledReason?: string;
  emailVerified: boolean;
  addresses: any[];
  wishlist: any[];
  createdAt: string;
  updatedAt: string;
  orders: any[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<IUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "wishlist" | "security">("orders");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [disableReasonInput, setDisableReasonInput] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);

  const { formatPrice } = useCurrency();

  const loadUser = async () => {
    setLoading(true);
    const res = await fetchUserDetailAction(userId);
    if (res.success && res.data) {
      setUser(res.data);
      if (res.data.disabledReason) {
        setDisableReasonInput(res.data.disabledReason);
      }
    } else {
      setStatusMessage({ text: res.error || "User not found.", type: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleToggleDisable = async (shouldDisable: boolean) => {
    setActionLoading(true);
    const res = await toggleUserDisabledAction(userId, shouldDisable, disableReasonInput);
    if (res.success) {
      setStatusMessage({ 
        text: shouldDisable ? "Account has been disabled." : "Account has been reactivated.", 
        type: "success" 
      });
      setUser(prev => prev ? { ...prev, isDisabled: shouldDisable, disabledReason: shouldDisable ? disableReasonInput : undefined } : null);
      setShowDisableModal(false);
    } else {
      setStatusMessage({ text: res.error || "Failed to update status.", type: "error" });
    }
    setActionLoading(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRoleChange = async (newRole: any) => {
    setActionLoading(true);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setStatusMessage({ text: `Role updated to ${newRole}.`, type: "success" });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
    } else {
      setStatusMessage({ text: res.error || "Failed to change role.", type: "error" });
    }
    setActionLoading(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}"? This cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    const res = await deleteUserAction(userId);
    if (res.success) {
      router.push("/admin/users");
    } else {
      setStatusMessage({ text: res.error || "Failed to delete user.", type: "error" });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading user details and screen history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto mt-12">
        <AlertCircle size={44} className="mx-auto text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-foreground">User Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-6">The requested user account does not exist or has been removed.</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-bold rounded-xl text-xs"
        >
          <ArrowLeft size={14} /> Back to Users
        </Link>
      </div>
    );
  }

  const totalSpend = (user.orders || []).reduce((acc, o) => acc + (o.totals?.total || 0), 0);
  const completedOrders = (user.orders || []).filter(o => o.status === "delivered").length;
  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft size={16} /> Back to Users List
        </Link>

        <div className="flex items-center gap-2">
          {/* Disable / Enable Button */}
          {user.isDisabled ? (
            <button
              onClick={() => handleToggleDisable(false)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} /> Enable Account
            </button>
          ) : (
            <button
              onClick={() => setShowDisableModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Ban size={14} /> Disable Account
            </button>
          )}

          {/* Delete Account */}
          <button
            onClick={handleDeleteUser}
            disabled={actionLoading || isSuperAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} /> Delete User
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between gap-3 border animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {statusMessage.text}
          </div>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {/* Disabled Account Warning Banner */}
      {user.isDisabled && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-3 text-xs">
          <Ban size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">This User Account is Currently Disabled</h4>
            <p className="mt-0.5 text-muted-foreground">
              The user cannot sign in or place orders. {user.disabledReason && `Reason: "${user.disabledReason}"`}
            </p>
          </div>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="glass-card rounded-3xl border border-border p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div
              className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-black text-xl shrink-0 ${
                isSuperAdmin
                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/40"
                  : "bg-primary/10 text-primary ring-2 ring-primary/20"
              }`}
            >
              {user.image || (user as any).avatar ? (
                <img src={user.image || (user as any).avatar} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-foreground truncate">{user.name}</h2>
                
                {/* Status Badge */}
                {user.isDisabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    <Ban size={10} /> Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={10} /> Active Account
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-primary" /> {user.email}
                  {user.emailVerified ? (
                    <span className="text-emerald-500 font-semibold text-[10px]">(Verified)</span>
                  ) : (
                    <span className="text-amber-500 font-semibold text-[10px]">(Unverified)</span>
                  )}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" /> {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Selector */}
          <div className="flex flex-col gap-1.5 shrink-0 bg-muted/40 p-3.5 rounded-2xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" /> Account Role
            </span>
            <select
              value={user.role}
              disabled={actionLoading}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground outline-none cursor-pointer"
            >
              <option value="USER">Customer (USER)</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-500" /> Lifetime Spend
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{formatPrice(totalSpend)}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Package size={14} className="text-primary" /> Total Orders
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{user.orders?.length || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin size={14} className="text-blue-500" /> Saved Addresses
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{user.addresses?.length || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Heart size={14} className="text-red-500" /> Wishlist Items
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{user.wishlist?.length || 0}</p>
        </div>
      </div>

      {/* Screen History & Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={16} />
            Order Screen History ({user.orders?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "addresses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin size={16} />
            Addresses ({user.addresses?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "wishlist"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart size={16} />
            Wishlist ({user.wishlist?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck size={16} />
            Account Security & Logs
          </button>
        </div>

        {/* Tab 1: Orders Screen History */}
        {activeTab === "orders" && (
          <div className="glass-card rounded-2xl border border-border overflow-hidden">
            {(!user.orders || user.orders.length === 0) ? (
              <div className="p-12 text-center">
                <ShoppingBag size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <h4 className="text-sm font-bold text-foreground">No Orders Placed Yet</h4>
                <p className="text-xs text-muted-foreground mt-1">This user hasn&apos;t placed any orders in the store.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {user.orders.map((order) => {
                      const statusColors: Record<string, string> = {
                        pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                        shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                        delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
                        refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                      };

                      return (
                        <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-foreground">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground text-[11px]">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[order.status] || statusColors.pending}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                                {order.paymentMethod || "COD"}
                              </span>
                              <p className={`text-[10px] ${order.paymentStatus === "paid" ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>
                                {order.paymentStatus || "pending"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {order.itemsCount} item{order.itemsCount === 1 ? "" : "s"}
                          </td>
                          <td className="py-4 px-4 font-bold text-foreground">
                            {formatPrice(order.totals?.total || 0)}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <Link
                              href={`/admin/orders/${order._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                              Manage <ChevronRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!user.addresses || user.addresses.length === 0) ? (
              <div className="glass-card rounded-2xl border border-border p-12 text-center col-span-full">
                <MapPin size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <h4 className="text-sm font-bold text-foreground">No Saved Addresses</h4>
                <p className="text-xs text-muted-foreground mt-1">This user has not saved any shipping addresses in their profile.</p>
              </div>
            ) : (
              user.addresses.map((addr, idx) => (
                <div key={addr._id || idx} className="glass-card rounded-2xl border border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <MapPin size={16} className="text-primary" /> {addr.label || `Address #${idx + 1}`}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        Default Address
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5 font-mono">
                    <p className="text-foreground font-sans font-medium">{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="font-bold uppercase tracking-wider text-[11px] text-foreground">{addr.country}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === "wishlist" && (
          <div>
            {(!user.wishlist || user.wishlist.length === 0) ? (
              <div className="glass-card rounded-2xl border border-border p-12 text-center">
                <Heart size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <h4 className="text-sm font-bold text-foreground">Wishlist is Empty</h4>
                <p className="text-xs text-muted-foreground mt-1">This user has not saved any products to their wishlist.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.wishlist.map((item, idx) => (
                  <div key={item._id || idx} className="glass-card rounded-2xl border border-border overflow-hidden group">
                    <div className="aspect-square bg-muted/30 relative flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <Package size={32} className="text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="font-bold text-xs text-foreground truncate">{item.title}</h4>
                      <p className="font-bold text-primary text-xs">{formatPrice(item.price || 0)}</p>
                      {item.slug && (
                        <Link
                          href={`/products/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors pt-1"
                        >
                          View in Store <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Account Security & Logs */}
        {activeTab === "security" && (
          <div className="glass-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Account Credentials & System Log</h3>
              <p className="text-xs text-muted-foreground">Technical identifiers and security status for this user account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Internal User ID</span>
                <p className="font-mono font-bold text-foreground select-all">{user._id}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Verification</span>
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  {user.emailVerified ? (
                    <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Verified</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1"><XCircle size={14} /> Unverified</span>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Created Timestamp</span>
                <p className="font-mono text-foreground">{user.createdAt ? new Date(user.createdAt).toUTCString() : "N/A"}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Updated</span>
                <p className="font-mono text-foreground">{user.updatedAt ? new Date(user.updatedAt).toUTCString() : "N/A"}</p>
              </div>
            </div>

            {user.isDisabled && user.disabledReason && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Reason for Disabling</span>
                <p className="text-foreground">{user.disabledReason}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disable Account Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <Ban size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground">Disable User Account</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This will immediately prevent <strong>{user.name}</strong> from logging into their account or completing checkouts.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason / Internal Note (Optional)</label>
              <textarea
                value={disableReasonInput}
                onChange={(e) => setDisableReasonInput(e.target.value)}
                placeholder="e.g., Suspicious activity, chargeback dispute, customer requested account closure..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDisableModal(false)}
                type="button"
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleDisable(true)}
                disabled={actionLoading}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors cursor-pointer"
              >
                {actionLoading ? "Disabling..." : "Confirm Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

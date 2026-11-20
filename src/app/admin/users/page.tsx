"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  fetchUsersAction, 
  toggleUserDisabledAction, 
  deleteUserAction, 
  updateUserRoleAction 
} from "@/server/actions/userActions";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown, 
  RefreshCw, 
  MoreVertical,
  Mail,
  Phone,
  Ban,
  Lock,
  ChevronRight
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface IUserRecord {
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
  addressCount: number;
  wishlistCount: number;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<IUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "spend" | "orders" | "name">("newest");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { formatPrice } = useCurrency();

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetchUsersAction();
    if (res.success && res.data) {
      setUsers(res.data);
    } else if (res.error) {
      setStatusMessage({ text: res.error, type: "error" });
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleDisable = async (userId: string, currentDisabled: boolean) => {
    setActionLoadingId(userId);
    const res = await toggleUserDisabledAction(userId, !currentDisabled);
    if (res.success) {
      setStatusMessage({ 
        text: currentDisabled ? "User successfully reactivated." : "User successfully disabled.", 
        type: "success" 
      });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isDisabled: !currentDisabled } : u));
    } else {
      setStatusMessage({ text: res.error || "Failed to update user status.", type: "error" });
    }
    setActionLoadingId(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    setActionLoadingId(userId);
    const res = await deleteUserAction(userId);
    if (res.success) {
      setStatusMessage({ text: "User permanently deleted.", type: "success" });
      setUsers(prev => prev.filter(u => u._id !== userId));
    } else {
      setStatusMessage({ text: res.error || "Failed to delete user.", type: "error" });
    }
    setActionLoadingId(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    setActionLoadingId(userId);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setStatusMessage({ text: `Role updated to ${newRole}.`, type: "success" });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } else {
      setStatusMessage({ text: res.error || "Failed to update role.", type: "error" });
    }
    setActionLoadingId(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter(u => u.role === "USER").length;
    const admins = users.filter(u => u.role === "SUPER_ADMIN").length;
    const disabled = users.filter(u => u.isDisabled).length;
    const totalRevenue = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
    return { total, customers, admins, disabled, totalRevenue };
  }, [users]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = user.name?.toLowerCase().includes(query);
          const matchEmail = user.email?.toLowerCase().includes(query);
          const matchPhone = user.phone?.toLowerCase().includes(query);
          const matchId = user._id.toLowerCase().includes(query);
          if (!matchName && !matchEmail && !matchPhone && !matchId) return false;
        }

        // Role filter
        if (roleFilter !== "ALL") {
          if (roleFilter === "ADMIN_ALL") {
            if (user.role === "USER") return false;
          } else if (user.role !== roleFilter) {
            return false;
          }
        }

        // Status filter
        if (statusFilter === "ACTIVE" && user.isDisabled) return false;
        if (statusFilter === "DISABLED" && !user.isDisabled) return false;
        if (statusFilter === "VERIFIED" && !user.emailVerified) return false;
        if (statusFilter === "UNVERIFIED" && user.emailVerified) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "spend") {
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        }
        if (sortBy === "orders") {
          return (b.orderCount || 0) - (a.orderCount || 0);
        }
        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Super Admin Exclusive
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            User Management & Customers
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control customer accounts, grant administrative access, inspect order histories, and manage access restrictions.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            loadUsers();
          }}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted/60 hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh List
        </button>
      </div>

      {/* Alert / Feedback Notification */}
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
          <button
            onClick={() => setStatusMessage(null)}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Users</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customers</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.customers}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admins / Staff</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.admins}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disabled Accounts</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.disabled}</h3>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-border flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2 text-xs">
            <ShieldCheck size={14} className="text-muted-foreground shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Customers (USER)</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2 text-xs">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled / Blocked</option>
              <option value="VERIFIED">Email Verified</option>
              <option value="UNVERIFIED">Email Unverified</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown size={14} className="text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest Joined</option>
              <option value="oldest">Oldest Joined</option>
              <option value="spend">Highest Spend</option>
              <option value="orders">Most Orders</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      {loading ? (
        <div className="glass-card rounded-2xl border border-border p-16 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium tracking-wide">Loading user database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card rounded-2xl border border-border p-16 text-center">
          <UserX size={44} className="mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground mb-1">No users found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search terms or filter selections to find matching accounts."
              : "No user accounts are registered yet."}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User / Account</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders & Lifetime Spend</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => {
                  const initials = (user.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                  
                  const isSuperAdmin = user.role === "SUPER_ADMIN";
                  const isProcessing = actionLoadingId === user._id;

                  return (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-muted/20 transition-colors ${
                        user.isDisabled ? "bg-red-500/[0.02]" : ""
                      }`}
                    >
                      {/* User Column */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSuperAdmin
                                ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {user.image || (user as any).avatar ? (
                              <img src={user.image || (user as any).avatar} alt={user.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/${user._id}`}
                              className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group truncate"
                            >
                              <span className="truncate">{user.name}</span>
                              <ChevronRight size={13} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </Link>
                            <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                              <span className="truncate">{user.email}</span>
                              {user.emailVerified ? (
                                <span title="Email Verified" className="text-emerald-500">
                                  <CheckCircle2 size={12} />
                                </span>
                              ) : (
                                <span title="Email Not Verified" className="text-amber-500 text-[10px]">
                                  (Unverified)
                                </span>
                              )}
                            </div>
                            {user.phone && (
                              <p className="text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                                <Phone size={10} /> {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-4">
                        <select
                          value={user.role}
                          disabled={isProcessing}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider outline-none border cursor-pointer transition-all ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-black"
                              : "bg-muted/60 text-foreground border-border"
                          }`}
                        >
                          <option value="USER">Customer (USER)</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        {user.isDisabled ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                            <Ban size={11} />
                            Disabled
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Active
                          </div>
                        )}
                        {user.disabledReason && (
                          <p className="text-[10px] text-red-400/80 mt-1 max-w-[150px] truncate" title={user.disabledReason}>
                            Reason: {user.disabledReason}
                          </p>
                        )}
                      </td>

                      {/* Orders & Spend Column */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            {formatPrice(user.totalSpent || 0)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {user.orderCount || 0} order{user.orderCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      </td>

                      {/* Registered Date Column */}
                      <td className="py-4 px-4 text-muted-foreground text-[11px]">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="View Full History & Details"
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Disable / Enable Toggle Button */}
                          <button
                            onClick={() => handleToggleDisable(user._id, user.isDisabled)}
                            disabled={isProcessing}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              user.isDisabled
                                ? "text-emerald-500 hover:bg-emerald-500/10"
                                : "text-amber-500 hover:bg-amber-500/10"
                            }`}
                            title={user.isDisabled ? "Enable User Account" : "Disable User Account"}
                          >
                            {user.isDisabled ? <UserCheck size={15} /> : <Ban size={15} />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            disabled={isProcessing || isSuperAdmin}
                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSuperAdmin ? "Cannot delete Super Admin" : "Delete User"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
            <span>Showing {filteredUsers.length} of {users.length} total users</span>
            <span className="text-[11px]">Click any user to view detailed order screen history, addresses, and wishlist.</span>
          </div>
        </div>
      )}
    </div>
  );
}

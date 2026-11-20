"use client";

import { Clock, ShoppingCart, UserPlus, Package, CheckCircle2, XCircle } from "lucide-react";

export interface Activity {
  id: string;
  type: "order" | "order_paid" | "order_cancelled" | "user" | "product" | "system";
  message: string;
  time: string;
  timestamp: number;
}

interface ActivityLogProps {
  activities?: Activity[];
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function getIcon(type: string) {
  switch (type) {
    case "order":
      return <ShoppingCart size={15} className="text-blue-500" />;
    case "order_paid":
      return <CheckCircle2 size={15} className="text-emerald-500" />;
    case "order_cancelled":
      return <XCircle size={15} className="text-red-500" />;
    case "user":
      return <UserPlus size={15} className="text-violet-500" />;
    case "product":
      return <Package size={15} className="text-amber-500" />;
    default:
      return <Clock size={15} className="text-muted-foreground" />;
  }
}

function getBg(type: string) {
  switch (type) {
    case "order": return "bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/40";
    case "order_paid": return "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/40";
    case "order_cancelled": return "bg-red-50 border-red-100 dark:bg-red-950/40 dark:border-red-900/40";
    case "user": return "bg-violet-50 border-violet-100 dark:bg-violet-950/40 dark:border-violet-900/40";
    case "product": return "bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/40";
    default: return "bg-muted border-border";
  }
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const logs = activities && activities.length > 0 ? activities : [];

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm text-center gap-2">
        <Clock size={28} className="opacity-30" />
        <p className="font-semibold text-foreground">No recent activity yet.</p>
        <p className="text-xs opacity-70">Activity will automatically appear as new orders and customer signups arrive.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-3">
          {/* Icon + connector line */}
          <div className="relative flex flex-col items-center flex-shrink-0">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${getBg(log.type)}`}>
              {getIcon(log.type)}
            </div>
            {index !== logs.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: "16px" }} />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col pt-1 pb-3 min-w-0">
            <p className="text-xs font-bold text-foreground leading-snug">{log.message}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{log.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helper: build live activity feed from raw orders + users ────────────────
export function buildActivityFeed(
  orders: any[],
  users: any[],
  limit = 12
): Activity[] {
  const items: Activity[] = [];

  for (const order of orders) {
    const ts = new Date(order.createdAt).getTime();
    const shortId = String(order._id).slice(-8);
    const name = order.customerName || order.customerEmail || "a customer";

    items.push({
      id: `order-placed-${order._id}`,
      type: "order",
      message: `New order #${shortId} placed by ${name}`,
      time: timeAgo(new Date(order.createdAt)),
      timestamp: ts,
    });

    if (order.paymentStatus === "paid" || order.status === "delivered") {
      items.push({
        id: `order-paid-${order._id}`,
        type: "order_paid",
        message: `Order #${shortId} payment confirmed`,
        time: timeAgo(new Date(order.updatedAt || order.createdAt)),
        timestamp: new Date(order.updatedAt || order.createdAt).getTime(),
      });
    }

    if (order.status === "cancelled") {
      items.push({
        id: `order-cancelled-${order._id}`,
        type: "order_cancelled",
        message: `Order #${shortId} was cancelled`,
        time: timeAgo(new Date(order.updatedAt || order.createdAt)),
        timestamp: new Date(order.updatedAt || order.createdAt).getTime(),
      });
    }
  }

  for (const user of users) {
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    if (!createdAt) continue;
    items.push({
      id: `user-${user._id}`,
      type: "user",
      message: `${user.name || user.email || "New customer"} signed up`,
      time: timeAgo(createdAt),
      timestamp: createdAt.getTime(),
    });
  }

  // Sort newest first and return top items
  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

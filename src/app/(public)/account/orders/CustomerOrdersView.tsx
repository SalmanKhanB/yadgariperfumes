"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, XCircle, RotateCcw, Truck, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { cancelOrderAction, requestReturnAction } from "@/server/actions/orderActions";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function CustomerOrdersView({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "delivered" | "cancelled">("all");
  const { formatPrice } = useCurrency();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setProcessingId(orderId);
    const res = await cancelOrderAction(orderId, "Customer requested cancellation from account portal");
    setProcessingId(null);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === orderId ? { ...o, status: "cancelled" } : o))
      );
    } else {
      alert(res.error || "Failed to cancel order.");
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    const reason = prompt("Please enter the reason for your return request:");
    if (reason === null) return;

    setProcessingId(orderId);
    const res = await requestReturnAction(orderId, reason);
    setProcessingId(null);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === orderId ? { ...o, status: "return_requested" } : o))
      );
      alert("Return request submitted! Our support team will review your request.");
    } else {
      alert(res.error || "Failed to submit return request.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return ["pending", "processing", "shipped"].includes(order.status);
    }
    if (activeTab === "delivered") {
      return order.status === "delivered";
    }
    if (activeTab === "cancelled") {
      return ["cancelled", "refunded", "return_requested"].includes(order.status);
    }
    return true;
  });

  const statusConfig: Record<string, { label: string; badge: string; step: number }> = {
    pending: { label: "Order Received", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", step: 1 },
    processing: { label: "Processing & Packing", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", step: 2 },
    shipped: { label: "On The Way (Shipped)", badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20", step: 3 },
    delivered: { label: "Delivered", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", step: 4 },
    cancelled: { label: "Cancelled", badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20", step: 0 },
    return_requested: { label: "Return Requested", badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20", step: 0 },
    refunded: { label: "Refunded", badge: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20", step: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "all" ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "active" ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          In Progress ({orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length})
        </button>
        <button
          onClick={() => setActiveTab("delivered")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "delivered" ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Delivered ({orders.filter((o) => o.status === "delivered").length})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "cancelled" ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Cancelled & Returned ({orders.filter((o) => ["cancelled", "refunded", "return_requested"].includes(o.status)).length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass-card rounded-3xl border border-border p-12 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm mb-4">No orders match this filter.</p>
          <Link
            href="/all"
            className="inline-block px-6 py-3 bg-foreground text-background rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            const config = statusConfig[order.status] || {
              label: order.status,
              badge: "bg-gray-500/10 text-gray-600 border-gray-500/20",
              step: 1,
            };

            const canCancel = ["pending", "processing"].includes(order.status);
            const canReturn = order.status === "delivered";

            return (
              <div
                key={String(order._id)}
                className="glass-card rounded-3xl border border-border overflow-hidden shadow-sm hover:border-primary/40 transition-all p-6 space-y-6"
              >
                {/* Order Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-foreground">
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Placed on {orderDate} · {order.items?.length || 0} item(s)</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-price font-bold text-xl text-foreground">
                      {formatPrice(order.totals?.total || 0)}
                    </span>
                    <Link
                      href={`/order-confirmation/${order._id}`}
                      className="px-4 py-2 border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                    >
                      Track Order <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Progress Steps Indicator (For Active / Delivered orders) */}
                {config.step > 0 && (
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                      <span className={config.step >= 1 ? "text-primary font-bold" : ""}>1. Received</span>
                      <span className={config.step >= 2 ? "text-primary font-bold" : ""}>2. Packing</span>
                      <span className={config.step >= 3 ? "text-primary font-bold" : ""}>3. Shipped</span>
                      <span className={config.step >= 4 ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}>4. Delivered</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(config.step / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items Thumbnails */}
                <div className="divide-y divide-border/50">
                  {order.items?.map((item: any, idx: number) => {
                    const product = item.productId;
                    const name = product?.name || "Product";
                    const image = product?.images && product.images.length > 0
                      ? (typeof product.images[0] === "string" ? product.images[0] : product.images[0].url)
                      : null;

                    return (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                            {image && (
                              <img 
                                src={image} 
                                alt={name} 
                                decoding="async"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (!target.src.startsWith('data:')) {
                                    target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="#f4f4f5"/></svg>');
                                  }
                                }}
                                className="absolute inset-0 w-full h-full object-cover" 
                              />
                            )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{name}</p>
                            {item.selectedVariant && (
                              <p className="text-[10px] text-muted-foreground uppercase">{item.selectedVariant.name}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-price font-bold text-xs shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons (Cancel / Return) */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Payment Method: <strong className="text-foreground uppercase">{order.paymentMethod || "COD"}</strong>
                  </span>

                  <div className="flex items-center gap-3">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(String(order._id))}
                        disabled={processingId === String(order._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {processingId === String(order._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle size={14} />}
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={() => handleRequestReturn(String(order._id))}
                        disabled={processingId === String(order._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {processingId === String(order._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw size={14} />}
                        Request Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

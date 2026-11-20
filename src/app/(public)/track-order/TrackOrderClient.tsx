"use client";

import { useState } from "react";
import { trackGuestOrderAction } from "@/server/actions/orderTrackingActions";
import { Search, Loader2, Package, Truck, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function TrackOrderClient() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  async function handleSearch(formData: FormData) {
    setLoading(true);
    setError(null);
    setOrder(null);
    
    try {
      const res = await trackGuestOrderAction(formData);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.error || "Failed to find order.");
      }
    } catch {
      setError("Unable to look up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    const formatPrice = (amount: number) => formatCurrency(Number(amount) || 0, order.currency || currency || "AED");
    const customerName = order.customerName ||
      [order.customerDetails?.firstName, order.customerDetails?.lastName].filter(Boolean).join(" ");
    const shipping = order.shippingAddress || order.shippingDetails || {};
    const totals = order.totals || {};
    const statusSteps = ["pending", "processing", "shipped", "delivered"];
    let currentStepIndex = statusSteps.indexOf(order.status);
    if (currentStepIndex === -1) currentStepIndex = 0;
    if (order.status === "cancelled") currentStepIndex = -1;

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={() => setOrder(null)}
          className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Track Another Order
        </button>

        <div className="glass-card rounded-3xl p-8 border border-border shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Order Confirmed</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Order #{String(order._id).slice(-6).toUpperCase()}</h2>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">Order Date</p>
              <p className="text-lg font-medium">{orderDate}</p>
            </div>
          </div>

          {order.status !== "cancelled" ? (
            <div className="relative mb-16 px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full z-0" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-1000" 
                style={{ width: `${(currentStepIndex / 3) * 100}%` }}
              />
              
              <div className="relative z-10 flex justify-between">
                {[
                  { key: "pending", label: "Order Placed", icon: Package },
                  { key: "processing", label: "Processing", icon: Loader2 },
                  { key: "shipped", label: "Shipped", icon: Truck },
                  { key: "delivered", label: "Delivered", icon: CheckCircle }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIndex >= idx;
                  const isActive = currentStepIndex === idx;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background transition-colors duration-500 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Icon size={20} className={isActive && step.key === "processing" ? "animate-spin" : ""} />
                      </div>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 flex items-center gap-4 mb-12">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-bold uppercase tracking-widest mb-1">Order Cancelled</h3>
                <p className="text-sm">This order has been cancelled and will not be fulfilled.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Items Ordered</h3>
              <div className="space-y-6">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-24 rounded-xl bg-muted/30 relative overflow-hidden shrink-0 border border-border">
                      {item.productId?.images?.[0] ? (
                        <Image
                          src={typeof item.productId.images[0] === 'string' ? item.productId.images[0] : item.productId.images[0].url}
                          alt={item.productId.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm line-clamp-2 mb-1">{item.productId?.name || "Unknown Product"}</h4>
                      {(item.selectedVariant?.name || item.variantName) && (
                        <p className="text-xs text-muted-foreground mb-2">Variant: {item.selectedVariant?.name || item.variantName}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-sm text-muted-foreground font-medium">Qty: {item.quantity}</span>
                        <span className="font-price font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Order Summary</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(totals.shippingFee ?? totals.shipping ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 mt-12">Shipping To</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">{customerName || "Customer"}</p>
                <p>{(shipping.line1 || shipping.addressLine1)}</p>
                {(shipping.line2 || shipping.addressLine2) && <p>{(shipping.line2 || shipping.addressLine2)}</p>}
                <p>{shipping.city}, {shipping.state} {shipping.postalCode}</p>
                <p>{shipping.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card max-w-md mx-auto p-8 rounded-3xl border border-border shadow-2xl">
      <form action={handleSearch} className="space-y-6">
        
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Order ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input
              type="text"
              name="orderId"
              required
              placeholder="e.g. 66a2ab1c..."
              className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            placeholder="Used during checkout"
            className="w-full px-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 mt-2 font-bold text-background bg-foreground rounded-xl overflow-hidden transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="relative z-10 uppercase tracking-widest text-sm">Find Order</span>
          )}
        </button>

      </form>
    </div>
  );
}

import { auth } from "@/server/auth/config";
import { getOrderById } from "@/server/repositories/orderRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { formatCurrency } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Clock, Calendar, MapPin, ArrowRight } from "lucide-react";
import connectToDatabase from "@/server/db/mongoose";
import PendingCheckout from "@/server/db/models/PendingCheckout";
import ClearPurchasedItems from "./ClearPurchasedItems";
import ConfirmationRefresh from "./ConfirmationRefresh";
import MetaPurchaseTracker from "@/components/analytics/MetaPurchaseTracker";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  if (!/^[a-f0-9]{24}$/i.test(resolvedParams.id)) notFound();

  const [order, settingsRaw] = await Promise.all([
    getOrderById(resolvedParams.id),
    getSiteSettings()
  ]);
  const settings = settingsRaw ? JSON.parse(JSON.stringify(settingsRaw)) : {};
  const storeCurrency = order?.currency || settings.currency || "USD";

  if (!order) {
    await connectToDatabase();
    const pendingCheckout = await PendingCheckout.exists({ _id: resolvedParams.id });
    if (!pendingCheckout) notFound();

    return (
      <div className="min-h-screen bg-background px-6 py-32 flex flex-col items-center justify-center text-center">
        <Clock className="mb-5 text-muted-foreground" size={40} aria-hidden="true" />
        <h1 className="text-3xl font-black tracking-tight">Checking your payment</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          We’re waiting for payment confirmation. Your order details will appear here once it’s confirmed.
          If this takes more than a few minutes, contact us before trying to pay again.
        </p>
        <ConfirmationRefresh />
        <Link href="/contact" className="mt-4 underline underline-offset-4">Contact support</Link>
      </div>
    );
  }

  const session = await auth();
  const canViewAddress = Boolean(session?.user?.id && session.user.id === String(order.customerId));
  const items = order.items || [];
  const paymentLabel = order.paymentStatus === "paid"
    ? "Payment received"
    : order.paymentStatus === "refunded"
      ? "Payment refunded"
      : order.paymentStatus === "failed"
        ? "Payment failed"
        : order.paymentMethod === "cod"
          ? "Pay on delivery"
          : order.paymentStatus === "awaiting_verification"
            ? "Payment awaiting verification"
            : "Payment pending";
  const statusLabels = {
    pending: "Order Received",
    processing: "Preparing for shipment",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
    return_requested: "Return Requested",
  };

  const currentStatus = order.status || "pending";
  const statusLabel = statusLabels[currentStatus as keyof typeof statusLabels] || currentStatus;

  // Helper to format date
  const formatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 relative flex flex-col items-center">
      {order.paymentMethod === "stripe" && order.paymentStatus === "paid" && (
        <ClearPurchasedItems
          orderId={order._id.toString()}
          items={items.map((item: any) => ({
            productId: String(item.productId?._id || item.productId || ""),
            variantName: item.selectedVariant?.name,
            quantity: item.quantity,
          }))}
        />
      )}

      {/* Meta Pixel Purchase Conversion Tracking */}
      <MetaPurchaseTracker
        orderId={order._id.toString()}
        total={order.totals?.total || 0}
        currency={storeCurrency}
        numItems={items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0)}
        contentIds={items.map((i: any) => String(i.productId?._id || i.productId || ""))}
        contents={items.map((i: any) => ({
          id: String(i.productId?._id || i.productId || ""),
          quantity: i.quantity || 1,
          item_price: Number(i.price || 0),
        }))}
      />

      <div className="relative z-10 max-w-5xl w-full px-6 flex flex-col items-center">
        
        {/* Success Header */}
        <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={30} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-5xl font-mono tracking-tight mb-4 text-foreground text-center">Thank you for your order</h1>
        <p className="text-sm text-muted-foreground mx-auto mb-10 text-center max-w-lg">
          Your order has been received. {paymentLabel}.
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
          
          {/* Order Summary & Items (Left Column) */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-background p-6 sm:p-8 border border-border space-y-6">
              <h2 className="text-base font-mono uppercase tracking-wider text-foreground border-b border-border pb-4">Order Items</h2>
              
              <div className="divide-y divide-border">
                {items.map((item: any, idx: number) => {
                  const product = item.productId;
                  const name = product?.name || "Product";
                  const price = item.price || 0;
                  const quantity = item.quantity || 1;
                  // Handle images being objects or strings
                  const image = product?.images && product.images.length > 0 
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                    : null;

                  return (
                    <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                      <div className="w-20 h-20 bg-muted rounded-none overflow-hidden relative shrink-0">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={image} 
                            alt={name} 
                            decoding="async"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase font-bold">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate uppercase text-sm tracking-tight">{name}</p>
                        {item.selectedVariant && (
                          <p className="text-xs uppercase font-bold tracking-wider text-accent mt-0.5">
                            {item.selectedVariant.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Quantity: {quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-price font-bold text-foreground text-sm">{formatCurrency(price * quantity, storeCurrency)}</p>
                        <p className="font-price text-xs text-muted-foreground mt-0.5">{formatCurrency(price, storeCurrency)} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing Breakdown */}
            <div className="bg-background p-6 sm:p-8 border border-border space-y-4">
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatCurrency(order.totals?.subtotal || 0, storeCurrency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">{!order.totals?.shippingFee ? "Free" : formatCurrency(order.totals.shippingFee, storeCurrency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground pb-4 border-b border-border">
                <span>Tax</span>
                <span className="text-foreground">{formatCurrency(order.totals?.tax || 0, storeCurrency)}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-black uppercase tracking-wider text-sm">{order.paymentStatus === "paid" ? "Total Paid" : "Order Total"}</span>
                <span className="text-3xl font-black text-foreground">{formatCurrency(order.totals?.total || 0, storeCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Tracking & Info (Right Column) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Status Card */}
            <div className="bg-background p-6 border border-border space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Package size={22} />
                <h3 className="font-bold uppercase tracking-wider text-xs">Status</h3>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Order ID</p>
                <p className="font-mono text-xs text-foreground mt-1 select-all break-all">{order._id.toString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Order Status</p>
                <p className="font-bold text-foreground mt-1 capitalize text-sm">{statusLabel}</p>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-background p-6 border border-border space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <MapPin size={22} />
                <h3 className="font-bold uppercase tracking-wider text-xs">Delivery Details</h3>
              </div>
              {canViewAddress && order.shippingAddress?.line1 ? (
                <div className="text-sm font-medium text-muted-foreground space-y-1">
                  <p className="text-foreground">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="uppercase text-xs tracking-wider font-bold mt-2 text-foreground">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <Link href="/track-order" className="text-sm font-medium underline underline-offset-4">Track your delivery</Link>
              )}
            </div>

            {/* Date Card */}
            <div className="bg-background p-6 border border-border space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Calendar size={22} />
                <h3 className="font-bold uppercase tracking-wider text-xs">Placed On</h3>
              </div>
              <p className="text-sm font-medium text-foreground">{formatDate(order.createdAt)}</p>
            </div>

          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-12">
          <Link 
            href="/contact" 
            className="flex-1 inline-flex items-center justify-center px-8 py-4 font-bold text-foreground bg-background border border-border rounded-none hover:bg-muted transition-colors uppercase tracking-widest text-xs"
          >
            Need Help?
          </Link>
          <Link 
            href="/" 
            className="flex-1 group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-background bg-foreground rounded-none overflow-hidden transition-all hover:scale-[1.02]"
          >
            <span className="relative z-10 uppercase tracking-widest text-xs">Continue shopping</span>
            <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 h-full w-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

      </div>
    </div>
  );
}

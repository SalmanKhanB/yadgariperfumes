"use client";

import { useEffect, useState, use, useRef } from "react";
import { 
  fetchOrderByIdAction, 
  updateOrderStatusAction, 
  updatePaymentStatusAction 
} from "@/server/actions/orderActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { IOrder } from "@/server/db/models/Order";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  Package, 
  Truck, 
  Ban, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ChevronDown, 
  Download, 
  Copy, 
  Check, 
  Store,
  QrCode,
  Tag,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type PrintMode = "invoice" | "warehouse" | "shipping-label";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
  const [activePrintMode, setActivePrintMode] = useState<PrintMode>("invoice");

  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orderRes, settingsRes] = await Promise.all([
        fetchOrderByIdAction(orderId),
        fetchSiteSettingsAction(false),
      ]);

      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      setLoading(false);
    }
    load();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success && res.data) {
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
    } else {
      alert("Failed to update order status: " + res.error);
    }
    setUpdating(false);
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    setUpdating(true);
    const res = await updatePaymentStatusAction(orderId, newPaymentStatus);
    if (res.success && res.data) {
      setOrder((prev: any) => ({ ...prev, paymentStatus: newPaymentStatus }));
    } else {
      alert("Failed to update payment status: " + res.error);
    }
    setUpdating(false);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrint = (mode: PrintMode) => {
    setActivePrintMode(mode);
    setPrintDropdownOpen(false);
    // Give state a tick to update DOM before window.print()
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <AlertCircle size={44} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-muted-foreground">The order #{orderId} could not be located in the database.</p>
        <Link href="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-xs font-bold">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  const storeName = settings?.name || "SQODEX STORE";
  const storeEmail = settings?.contact?.email || settings?.email || "support@sqodex.com";
  const storePhone = settings?.contact?.phone || "";
  const storeAddress = settings?.physicalAddress || "100 Innovation Blvd, Silicon Valley, CA";
  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "N/A";

  const orderNum = order._id ? String(order._id).slice(-8).toUpperCase() : "00000000";

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SCREEN VIEW (Hidden when printing via @media print) */}
      {/* ========================================================================= */}
      <div className="print:hidden p-4 sm:p-8 max-w-6xl mx-auto space-y-8 pb-24">
        
        {/* Top Breadcrumb & Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div>
            <Link 
              href="/admin/orders" 
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to All Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground font-mono">
                Order #{orderNum}
              </h1>
              <button
                onClick={copyOrderId}
                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs transition-colors"
                title="Copy Full ID"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <Clock size={13} /> Placed on {formattedDate}
            </p>
          </div>

          {/* Action Buttons: Status updates & Print Options */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* PRINT BUTTON WITH DROPDOWN OPTIONS */}
            <div className="relative">
              <button
                onClick={() => setPrintDropdownOpen(!printDropdownOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 shadow-md transition-all cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Options</span>
                <ChevronDown size={14} className={`transition-transform ${printDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {printDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Print Format
                  </div>
                  
                  <div className="space-y-1 mt-1">
                    <button
                      onClick={() => triggerPrint("invoice")}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">Customer Invoice</p>
                        <p className="text-[10px] text-muted-foreground">Formatted tax invoice with pricing & billing</p>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerPrint("warehouse")}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">Warehouse Packing Slip</p>
                        <p className="text-[10px] text-muted-foreground">Fulfillment pick list with checklists & SKUs</p>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerPrint("shipping-label")}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">Shipping Delivery Label</p>
                        <p className="text-[10px] text-muted-foreground">Compact package label format (A6 / Thermal)</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Cancel button */}
            {order.status !== "cancelled" && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    handleStatusChange("cancelled");
                    handlePaymentStatusChange("cancelled");
                  }
                }}
                disabled={updating}
                className="px-3.5 py-2.5 bg-rose-600/10 text-rose-600 border border-rose-600/30 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Ban size={14} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Status & Financial Control Strip */}
        <div className="glass-panel p-5 rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Order Status</span>
            <select 
              value={order.status || "pending"}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full bg-background border border-border px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-foreground outline-none cursor-pointer hover:border-foreground transition-all"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Payment Status</span>
            <select 
              value={order.paymentStatus || "pending"}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              disabled={updating}
              className="w-full bg-background border border-border px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-foreground outline-none cursor-pointer hover:border-foreground transition-all"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="awaiting_verification">Awaiting Verification</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Payment Method</span>
            <div className="p-2 bg-background border border-border rounded-xl font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-primary" /> {order.paymentMethod || "COD"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Total Amount</span>
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl font-bold text-xs text-primary flex items-center justify-between">
              <span>{formatPrice(order.totals?.total || 0)}</span>
              <span className="text-[10px] font-normal text-muted-foreground">{order.items?.length || 0} item(s)</span>
            </div>
          </div>
        </div>

        {/* Customer, Shipping, and Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Card */}
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h2 className="text-xs font-mono uppercase font-bold tracking-widest border-b border-border pb-3 text-foreground flex items-center gap-2">
              <Mail size={15} className="text-primary" /> Customer Info
            </h2>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-bold text-sm text-foreground">{order.customerName || "Guest Customer"}</p>
                <p className="text-muted-foreground mt-0.5">{order.customerEmail || "No email"}</p>
                <p className="text-muted-foreground">{order.customerPhone || "No phone provided"}</p>
              </div>
              {order.customerId && (
                <div className="pt-2">
                  <Link
                    href={`/admin/users/${order.customerId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    View User History Profile →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Card */}
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h2 className="text-xs font-mono uppercase font-bold tracking-widest border-b border-border pb-3 text-foreground flex items-center gap-2">
              <MapPin size={15} className="text-primary" /> Delivery Address
            </h2>
            <div className="text-xs space-y-1">
              {order.shippingAddress ? (
                <div className="text-foreground leading-relaxed font-sans">
                  <p className="font-bold">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p className="text-muted-foreground">{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="font-bold uppercase tracking-wider mt-1 text-primary">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No shipping address recorded.</p>
              )}
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h2 className="text-xs font-mono uppercase font-bold tracking-widest border-b border-border pb-3 text-foreground flex items-center gap-2">
              <DollarSign size={15} className="text-primary" /> Order Financials
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">{formatPrice(order.totals?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-bold text-foreground">{formatPrice(order.totals?.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="font-bold text-foreground">{formatPrice(order.totals?.tax || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-border pt-3 text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">{formatPrice(order.totals?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase font-bold tracking-widest text-foreground flex items-center gap-2">
              <Package size={16} className="text-primary" /> Line Items ({order.items?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-6">Product Details</th>
                  <th className="py-3 px-4">SKU / Variant</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-6 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(order.items || []).map((item: any, idx: number) => {
                  const prod = item.productId || {};
                  const title = prod.title || prod.name || `Item #${idx + 1}`;
                  return (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {prod.images?.[0] ? (
                            <img src={prod.images[0]} alt={title} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <Package size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{title}</p>
                            {prod.slug && (
                              <Link href={`/products/${prod.slug}`} target="_blank" className="text-[10px] text-primary hover:underline">
                                View product →
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground font-mono">
                        {item.selectedVariant?.name || item.selectedVariant?.sku || "Standard"}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold">
                        {formatPrice(item.price || 0)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        × {item.quantity || 1}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-foreground">
                        {formatPrice((item.quantity || 1) * (item.price || 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. PRINTABLE DOCUMENT TEMPLATES (Active ONLY during window.print()) */}
      {/* ========================================================================= */}
      <div id="print-area" className="hidden print:block font-sans text-black bg-white w-full max-w-full print:p-0 text-xs leading-normal">
        
        {/* TEMPLATE A: CUSTOMER TAX INVOICE */}
        {activePrintMode === "invoice" && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase text-black">{storeName}</h1>
                <p className="text-xs text-neutral-600 mt-1">{storeAddress}</p>
                <p className="text-xs text-neutral-600">{storeEmail} {storePhone ? `· ${storePhone}` : ""}</p>
              </div>

              <div className="text-right">
                <div className="inline-block border-2 border-black px-4 py-1.5 font-mono font-black text-xl uppercase mb-2">
                  TAX INVOICE
                </div>
                <p className="font-mono text-xs font-bold">INVOICE #: INV-{orderNum}</p>
                <p className="font-mono text-xs text-neutral-600">DATE: {formattedDate}</p>
                <p className="font-mono text-xs text-neutral-600">PAYMENT: {(order.paymentMethod || "COD").toUpperCase()}</p>
              </div>
            </div>

            {/* Billing & Shipping Section */}
            <div className="grid grid-cols-2 gap-8 py-2 border-b border-neutral-300 pb-4">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 mb-1">BILLED / SOLD TO:</h3>
                <p className="font-bold text-sm text-black">{order.customerName || "Customer"}</p>
                <p className="text-neutral-700">{order.customerEmail}</p>
                <p className="text-neutral-700">{order.customerPhone}</p>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 mb-1">SHIPPING DESTINATION:</h3>
                {order.shippingAddress ? (
                  <div className="text-neutral-800">
                    <p className="font-bold">{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p className="font-bold uppercase">{order.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="italic text-neutral-500">Standard Delivery</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-2">Item Description</th>
                    <th className="py-2.5 px-2">Variant / SKU</th>
                    <th className="py-2.5 px-2 text-right">Price</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {(order.items || []).map((item: any, idx: number) => {
                    const prod = item.productId || {};
                    const title = prod.title || prod.name || `Product Item`;
                    return (
                      <tr key={idx}>
                        <td className="py-2.5 px-2 font-medium text-black">
                          {title}
                        </td>
                        <td className="py-2.5 px-2 text-neutral-600 font-mono">
                          {item.selectedVariant?.name || item.selectedVariant?.sku || "Standard"}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          ${(item.price || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold">
                          {item.quantity || 1}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-black">
                          ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals & Stamp */}
            <div className="flex justify-between items-start pt-4 border-t-2 border-black">
              {/* Payment Stamp Indicator */}
              <div className="border border-neutral-400 p-3 rounded-lg max-w-xs">
                <p className="font-bold text-[10px] uppercase text-neutral-500">PAYMENT STATUS</p>
                <p className="font-black text-sm uppercase tracking-wider mt-0.5">
                  {order.paymentStatus === "paid" ? "✓ FULLY PAID" : `STATUS: ${(order.paymentStatus || "PENDING").toUpperCase()}`}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Method: {(order.paymentMethod || "COD").toUpperCase()}
                </p>
              </div>

              {/* Totals Calculation */}
              <div className="w-64 space-y-1.5 text-right font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>SUBTOTAL:</span>
                  <span>${(order.totals?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>SHIPPING:</span>
                  <span>${(order.totals?.shippingFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>TAX:</span>
                  <span>${(order.totals?.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 text-black">
                  <span>TOTAL DUE:</span>
                  <span>${(order.totals?.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-8 border-t border-neutral-300 text-center text-[10px] text-neutral-500 space-y-1">
              <p className="font-bold uppercase tracking-wider text-black">Thank you for your purchase!</p>
              <p>For inquiries, exchanges or returns, please reach out to {storeEmail}</p>
            </div>
          </div>
        )}

        {/* TEMPLATE B: WAREHOUSE PACKING SLIP / PICK LIST */}
        {activePrintMode === "warehouse" && (
          <div className="space-y-6">
            {/* Warehouse Slip Header */}
            <div className="flex justify-between items-start border-b-4 border-black pb-4">
              <div>
                <span className="bg-black text-white font-mono font-black text-xs px-2.5 py-1 uppercase tracking-widest">
                  WAREHOUSE PICK LIST
                </span>
                <h1 className="text-2xl font-black uppercase mt-2">{storeName} - FULFILLMENT</h1>
                <p className="font-mono text-xs font-bold mt-1">ORDER REF: #{orderNum}</p>
              </div>

              <div className="text-right font-mono text-xs">
                <p className="font-bold">DATE: {formattedDate}</p>
                <p className="text-neutral-600">STATUS: {(order.status || "PENDING").toUpperCase()}</p>
                <p className="text-neutral-600">METHOD: {(order.deliveryOption?.name || "Standard Shipping").toUpperCase()}</p>
              </div>
            </div>

            {/* Warehouse Destination Details */}
            <div className="border-2 border-black p-4 grid grid-cols-2 gap-6 bg-neutral-50">
              <div>
                <p className="font-mono text-[10px] font-black uppercase text-neutral-500">PACK & SHIP TO:</p>
                <p className="font-bold text-sm text-black mt-1">{order.customerName || "Customer"}</p>
                {order.shippingAddress ? (
                  <div className="text-xs text-neutral-800 mt-1 font-mono">
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p className="font-bold uppercase">{order.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-xs italic text-neutral-500">No physical shipping address provided.</p>
                )}
              </div>

              <div className="border-l-2 border-black pl-4 space-y-1">
                <p className="font-mono text-[10px] font-black uppercase text-neutral-500">CUSTOMER CONTACT & INSTRUCTIONS:</p>
                <p className="text-xs"><strong>Email:</strong> {order.customerEmail || "N/A"}</p>
                <p className="text-xs"><strong>Phone:</strong> {order.customerPhone || "N/A"}</p>
                <p className="text-xs"><strong>Payment:</strong> {(order.paymentMethod || "COD").toUpperCase()} ({order.paymentStatus || "pending"})</p>
              </div>
            </div>

            {/* Picking Checklist Table */}
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-[11px] font-black uppercase tracking-wider bg-neutral-200">
                    <th className="py-2.5 px-3 w-12 text-center">CHECK</th>
                    <th className="py-2.5 px-3">PRODUCT / ITEM NAME</th>
                    <th className="py-2.5 px-3">VARIANT / SKU</th>
                    <th className="py-2.5 px-3 text-center w-24">QTY TO PICK</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-neutral-300 font-mono">
                  {(order.items || []).map((item: any, idx: number) => {
                    const prod = item.productId || {};
                    const title = prod.title || prod.name || `Item SKU`;
                    return (
                      <tr key={idx} className="py-3">
                        <td className="py-3 px-3 text-center">
                          <div className="w-5 h-5 border-2 border-black mx-auto inline-block rounded-xs" />
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-sm">
                          {title}
                        </td>
                        <td className="py-3 px-3 text-xs text-neutral-700">
                          {item.selectedVariant?.name || item.selectedVariant?.sku || "DEFAULT"}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-base text-black bg-neutral-100">
                          {item.quantity || 1}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warehouse Sign-off Strip */}
            <div className="border-t-2 border-black pt-6 grid grid-cols-3 gap-6 font-mono text-[10px]">
              <div className="border-b border-black pb-6">
                <span className="text-neutral-500 font-bold uppercase">PICKED BY:</span>
              </div>
              <div className="border-b border-black pb-6">
                <span className="text-neutral-500 font-bold uppercase">CHECKED & PACKED BY:</span>
              </div>
              <div className="border-b border-black pb-6">
                <span className="text-neutral-500 font-bold uppercase">DISPATCH DATE:</span>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATE C: SHIPPING DELIVERY LABEL (A6/Thermal Format) */}
        {activePrintMode === "shipping-label" && (
          <div className="max-w-[450px] mx-auto border-4 border-black p-6 space-y-4 font-mono">
            {/* Label Header */}
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <div>
                <p className="font-black text-lg uppercase">{storeName}</p>
                <p className="text-[10px] text-neutral-600">{storeAddress}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">STANDARD</p>
                <p className="text-[10px]">PRIORITY</p>
              </div>
            </div>

            {/* Deliver To Box */}
            <div className="border-2 border-black p-4 bg-neutral-50 space-y-1 font-sans">
              <p className="font-mono text-[9px] font-black uppercase text-neutral-500">DELIVER TO:</p>
              <h2 className="text-xl font-black text-black">{order.customerName || "Customer"}</h2>
              {order.shippingAddress ? (
                <div className="text-sm font-semibold leading-snug">
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="font-black uppercase text-base mt-1">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-xs italic">No address</p>
              )}
              {order.customerPhone && (
                <p className="font-mono text-xs font-bold pt-2">TEL: {order.customerPhone}</p>
              )}
            </div>

            {/* Package Details & Barcode */}
            <div className="flex justify-between items-center border-t-2 border-black pt-3 text-xs">
              <div>
                <p className="font-black">ORDER: #{orderNum}</p>
                <p className="text-[10px] text-neutral-600">ITEMS: {order.items?.length || 0}</p>
              </div>
              {order.paymentMethod === "cod" && (
                <div className="border-2 border-black px-3 py-1 font-black text-center text-sm bg-black text-white">
                  COD: ${(order.totals?.total || 0).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

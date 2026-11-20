"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  Landmark, 
  AlertTriangle, 
  ChevronDown, 
  ShoppingBag, 
  ShieldCheck,
  User,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTheme } from "next-themes";
import { trackMetaInitiateCheckout, trackMetaAddPaymentInfo, setMetaUserData } from "@/lib/analytics/metaPixel";

const getStripeAppearance = (isDark: boolean) => ({
  theme: (isDark ? "night" : "flat") as "night" | "flat",
  variables: {
    colorPrimary: "#A98F5C",
    colorBackground: isDark ? "#1c1a17" : "#F4F1EA",
    colorText: isDark ? "#F4F1EA" : "#141210",
    colorTextPlaceholder: isDark ? "rgba(244, 241, 234, 0.45)" : "rgba(20, 18, 16, 0.45)",
    colorDanger: "#e11d48",
    fontFamily: '"Courier New", Courier, monospace, system-ui, -apple-system, sans-serif',
    borderRadius: "12px",
    spacingUnit: "5px",
  },
  rules: {
    ".Input": {
      backgroundColor: isDark ? "#24211c" : "#FFFFFF",
      border: isDark ? "1px solid rgba(244, 241, 234, 0.2)" : "1px solid #B8B3AA",
      boxShadow: isDark ? "none" : "0 1px 2px rgba(0, 0, 0, 0.04)",
      color: isDark ? "#F4F1EA" : "#141210",
      padding: "14px 16px",
      fontSize: "14px",
    },
    ".Input:focus": {
      borderColor: "#A98F5C",
      boxShadow: "0 0 0 1.5px #A98F5C",
      backgroundColor: isDark ? "#24211c" : "#FFFFFF",
    },
    ".Label": {
      color: isDark ? "#a39b8b" : "#7A6A57",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      fontWeight: "700",
      marginBottom: "8px",
    },
    ".Tab": {
      backgroundColor: isDark ? "#24211c" : "#EAE6DD",
      border: isDark ? "1px solid rgba(244, 241, 234, 0.16)" : "1px solid #B8B3AA",
      color: isDark ? "#F4F1EA" : "#141210",
      borderRadius: "12px",
      padding: "12px 16px",
    },
    ".Tab--selected": {
      borderColor: "#A98F5C",
      backgroundColor: isDark ? "rgba(169, 143, 92, 0.2)" : "rgba(169, 143, 92, 0.18)",
      color: isDark ? "#A98F5C" : "#141210",
      boxShadow: "0 0 0 1px #A98F5C",
    },
    ".Tab:hover": {
      borderColor: "#A98F5C",
      color: isDark ? "#ffffff" : "#141210",
    },
    ".Error": {
      color: "#e11d48",
      fontSize: "12px",
      marginTop: "6px",
    },
  },
});

export default function CheckoutPage() {
  const { cart, clearCart, removeSelectedFromCart } = useAppStore();
  const { formatPrice, currency } = useCurrency();
  const router = useRouter();
  const completedOrderId = useRef<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const stripeAppearance = useMemo(() => getStripeAppearance(isDark), [isDark]);

  // Selected items to checkout (if none explicitly selected, checkout all items)
  const activeItems = useMemo(() => {
    if (!cart || cart.length === 0) return [];
    const selected = cart.filter((i) => i.selected !== false);
    return selected.length > 0 ? selected : cart;
  }, [cart]);

  const hasTrackedInitiateRef = useRef(false);

  const [stripeTotal, setStripeTotal] = useState(0);
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  // Store Dynamic Config (Payment Gateways + Shipping Methods)
  const [paymentConfig, setPaymentConfig] = useState<{
    stripeEnabled: boolean;
    codEnabled: boolean;
    manualEnabled: boolean;
    woocommerceEnabled?: boolean;
    manualPaymentTitle: string;
    manualPaymentInstructions: string;
    manualBankDetails: string;
  }>({
    stripeEnabled: true,
    codEnabled: true,
    manualEnabled: true,
    woocommerceEnabled: false,
    manualPaymentTitle: "Bank Transfer / EasyPaisa / JazzCash",
    manualPaymentInstructions: "Please transfer the total amount to the account below and enter your TRX reference ID.",
    manualBankDetails: "Account Title: Yaadgari Perfumes\nAccount #: 1234567890\nBank / Provider: EasyPaisa / JazzCash / Bank Alfalah",
  });

  const [shippingMethods, setShippingMethods] = useState<any[]>([
    { id: "standard", name: "Standard Shipping", price: 25, timeframe: "1 - 2 Business Days", description: "Standard tracked home delivery", freeShippingMin: 0, enabled: true },
    { id: "express", name: "Express / Fast Delivery", price: 45, timeframe: "1 - 2 Business Days", description: "Priority expedited express shipping", freeShippingMin: 0, enabled: true }
  ]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("standard");

  // Active payment tab: "stripe" | "cod" | "manual" | "woocommerce"
  const [paymentMode, setPaymentMode] = useState<"stripe" | "cod" | "manual" | "woocommerce">("stripe");

  // Order & Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("AE");
  
  // Manual Payment State
  const [manualRefId, setManualRefId] = useState("");
  const [manualNote, setManualNote] = useState("");

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const subtotal = activeItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingId) || shippingMethods[0];
  const rawShippingFee = selectedShipping ? Number(selectedShipping.price ?? selectedShipping.cost ?? 0) : 0;
  const selectedMethodMin = Number(selectedShipping?.freeShippingMin || 0);

  const isFreeShipping = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || (selectedMethodMin > 0 && subtotal >= selectedMethodMin);
  const shippingFee = isFreeShipping ? 0 : rawShippingFee;
  const grandTotal = subtotal + shippingFee;

  const handleSelectPaymentMode = useCallback((mode: "stripe" | "cod" | "manual" | "woocommerce") => {
    setPaymentMode(mode);
    trackMetaAddPaymentInfo({
      total: grandTotal,
      currency: currency || "AED",
      paymentType:
        mode === "stripe"
          ? "Stripe Card"
          : mode === "cod"
          ? "Cash on Delivery"
          : mode === "manual"
          ? paymentConfig.manualPaymentTitle || "Bank Transfer"
          : "WooCommerce",
      contentIds: activeItems.map((i) => String(i.productId)),
      contents: activeItems.map((i) => ({
        id: String(i.productId),
        quantity: i.quantity || 1,
        item_price: Number(i.price || 0),
      })),
    });
  }, [grandTotal, currency, paymentConfig.manualPaymentTitle, activeItems]);

  useEffect(() => {
    if (!mounted || cart === undefined) return;

    if (cart.length === 0) {
      if (completedOrderId.current) return;
      router.replace("/cart");
      return;
    }

    // 1. Fetch public store settings in parallel (non-blocking)
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((settingsData) => {
        if (settingsData && settingsData.success) {
          if (settingsData.freeShippingThreshold !== undefined) {
            setFreeShippingThreshold(Number(settingsData.freeShippingThreshold || 0));
          }
          if (settingsData.paymentSettings) {
            setPaymentConfig(settingsData.paymentSettings);
            if (!settingsData.paymentSettings.stripeEnabled) {
              if (settingsData.paymentSettings.codEnabled) setPaymentMode("cod");
              else if (settingsData.paymentSettings.manualEnabled) setPaymentMode("manual");
            }
          }
          if (Array.isArray(settingsData.shippingMethods)) {
            setShippingMethods(settingsData.shippingMethods);
            setSelectedShippingId((current) => settingsData.shippingMethods.some((method: { id: string }) => method.id === current)
              ? current
              : settingsData.shippingMethods[0]?.id || "");
          }
        }
      })
      .catch((err) => {
        console.warn("Public settings load fallback", err);
      });

  }, [cart?.length, router, mounted]);

  useEffect(() => {
    if (paymentMode !== "stripe" || !paymentConfig.stripeEnabled || activeItems.length === 0) return;

    const controller = new AbortController();
    setLoadingStripe(true);
    setClientSecret("");
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: activeItems, shippingMethodId: selectedShipping?.id }),
      signal: controller.signal,
    }).then(async (response) => {
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !data.clientSecret || !data.publishableKey) {
        throw new Error(data.error || "Online card payments temporarily unavailable.");
      }
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStripeTotal(data.total);
      setStripePromise(loadStripe(data.publishableKey));
      setStripeAvailable(true);
      setStripeError(null);
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setStripeAvailable(false);
      setStripeError(error.message || "Could not initialize card terminal.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingStripe(false);
    });

    return () => controller.abort();
  }, [activeItems, paymentMode, paymentConfig.stripeEnabled, selectedShipping?.id]);

  useEffect(() => {
    if (activeItems.length > 0 && grandTotal > 0 && !hasTrackedInitiateRef.current) {
      hasTrackedInitiateRef.current = true;
      trackMetaInitiateCheckout({
        items: activeItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total: grandTotal,
        currency: currency || "AED",
        numItems: activeItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
      });
    }
  }, [activeItems, grandTotal, currency]);

  const validateForm = useCallback(() => {
    setCheckoutError(null);
    if (!customerName.trim()) {
      setCheckoutError("Please enter your Full Name.");
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setCheckoutError("Please enter a valid Email Address.");
      return false;
    }
    if (!customerPhone.trim()) {
      setCheckoutError("Please enter your Contact / Delivery Phone Number.");
      return false;
    }
    if (!line1.trim()) {
      setCheckoutError("Please enter your Street Address.");
      return false;
    }
    if (!/^[A-Za-z]{2}$/.test(country.trim())) {
      setCheckoutError("Enter a two-letter country code, such as AE or PK.");
      return false;
    }
    if (!city.trim()) {
      setCheckoutError("Please enter your City.");
      return false;
    }
    return true;
  }, [customerName, customerEmail, customerPhone, line1, city, country]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (paymentMode === "stripe") {
      setCheckoutError("Use the secure card payment form below to complete your payment.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Set Advanced Matching user data for Meta Event Match Quality
    setMetaUserData({
      email: customerEmail,
      phone: customerPhone,
      firstName: customerName.trim().split(" ")[0],
      lastName: customerName.trim().split(" ").slice(1).join(" "),
      city,
      country,
    });

    // Track Meta AddPaymentInfo event
    trackMetaAddPaymentInfo({
      total: grandTotal,
      currency: currency || "AED",
      paymentType: paymentMode === "manual" ? "Bank Transfer" : paymentMode === "woocommerce" ? "WooCommerce" : "Cash on Delivery",
      contentIds: activeItems.map((i) => String(i.productId)),
      contents: activeItems.map((i) => ({
        id: String(i.productId),
        quantity: i.quantity || 1,
        item_price: Number(i.price || 0),
      })),
    });

    if (paymentMode === "manual" && !manualRefId.trim()) {
      setCheckoutError("Please enter your Transaction / Reference ID for manual payment verification.");
      return;
    }

    if (paymentMode === "woocommerce") {
      setSubmittingOrder(true);
      try {
        const res = await fetch("/api/checkout/woocommerce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: activeItems,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress: {
              street: `${line1} ${line2}`.trim(),
              city,
              state: stateRegion,
              zip: postalCode,
              country,
              phone: customerPhone,
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.checkoutUrl) {
          if (removeSelectedFromCart) removeSelectedFromCart();
          else clearCart();
          window.location.href = data.checkoutUrl;
        } else {
          setCheckoutError(data.error || "Failed to launch WooCommerce payment session.");
          setSubmittingOrder(false);
        }
      } catch (err: any) {
        setCheckoutError("A network error occurred. Please try again.");
        setSubmittingOrder(false);
      }
      return;
    }

    setSubmittingOrder(true);

    try {
      const res = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: activeItems,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod: paymentMode,
          paymentDetails: paymentMode === "manual" ? {
            referenceId: manualRefId,
            note: manualNote,
          } : undefined,
          deliveryOption: selectedShipping ? { id: selectedShipping.id } : undefined,
          shippingAddress: {
            line1,
            line2,
            city,
            state: stateRegion,
            postalCode,
            country,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.orderId) {
        completedOrderId.current = data.orderId;
        if (removeSelectedFromCart) removeSelectedFromCart();
        else clearCart();
        router.replace(`/order-confirmation/${data.orderId}`);
      } else {
        setCheckoutError(data.error || "Failed to place order. Please try again.");
        setSubmittingOrder(false);
      }
    } catch (err: any) {
      setCheckoutError("A network error occurred. Please try again.");
      setSubmittingOrder(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{completedOrderId.current ? "Opening your order confirmation…" : "Opening your cart…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 pb-32 border-t border-border">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6">
        
        {/* Header Breadcrumb & Security Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck size={14} /> 256-Bit Encrypted
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-foreground">Checkout</h1>
          {cart.length > activeItems.length && (
            <p className="text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              Purchasing <strong>{activeItems.length}</strong> of <strong>{cart.length}</strong> items in your cart. Remaining items stay saved.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Form Column (Always structured in clean, luxury steps) */}
          <div className="lg:col-span-8 space-y-8">

            {/* STEP 1: Contact Information */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
              <h3 className="text-base sm:text-lg font-serif uppercase tracking-wider border-b border-border pb-3 text-foreground flex items-center gap-2.5">
                <User size={18} className="text-primary" /> 1. Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tariq@example.com"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Phone Number (For Delivery Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: Delivery Address */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
              <h3 className="text-base sm:text-lg font-serif uppercase tracking-wider border-b border-border pb-3 text-foreground flex items-center gap-2.5">
                <MapPin size={18} className="text-primary" /> 2. Delivery Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Street Address / Villa / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Villa 12, Street 45, Al Barsha 1"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Apartment, Suite, Unit, Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Apt 402, Near City Mall"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dubai / Abu Dhabi / Karachi"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    State / Emirate / Region
                  </label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="Dubai / Sindh / Riyadh"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="00000"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Country Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="AE"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Delivery Method Selection */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-serif uppercase tracking-wider border-b border-border pb-3 text-foreground flex items-center gap-2.5">
                <Truck size={18} className="text-primary" /> 3. Delivery Method
              </h3>
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const cost = Number(method.price ?? method.cost ?? 0);
                  const min = Number(method.freeShippingMin || 0);
                  const free = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || (min > 0 && subtotal >= min);
                  const isSelected = selectedShippingId === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                          : "border-border bg-card hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={isSelected}
                          onChange={() => setSelectedShippingId(method.id)}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-foreground block">
                            {method.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {method.timeframe} {method.description && `• ${method.description}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {free ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground line-through">
                              {formatPrice(cost)}
                            </span>
                            <span className="text-emerald-500 font-mono text-[11px] uppercase tracking-wider font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              FREE
                            </span>
                          </div>
                        ) : (
                          <span className="font-price font-bold text-xs sm:text-sm text-foreground">
                            {cost === 0 ? "FREE" : formatPrice(cost)}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: Payment Method */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
              <h3 className="text-base sm:text-lg font-serif uppercase tracking-wider border-b border-border pb-3 text-foreground flex items-center gap-2.5">
                <CreditCard size={18} className="text-primary" /> 4. Payment Method
              </h3>

              {/* Mobile Payment Selector */}
              <div className="block sm:hidden relative">
                <select
                  value={paymentMode}
                  onChange={(e) => handleSelectPaymentMode(e.target.value as any)}
                  className="w-full appearance-none bg-card border border-border rounded-xl p-4 pr-10 text-xs font-bold uppercase tracking-wider text-foreground shadow-xs focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {paymentConfig.stripeEnabled && (
                    <option value="stripe">💳 Credit / Debit Card (Stripe)</option>
                  )}
                  {paymentConfig.codEnabled && (
                    <option value="cod">🚚 Cash on Delivery (COD)</option>
                  )}
                  {paymentConfig.manualEnabled && (
                    <option value="manual">🏛️ {paymentConfig.manualPaymentTitle || "Bank Transfer"}</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Desktop Payment Selector Tabs */}
              <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {paymentConfig.stripeEnabled && (
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMode("stripe")}
                    className={`py-4 px-5 rounded-2xl font-mono text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMode === "stripe"
                        ? "border-2 border-accent bg-accent/15 text-foreground shadow-sm font-black ring-1 ring-accent/30"
                        : "border border-border/80 bg-card hover:bg-muted/60 hover:border-foreground/30 text-muted-foreground hover:text-foreground font-bold"
                    }`}
                  >
                    <CreditCard size={17} className={paymentMode === "stripe" ? "text-accent" : "text-muted-foreground"} />
                    <span>Card Payment</span>
                    {paymentMode === "stripe" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </button>
                )}

                {paymentConfig.codEnabled && (
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMode("cod")}
                    className={`py-4 px-5 rounded-2xl font-mono text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMode === "cod"
                        ? "border-2 border-accent bg-accent/15 text-foreground shadow-sm font-black ring-1 ring-accent/30"
                        : "border border-border/80 bg-card hover:bg-muted/60 hover:border-foreground/30 text-muted-foreground hover:text-foreground font-bold"
                    }`}
                  >
                    <Truck size={17} className={paymentMode === "cod" ? "text-accent" : "text-muted-foreground"} />
                    <span>Cash on Delivery</span>
                    {paymentMode === "cod" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </button>
                )}

                {paymentConfig.manualEnabled && (
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMode("manual")}
                    className={`py-4 px-5 rounded-2xl font-mono text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMode === "manual"
                        ? "border-2 border-accent bg-accent/15 text-foreground shadow-sm font-black ring-1 ring-accent/30"
                        : "border border-border/80 bg-card hover:bg-muted/60 hover:border-foreground/30 text-muted-foreground hover:text-foreground font-bold"
                    }`}
                  >
                    <Landmark size={17} className={paymentMode === "manual" ? "text-accent" : "text-muted-foreground"} />
                    <span>{paymentConfig.manualPaymentTitle || "Bank Transfer"}</span>
                    {paymentMode === "manual" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </button>
                )}

                {paymentConfig.woocommerceEnabled && (
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMode("woocommerce")}
                    className={`py-4 px-5 rounded-2xl font-mono text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMode === "woocommerce"
                        ? "border-2 border-accent bg-accent/15 text-foreground shadow-sm font-black ring-1 ring-accent/30"
                        : "border border-border/80 bg-card hover:bg-muted/60 hover:border-foreground/30 text-muted-foreground hover:text-foreground font-bold"
                    }`}
                  >
                    <ShoppingBag size={17} className={paymentMode === "woocommerce" ? "text-accent" : "text-muted-foreground"} />
                    <span>WooCommerce</span>
                    {paymentMode === "woocommerce" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </button>
                )}
              </div>

              {/* CARD PAYMENT (STRIPE) */}
              {paymentMode === "stripe" && paymentConfig.stripeEnabled && (
                loadingStripe ? (
                  <div className="p-10 rounded-2xl border border-border bg-card/80 flex flex-col items-center justify-center text-center space-y-3">
                    <Loader2 className="w-7 h-7 animate-spin text-accent" />
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Connecting Secure Terminal</h4>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Initializing 256-bit encrypted gateway...</p>
                    </div>
                  </div>
                ) : stripeAvailable && clientSecret && stripePromise ? (
                  <div className="pt-2">
                    <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                      <CheckoutForm 
                        orderId={orderId} 
                        total={stripeTotal}
                        customerName={customerName}
                        customerEmail={customerEmail}
                        customerPhone={customerPhone}
                        shippingAddress={{
                          line1,
                          line2,
                          city,
                          state: stateRegion,
                          postalCode,
                          country,
                        }}
                        validateForm={validateForm}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">
                              Online Card Gateway
                            </h4>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-accent/40 bg-accent/10 text-accent font-bold">
                              Notice
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                            {stripeError || "Direct card payments are temporarily unavailable. Please select Cash on Delivery or Bank Transfer below to complete your order."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        Available Instant Options:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {paymentConfig.codEnabled && (
                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMode("cod")}
                            className="flex-1 sm:flex-initial px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Truck size={14} /> Pay via COD
                          </button>
                        )}
                        {paymentConfig.manualEnabled && (
                          <button
                            type="button"
                            onClick={() => handleSelectPaymentMode("manual")}
                            className="flex-1 sm:flex-initial px-5 py-2.5 bg-background text-foreground border border-border text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Landmark size={14} /> Bank Transfer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* CASH ON DELIVERY / BANK TRANSFER / WOOCOMMERCE FORM */}
              {paymentMode !== "stripe" && (
                <form onSubmit={handleOrderSubmit} className="space-y-6 pt-2">
                  {/* COD Confirmation */}
                  {paymentMode === "cod" && (
                    <div className="p-5 bg-card rounded-2xl border border-border space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
                        <Truck size={16} className="text-primary" /> Cash on Delivery Confirmed
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pay in cash upon delivery of your luxury parcel at your doorstep. Please have the exact amount of <strong className="text-foreground">{formatPrice(grandTotal)}</strong> ready upon arrival.
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer Instructions */}
                  {paymentMode === "manual" && (
                    <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-2">
                        <Landmark size={16} className="text-primary" /> Bank Transfer Details
                      </h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                        {paymentConfig.manualPaymentInstructions}
                      </p>
                      <div className="p-4 bg-muted/40 rounded-xl border border-border font-mono text-xs whitespace-pre-line text-foreground">
                        {paymentConfig.manualBankDetails}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                          Transaction / Reference ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualRefId}
                          onChange={(e) => setManualRefId(e.target.value)}
                          placeholder="e.g. TRX-98234123"
                          className="w-full border border-border bg-background rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                          Sender Account Name / Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={manualNote}
                          onChange={(e) => setManualNote(e.target.value)}
                          placeholder="Account title or transfer notes"
                          className="w-full border border-border bg-background rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                    </div>
                  )}

                  {/* WooCommerce Redirect */}
                  {paymentMode === "woocommerce" && (
                    <div className="p-5 bg-card rounded-2xl border border-border space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
                        <ShoppingBag size={16} className="text-primary" /> WooCommerce Secure Gateway
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You will be redirected to the secure WooCommerce checkout page to complete your payment.
                      </p>
                    </div>
                  )}

                  {checkoutError && (
                    <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-mono rounded-xl">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="w-full flex items-center justify-center gap-2 px-8 py-5 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground bg-primary hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg cursor-pointer font-bold"
                  >
                    {submittingOrder ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Placing Order...
                      </span>
                    ) : (
                      <>Place Order <span className="font-price font-bold ml-1">({formatPrice(grandTotal)})</span></>
                    )}
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 border border-border bg-card sticky top-28 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-foreground">Order Summary</h2>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  {activeItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>
              
              <div className="flex flex-col gap-4 border-b border-border pb-6 max-h-[22rem] overflow-y-auto pr-1">
                {activeItems.map((item) => (
                  <div key={`${item.productId}-${item.selectedVariant?.name || 'base'}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-muted shrink-0 border border-border rounded-xl overflow-hidden relative">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          decoding="async"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] font-mono text-muted-foreground uppercase">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <span className="font-serif text-sm leading-snug mb-1 truncate font-bold text-foreground">{item.name}</span>
                      {item.selectedVariant && (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{item.selectedVariant.name}</span>
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-price font-bold text-xs uppercase tracking-widest">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-border pb-6">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="uppercase tracking-[0.15em] text-muted-foreground">Subtotal</span>
                  <span className="font-price font-bold uppercase tracking-widest">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1">
                    Shipping ({selectedShipping?.name || "Standard"})
                  </span>
                  <span className="font-price font-bold uppercase tracking-widest text-primary">
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="uppercase tracking-[0.15em] text-xs font-mono font-bold block text-muted-foreground">Total</span>
                  <span className="text-[10px] text-muted-foreground">Taxes included</span>
                </div>
                <span className="text-2xl sm:text-3xl font-price font-bold text-foreground">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

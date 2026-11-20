"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, CreditCard } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { trackMetaAddPaymentInfo, setMetaUserData } from "@/lib/analytics/metaPixel";

interface CheckoutFormProps {
  orderId: string;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  validateForm: () => boolean;
}

export default function CheckoutForm({
  orderId,
  total,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  validateForm,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { formatPrice, currency } = useCurrency();

  const [paymentReady, setPaymentReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Validate required contact and address fields
    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      setMessage("Payment terminal is still initializing. Please wait a moment.");
      return;
    }

    setIsLoading(true);
    const baseUrl = window.location.origin;

    try {
      // Set Advanced Matching user data for Meta Event Match Quality
      setMetaUserData({
        email: customerEmail,
        phone: customerPhone,
        firstName: customerName.trim().split(" ")[0],
        lastName: customerName.trim().split(" ").slice(1).join(" "),
      });

      // Track Meta AddPaymentInfo event
      trackMetaAddPaymentInfo({
        total,
        paymentType: "Stripe Card",
        currency,
      });

      try {
        window.sessionStorage.setItem("sqodex-stripe-checkout", orderId);
      } catch {
        // Checkout remains available when browser storage is disabled.
      }
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: customerEmail,
          shipping: {
            name: customerName,
            phone: customerPhone,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city,
              state: shippingAddress.state || undefined,
              postal_code: shippingAddress.postalCode || undefined,
              country: (shippingAddress.country || "AE").toUpperCase(),
            },
          },
          return_url: `${baseUrl}/order-confirmation/${orderId}`,
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              address: {
                line1: shippingAddress.line1,
                line2: shippingAddress.line2 || undefined,
                city: shippingAddress.city,
                state: shippingAddress.state || undefined,
                postal_code: shippingAddress.postalCode || undefined,
                country: (shippingAddress.country || "AE").toUpperCase(),
              },
            },
          },
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "An error occurred with your payment card.");
        } else {
          setMessage(error.message || "An unexpected error occurred during card payment.");
        }
      }
    } catch (err: any) {
      setMessage(err.message || "Payment communication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="stripe-payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <label className="block text-xs font-mono uppercase tracking-[0.15em] text-foreground font-bold flex items-center gap-2">
            <CreditCard size={15} className="text-accent" /> Card Information
          </label>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/60">
            <Lock size={11} className="text-accent" /> 256-Bit SSL Encrypted
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
          <PaymentElement
            id="payment-element"
            onReady={() => setPaymentReady(true)}
            onLoadError={(event) => {
              setPaymentReady(false);
              setMessage(event.error.message || "The payment form could not load. Please refresh and try again.");
            }}
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {message && (
        <div id="payment-message" className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-mono rounded-xl">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements || !paymentReady}
        id="submit"
        className="w-full flex items-center justify-center gap-2 px-8 py-5 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground bg-primary hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg cursor-pointer font-bold"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            Authorizing Secure Payment...
          </span>
        ) : (
          <>Pay <span className="font-price font-bold ml-1">({formatPrice(total)})</span></>
        )}
      </button>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { Truck, Banknote, RotateCcw, HeadphonesIcon, X, CheckCircle2, ShieldCheck, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface TrustBadgesProps {
  settings?: any;
}

type BadgeKey = "shipping" | "cod" | "returns" | "support" | null;

export default function TrustBadges({ settings }: TrustBadgesProps) {
  const [activeModal, setActiveModal] = useState<BadgeKey>(null);

  const badgesConfig = settings?.badgesConfig || {};
  const currency = settings?.currency || "AED";
  const rawThreshold = settings?.freeShippingThreshold || 500;

  const formattedThreshold = `${currency} ${Number(rawThreshold).toLocaleString()}`;
  const contactPhone = settings?.contact?.phone || settings?.phone || "";
  const contactEmail = settings?.contact?.email || settings?.email || "info@yadgariperfumes.com";
  const storeName = settings?.name || "Yadgari Perfumes";

  const item1Title = badgesConfig.item1 || "Free Shipping";
  const item2Title = badgesConfig.item2 || "15-Day Returns";
  const item3Title = badgesConfig.item3 || "24/7 Support";

  return (
    <>
      <section
        data-customizer-block="true"
        data-block-id="badges"
        data-block-type="Trust Badges"
        className="border-y border-[#3A362B] bg-[#1B1914] text-[#F7F5F0] py-12 md:py-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            
            {/* 1. FREE SHIPPING */}
            <div
              onClick={() => setActiveModal("shipping")}
              className="group relative flex flex-col items-center text-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-[#29261E] border border-[#3A362B] group-hover:border-[#B89555] flex items-center justify-center text-[#C8A96B] mb-5 transition-colors duration-300 shadow-inner">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#F7F5F0] group-hover:text-[#B89555] transition-colors mb-2">
                {item1Title}
              </h3>
              <p className="font-mono text-xs text-[#A39B8B] leading-relaxed max-w-[210px] font-normal">
                On all orders over {formattedThreshold}
              </p>
            </div>

            {/* 2. CASH ON DELIVERY */}
            <div
              onClick={() => setActiveModal("cod")}
              className="group relative flex flex-col items-center text-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-[#29261E] border border-[#3A362B] group-hover:border-[#B89555] flex items-center justify-center text-[#C8A96B] mb-5 transition-colors duration-300 shadow-inner">
                <Banknote size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#F7F5F0] group-hover:text-[#B89555] transition-colors mb-2">
                Cash on Delivery
              </h3>
              <p className="font-mono text-xs text-[#A39B8B] leading-relaxed max-w-[210px] font-normal">
                Pay when order arrives at your doorstep
              </p>
            </div>

            {/* 3. 15-DAY RETURNS */}
            <div
              onClick={() => setActiveModal("returns")}
              className="group relative flex flex-col items-center text-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-[#29261E] border border-[#3A362B] group-hover:border-[#B89555] flex items-center justify-center text-[#C8A96B] mb-5 transition-colors duration-300 shadow-inner">
                <RotateCcw size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#F7F5F0] group-hover:text-[#B89555] transition-colors mb-2">
                {item2Title}
              </h3>
              <p className="font-mono text-xs text-[#A39B8B] leading-relaxed max-w-[210px] font-normal">
                No questions asked guarantee
              </p>
            </div>

            {/* 4. 24/7 SUPPORT */}
            <div
              onClick={() => setActiveModal("support")}
              className="group relative flex flex-col items-center text-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-[#29261E] border border-[#3A362B] group-hover:border-[#B89555] flex items-center justify-center text-[#C8A96B] mb-5 transition-colors duration-300 shadow-inner">
                <HeadphonesIcon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#F7F5F0] group-hover:text-[#B89555] transition-colors mb-2">
                {item3Title}
              </h3>
              <p className="font-mono text-xs text-[#A39B8B] leading-relaxed max-w-[210px] font-normal">
                Dedicated customer care team
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* POPUP MODAL DIALOG */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-card text-card-foreground rounded-3xl border border-border shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B89555]/15 text-[#B89555] flex items-center justify-center">
                  {activeModal === "shipping" && <Truck size={20} />}
                  {activeModal === "cod" && <Banknote size={20} />}
                  {activeModal === "returns" && <RotateCcw size={20} />}
                  {activeModal === "support" && <HeadphonesIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl uppercase tracking-wider text-card-foreground">
                    {activeModal === "shipping" && (item1Title || "Free Express Shipping")}
                    {activeModal === "cod" && "Cash On Delivery (COD)"}
                    {activeModal === "returns" && (item2Title || "15-Day Return Policy")}
                    {activeModal === "support" && (item3Title || "24/7 Support")}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#B89555]">
                    {storeName.toUpperCase()} GUARANTEE
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-[#B89555] text-muted-foreground hover:text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Details */}
            {activeModal === "shipping" && (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We provide complimentary insured express delivery on all orders over <strong className="text-card-foreground font-bold">{formattedThreshold}</strong>. Every order is individually inspected and shipped in custom luxury packaging.
                </p>

                <div className="space-y-3 bg-muted/40 rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Same-Day Dispatch</h4>
                      <p className="text-xs text-muted-foreground">Orders placed before 3:00 PM are dispatched same-day via express air couriers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Insured Tamper-Proof Packaging</h4>
                      <p className="text-xs text-muted-foreground">Dispatched in custom rigid presentation boxes with security seal protection.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#B89555] hover:bg-[#C8A96B] text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}

            {activeModal === "cod" && (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Enjoy complete peace of mind with our Cash on Delivery (COD) service. Inspect your package at delivery before handing over payment to the courier.
                </p>

                <div className="space-y-3 bg-muted/40 rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Zero Upfront Payment</h4>
                      <p className="text-xs text-muted-foreground">Order without entering any online card details. Simply pay cash to the delivery representative.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Package Inspection</h4>
                      <p className="text-xs text-muted-foreground">Inspect the sealed luxury box in front of the courier to ensure full authenticity.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Order Verification</h4>
                      <p className="text-xs text-muted-foreground">A quick verification notification is sent prior to dispatch for seamless delivery execution.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#B89555] hover:bg-[#C8A96B] text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}

            {activeModal === "returns" && (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We stand behind the quality and craftsmanship of every product. If you are not completely satisfied, return or exchange your order within 15 days of delivery.
                </p>

                <div className="space-y-3 bg-muted/40 rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">Complimentary Home Pickup</h4>
                      <p className="text-xs text-muted-foreground">We arrange courier collection directly from your doorstep at no additional charge.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">100% Refund or Exchange</h4>
                      <p className="text-xs text-muted-foreground">Choose between a full original payment refund or instant exchange for another item.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="text-[#B89555] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-card-foreground">100% Authenticity Guarantee</h4>
                      <p className="text-xs text-muted-foreground">All products are guaranteed 100% authentic and crafted to the highest quality standards.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
                  <Link
                    href="/faq"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-3 border border-border hover:border-[#B89555] text-card-foreground font-mono text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-all"
                  >
                    READ RETURN POLICY & FAQS
                  </Link>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-3 bg-[#B89555] hover:bg-[#C8A96B] text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    GOT IT
                  </button>
                </div>
              </div>
            )}

            {activeModal === "support" && (
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Our dedicated client advisors are available 24/7 to assist you with order tracking, product inquiries, and customer care assistance.
                </p>

                <div className={`grid grid-cols-1 ${contactPhone ? "sm:grid-cols-2" : ""} gap-3`}>
                  {/* Phone Call Link - from admin panel */}
                  {contactPhone ? (
                    <a
                      href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                      className="flex flex-col items-center justify-center p-4 bg-muted/60 hover:bg-[#B89555]/15 border border-border hover:border-[#B89555] rounded-2xl text-center group transition-all"
                    >
                      <Phone size={22} className="text-[#B89555] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-card-foreground group-hover:text-[#B89555]">Call Helpline</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{contactPhone}</span>
                    </a>
                  ) : null}

                  {/* Email Support Link */}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex flex-col items-center justify-center p-4 bg-muted/60 hover:bg-[#B89555]/15 border border-border hover:border-[#B89555] rounded-2xl text-center group transition-all"
                  >
                    <Mail size={22} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-card-foreground group-hover:text-[#B89555]">Email Support</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 normal-case lowercase truncate max-w-[180px]">{contactEmail}</span>
                  </a>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#B89555] hover:bg-[#C8A96B] text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

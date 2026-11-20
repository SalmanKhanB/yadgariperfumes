"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Zap, CheckCircle2, X, Sparkles, CreditCard, Smartphone, Truck, Building2 } from "lucide-react";

export function AmexBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#006FCF" />
      <path d="M12.8 23.2H8L6.8 26H3L9 10H11.8L17.8 26H14L12.8 23.2ZM12 20.4L10.4 15.6L8.8 20.4H12Z" fill="white" />
      <path d="M18.8 10H22.8L25.2 18L27.6 10H31.6V26H28.4V15.2L25.8 23.6H24.6L22 15.2V26H18.8V10Z" fill="white" />
      <path d="M33.2 10H42.8V13.2H36.4V16.4H42V19.6H36.4V22.8H42.8V26H33.2V10Z" fill="white" />
      <path d="M51.2 10L47.2 17.2L51.6 26H47.6L45.2 21L42.8 26H39L43.4 17.2L39.4 10H43.2L45.2 14.6L47.4 10H51.2Z" fill="white" />
    </svg>
  );
}

export function ApplePayBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M21.2 16.5C21.2 15 22.1 14.1 23.1 13.5C22.5 12.6 21.5 12.1 20.4 12C19.1 11.9 17.8 12.8 17.1 12.8C16.4 12.8 15.3 12 14.3 12C12.9 12 11.7 12.8 11 14C9.5 16.6 10.6 20.5 12.1 22.6C12.8 23.6 13.6 24.7 14.7 24.7C15.8 24.7 16.2 24 17.5 24C18.8 24 19.2 24.7 20.3 24.7C21.4 24.7 22.1 23.7 22.8 22.7C23.6 21.6 23.9 20.5 24 20.4C23.9 20.3 21.2 19.3 21.2 16.5Z" fill="white" />
      <path d="M19.1 10.7C19.7 10 20 9 19.9 8C19 8 17.9 8.6 17.3 9.3C16.8 9.9 16.3 10.9 16.5 11.9C17.5 12 18.5 11.4 19.1 10.7Z" fill="white" />
      <path d="M27.2 12.5H29.7C31.5 12.5 32.7 13.5 32.7 15.2C32.7 16.9 31.5 17.9 29.7 17.9H28.4V24.5H27.2V12.5ZM29.6 16.8C30.7 16.8 31.4 16.2 31.4 15.2C31.4 14.2 30.7 13.6 29.6 13.6H28.4V16.8H29.6Z" fill="white" />
      <path d="M33.8 20.7C33.8 19 35.1 18 37.3 17.9L39.2 17.8V17.2C39.2 16.1 38.4 15.5 37.2 15.5C36.1 15.5 35.2 16.1 35 17H33.9C34 15.4 35.4 14.4 37.3 14.4C39.2 14.4 40.4 15.4 40.4 17.1V24.5H39.2V22.9H39.1C38.4 24 37.2 24.6 35.9 24.6C34.6 24.6 33.8 23.6 33.8 20.7ZM39.2 19.6V18.8L37.5 18.9C36.1 19 35 19.6 35 20.6C35 21.5 35.8 22 36.8 22C38.1 22.1 39.2 21.1 39.2 19.6Z" fill="white" />
      <path d="M41.6 14.6H42.9L45.2 21.6L47.5 14.6H48.8L45.9 22.8L44.8 25.8H43.6L44.8 22.6L41.6 14.6Z" fill="white" />
    </svg>
  );
}

export function DinersClubBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="28" cy="18" r="11" fill="#0079C1" />
      <path d="M25 11C21.1 11 18 14.1 18 18C18 21.9 21.1 25 25 25V11Z" fill="#1C1A17" />
      <path d="M31 11V25C34.9 25 38 21.9 38 18C38 14.1 34.9 11 31 11Z" fill="#1C1A17" />
    </svg>
  );
}

export function DiscoverBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <text x="23.5" y="21.5" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="8.5" fill="white" letterSpacing="0.2">DISC</text>
      <circle cx="28" cy="17.5" r="4" fill="#F47216" />
      <text x="32.5" y="21.5" textAnchor="start" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="8.5" fill="white" letterSpacing="0.2">VER</text>
    </svg>
  );
}

export function GPayBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <g transform="translate(10, 11) scale(0.6)">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </g>
      <text x="26" y="23" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#FFFFFF">Pay</text>
    </svg>
  );
}

export function JcbBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="12" y="8" width="10" height="20" rx="3" fill="#003580" />
      <rect x="23" y="8" width="10" height="20" rx="3" fill="#E60012" />
      <rect x="34" y="8" width="10" height="20" rx="3" fill="#009933" />
      <text x="14" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="white">J</text>
      <text x="24" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="white">C</text>
      <text x="35" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="white">B</text>
    </svg>
  );
}

export function MastercardBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="22" cy="18" r="9" fill="#EB001B" />
      <circle cx="34" cy="18" r="9" fill="#F79E1B" fillOpacity="0.92" />
      <path d="M28 11.3A9 9 0 0 1 31.4 18A9 9 0 0 1 28 24.7A9 9 0 0 1 24.6 18A9 9 0 0 1 28 11.3Z" fill="#FF5F00" />
    </svg>
  );
}

export function VisaBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#0057B8" />
      <path d="M21.7 24L24.3 12H27.5L24.9 24H21.7ZM35.4 12.3C34.7 12 33.6 11.7 32.2 11.7C28.8 11.7 26.4 13.4 26.4 15.8C26.4 17.6 28 18.6 29.3 19.2C30.6 19.8 31 20.2 31 20.7C31 21.5 30 21.9 29.1 21.9C27.6 21.9 26.8 21.6 25.9 21.2L25.3 23.9C26.2 24.3 27.8 24.6 29.5 24.6C33.2 24.6 35.6 22.8 35.6 20.2C35.6 18.7 34.6 17.5 32.7 16.6C31.6 16.1 30.9 15.7 30.9 15.1C30.9 14.6 31.5 14.1 32.6 14.1C33.8 14.1 34.7 14.4 35.3 14.7L35.4 12.3ZM42.6 12H39.8C38.9 12 38.2 12.3 37.9 13.1L32.4 24H35.8L36.5 22.1H40.7L41.1 24H44.1L42.6 12ZM37.5 19.4L39.1 14.8L40.1 19.4H37.5ZM19.2 12L15.9 20.2L15.5 18.2C14.8 15.9 12.8 13.3 10.4 12.1L13.5 24H16.9L22.2 12H19.2Z" fill="white" />
      <path d="M13.2 12H8.3L8 12.2C12 13.2 14.6 15.9 15.7 18.6L14.4 12.9C14.1 12.3 13.7 12 13.2 12Z" fill="#FAA61A" />
    </svg>
  );
}

export function CodBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="6" y="8" width="44" height="20" rx="3" fill="#1B4D3E" />
      <text x="28" y="22" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="#A3E635" letterSpacing="1">COD</text>
    </svg>
  );
}

export function BankTransferBadge({ className = "h-7 sm:h-8 w-auto shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" rx="6" fill="#1C1A17" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M28 8L12 16V18H44V16L28 8Z" fill="#A98F5C" />
      <rect x="15" y="19" width="3" height="7" fill="#A98F5C" />
      <rect x="22" y="19" width="3" height="7" fill="#A98F5C" />
      <rect x="31" y="19" width="3" height="7" fill="#A98F5C" />
      <rect x="38" y="19" width="3" height="7" fill="#A98F5C" />
      <rect x="10" y="26" width="36" height="2" rx="1" fill="#A98F5C" />
    </svg>
  );
}

interface PaymentInfo {
  title: string;
  subtitle: string;
  badge: React.ReactNode;
  highlights: { title: string; desc: string; icon: "shield" | "lock" | "zap" | "truck" | "phone" }[];
  note: string;
}

const PAYMENT_METHOD_DETAILS: Record<string, PaymentInfo> = {
  visa: {
    title: "Visa Secure Checkout",
    subtitle: "256-Bit SSL Encrypted & 3D Secure Protection",
    badge: <VisaBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Visa Secure (3D Secure 2.0)", desc: "Multi-factor authentication guarantees protection against unauthorized card use.", icon: "shield" },
      { title: "Zero Fraud Liability", desc: "You are 100% protected and never held responsible for unauthorized transactions.", icon: "lock" },
      { title: "Instant Confirmation", desc: "Immediate order verification and digital receipt issued directly upon payment.", icon: "zap" }
    ],
    note: "All transactions are processed through Level-1 PCI-DSS compliant secure payment gateways."
  },
  mc: {
    title: "Mastercard Identity Check",
    subtitle: "Advanced Biometric & Fraud Prevention Architecture",
    badge: <MastercardBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Mastercard Identity Check", desc: "State-of-the-art fraud analysis verifies every online transaction in real-time.", icon: "shield" },
      { title: "Zero Liability Protection", desc: "Complete buyer defense against fraudulent or unauthorized purchases.", icon: "lock" },
      { title: "Global Acceptance", desc: "Instant local and international currency settlement with bank-level encryption.", icon: "zap" }
    ],
    note: "Card credentials are tokenized and never stored in plain text on our servers."
  },
  amex: {
    title: "American Express SafeKey®",
    subtitle: "Industry-Leading Fraud Monitoring & Buyer Assurance",
    badge: <AmexBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Amex SafeKey® 2.0", desc: "Intelligent threat detection secures every high-value purchase with dynamic OTP.", icon: "shield" },
      { title: "24/7 Fraud Monitoring", desc: "Proactive fraud alerts and buyer protection for worry-free shopping.", icon: "lock" },
      { title: "Membership Rewards Eligible", desc: "Earn your standard rewards points and buyer coverage seamlessly.", icon: "zap" }
    ],
    note: "Backed by American Express worldwide risk protection infrastructure."
  },
  apple: {
    title: "Apple Pay",
    subtitle: "Biometric 1-Tap Checkout with Face ID & Touch ID",
    badge: <ApplePayBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Biometric Face ID / Touch ID", desc: "Authorize your purchase with your unique biometrics in under 2 seconds.", icon: "shield" },
      { title: "Device Account Tokenization", desc: "Your actual card number is never stored on the device or shared with our store.", icon: "lock" },
      { title: "Express 1-Tap Checkout", desc: "Zero typing needed — your verified shipping details are populated automatically.", icon: "zap" }
    ],
    note: "Apple does not retain transaction information that can be tied back to you."
  },
  gpay: {
    title: "Google Pay",
    subtitle: "Fast, Private Checkout Protected by Google Security",
    badge: <GPayBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Multi-Layer Google Security", desc: "Continuous threat monitoring and automatic fraud alerts safeguard your funds.", icon: "shield" },
      { title: "Virtual Account Numbers", desc: "Transacts using an encrypted virtual number so your real card data remains hidden.", icon: "lock" },
      { title: "Instant Express Checkout", desc: "Pay with one tap using cards saved in your secure Google Account.", icon: "zap" }
    ],
    note: "Google Pay uses industry standard encryption to protect every transaction."
  },
  disc: {
    title: "Discover Network",
    subtitle: "100% U.S.-Based Fraud Defense & Tokenized Processing",
    badge: <DiscoverBadge className="h-9 w-auto" />,
    highlights: [
      { title: "$0 Fraud Liability", desc: "You are never held responsible for unauthorized transactions made to your card.", icon: "shield" },
      { title: "Encrypted Data Transmission", desc: "Bank-grade TLS 1.3 protocol protects payment credentials end-to-end.", icon: "lock" }
    ],
    note: "Processed securely in compliance with international payment standards."
  },
  diners: {
    title: "Diners Club International",
    subtitle: "Worldwide Cardholder Security & Encrypted Settlement",
    badge: <DinersClubBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Global Network Defense", desc: "Backed by the international Discover & Diners secure payment clearing network.", icon: "shield" },
      { title: "Secure Transmission", desc: "Strict end-to-end encryption ensures seamless and safe transaction completion.", icon: "lock" }
    ],
    note: "Processed under high-grade international card security standards."
  },
  jcb: {
    title: "JCB Contactless & J/Secure™",
    subtitle: "J/Secure™ Protocol & Advanced Fraud Defense",
    badge: <JcbBadge className="h-9 w-auto" />,
    highlights: [
      { title: "J/Secure™ 2.0 Protocol", desc: "Advanced cardholder authentication prevents unauthorized online usage.", icon: "shield" },
      { title: "Protected Transmission", desc: "Direct encrypted connection with official JCB payment gateways.", icon: "lock" }
    ],
    note: "Supported across major international payment networks."
  },
  cod: {
    title: "Cash on Delivery (COD)",
    subtitle: "Pay at Your Doorstep with Zero Advance Payment",
    badge: <CodBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Zero Upfront Payment", desc: "No card or bank details required. Pay only when your package is in your hands.", icon: "truck" },
      { title: "Doorstep Package Inspection", desc: "Inspect packaging and security seal before handing payment to the delivery rider.", icon: "shield" },
      { title: "Cash or Card at Door", desc: "Pay with exact cash or portable card POS machines where available.", icon: "zap" }
    ],
    note: "A real-time tracking number and SMS confirmation will be sent as soon as your order is dispatched."
  },
  manual: {
    title: "Direct Bank Transfer",
    subtitle: "Direct Account Deposit with Official Invoice Receipt",
    badge: <BankTransferBadge className="h-9 w-auto" />,
    highlights: [
      { title: "Direct Account Deposit", desc: "Transfer directly from your online banking app, mobile wallet, or local branch.", icon: "shield" },
      { title: "Official Order Invoice", desc: "Receive immediate order confirmation and a downloadable electronic VAT invoice.", icon: "lock" },
      { title: "Zero Extra Processing Fees", desc: "No card processing surcharges or gateway transaction markups.", icon: "zap" }
    ],
    note: "Bank account details and payment reference instructions will be shown on the order confirmation screen."
  }
};

export function PaymentBadgesGrid({
  className = "",
  settings
}: {
  className?: string;
  settings?: {
    enabled?: boolean;
    showCOD?: boolean;
    showCard?: boolean;
    showGPay?: boolean;
    showApplePay?: boolean;
    showManual?: boolean;
  };
}) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (settings && settings.enabled === false) {
    return null;
  }

  const showCard = settings ? settings.showCard !== false : true;
  const showApple = settings ? settings.showApplePay !== false : true;
  const showGPay = settings ? settings.showGPay !== false : true;
  const showCOD = settings ? settings.showCOD === true : false;
  const showManual = settings ? settings.showManual === true : false;

  const badgeItems: { id: string; name: string; component: React.ReactNode }[] = [];

  if (showCard) {
    badgeItems.push(
      { id: "amex", name: "American Express", component: <AmexBadge /> },
      { id: "visa", name: "Visa", component: <VisaBadge /> },
      { id: "mc", name: "Mastercard", component: <MastercardBadge /> },
      { id: "disc", name: "Discover", component: <DiscoverBadge /> },
      { id: "diners", name: "Diners Club", component: <DinersClubBadge /> },
      { id: "jcb", name: "JCB", component: <JcbBadge /> }
    );
  }

  if (showApple) {
    badgeItems.push({ id: "apple", name: "Apple Pay", component: <ApplePayBadge /> });
  }

  if (showGPay) {
    badgeItems.push({ id: "gpay", name: "Google Pay", component: <GPayBadge /> });
  }

  if (showCOD) {
    badgeItems.push({ id: "cod", name: "Cash on Delivery", component: <CodBadge /> });
  }

  if (showManual) {
    badgeItems.push({ id: "manual", name: "Bank Transfer", component: <BankTransferBadge /> });
  }

  if (badgeItems.length === 0) {
    return null;
  }

  const activeDetails = selectedMethod ? PAYMENT_METHOD_DETAILS[selectedMethod] : null;

  return (
    <>
      <div className={`flex flex-col items-center gap-2 max-w-full ${className}`}>
        {/* Badges Container */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 md:gap-3 py-1 px-2 max-w-full">
          {badgeItems.map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedMethod(badge.id)}
              className="shrink-0 p-0.5 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 hover:ring-2 hover:ring-[#B89555]/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B89555]"
              title={`Click to view ${badge.name} security & checkout details`}
              aria-label={`View ${badge.name} details`}
            >
              {badge.component}
            </button>
          ))}
        </div>


      </div>

      {/* LUXURY PAYMENT DETAILS MODAL DIALOG */}
      {activeDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedMethod(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl border border-border shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 p-1 bg-muted/60 rounded-xl border border-border flex items-center justify-center shadow-xs">
                  {activeDetails.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-card-foreground tracking-wide">
                      {activeDetails.title}
                    </h3>
                    <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      <Lock className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#B89555] mt-0.5">
                    {activeDetails.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-[#B89555] text-muted-foreground hover:text-[#111111] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 mb-5">
              {activeDetails.highlights.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30 border border-border/80">
                  <div className="w-7 h-7 rounded-lg bg-[#B89555]/15 text-[#B89555] flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon === "shield" && <ShieldCheck size={16} />}
                    {item.icon === "lock" && <Lock size={15} />}
                    {item.icon === "zap" && <Zap size={15} />}
                    {item.icon === "truck" && <Truck size={15} />}
                    {item.icon === "phone" && <Smartphone size={15} />}
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-card-foreground tracking-wide uppercase">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 rounded-xl bg-[#B89555]/10 border border-[#B89555]/20 flex items-start gap-2.5 mb-5">
              <Sparkles className="w-4 h-4 text-[#B89555] shrink-0 mt-0.5" />
              <p className="text-[11px] text-card-foreground/90 leading-snug">
                {activeDetails.note}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#B89555] hover:bg-[#C8A96B] text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md cursor-pointer"
              >
                GOT IT, CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  updateSiteSettingsAction,
  fetchSiteSettingsAction,
  testSmtpConnectionAction,
} from "@/server/actions/siteSettingsActions";
import { ImageUploader } from "./ImageUploader";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { FaWhatsapp } from "react-icons/fa6";
import {
  Store,
  Search,
  Compass,
  CreditCard,
  Check,
  Sparkles,
  Globe,
  Share2,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
  Landmark,
  Truck,
  ShoppingBag,
  Info,
  Activity,
  Radio,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "next-themes";
import { Languages, Moon, Sun } from "lucide-react";
import { LiveSerpPreview } from "@/components/seo/LiveSerpPreview";
import { useRouter, useSearchParams } from "next/navigation";

const defaultShippingMethods = [
  { id: "standard", name: "Standard Shipping", price: 0, timeframe: "3 - 5 Business Days", description: "Standard tracked home delivery", enabled: true },
  { id: "express", name: "Express / Fast Delivery", price: 25, timeframe: "1 - 2 Business Days", description: "Priority expedited express shipping", enabled: true }
];

export default function SettingsTabsClient({ initialSettings }: { initialSettings: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab state: "general" | "seo" | "navigation" | "language" | "whatsapp" | "smtp"
  const defaultTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "navigation" | "language" | "whatsapp" | "smtp">(
    defaultTab === "seo" || defaultTab === "navigation" || defaultTab === "language" || defaultTab === "whatsapp" || defaultTab === "smtp" ? defaultTab : "general"
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState(
    initialSettings?.emailSettings?.adminNotificationEmail || initialSettings?.contact?.email || ""
  );
  const [showPassword, setShowPassword] = useState(false);

  const { setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const { register, handleSubmit, watch, setValue, control, reset } = useForm({
    defaultValues: {
      name: initialSettings?.name || "Yaadgari perfumes",
      contact: {
        email: initialSettings?.contact?.email || "",
        phone: initialSettings?.contact?.phone || "",
      },
      logo: initialSettings?.logo || "",
      favicon: initialSettings?.favicon || "",
      physicalAddress: initialSettings?.physicalAddress || "",
      businessHours: initialSettings?.businessHours || "",
      socialLinks: {
        facebook: initialSettings?.socialLinks?.facebook || "",
        twitter: initialSettings?.socialLinks?.twitter || "",
        instagram: initialSettings?.socialLinks?.instagram || "",
        tiktok: initialSettings?.socialLinks?.tiktok || "",
        whatsapp: initialSettings?.socialLinks?.whatsapp || "",
      },
      whatsappChatWidget: {
        enabled: initialSettings?.whatsappChatWidget?.enabled ?? true,
        phoneNumber: initialSettings?.whatsappChatWidget?.phoneNumber || initialSettings?.socialLinks?.whatsapp || "",
        greetingTitle: initialSettings?.whatsappChatWidget?.greetingTitle || `Hello! 👋 Welcome to ${initialSettings?.name || "our store"}.`,
        greetingMessage: initialSettings?.whatsappChatWidget?.greetingMessage || "How can we help you today? Let us know what you need or pick an option below.",
        onlineStatusText: initialSettings?.whatsappChatWidget?.onlineStatusText || "Typically replies in minutes",
        position: initialSettings?.whatsappChatWidget?.position || "bottom-right",
        showNotificationBadge: initialSettings?.whatsappChatWidget?.showNotificationBadge ?? true,
        quickPrompts: initialSettings?.whatsappChatWidget?.quickPrompts?.join(", ") || "📦 Track My Order, 💎 Scent Advice, 🚚 Delivery & COD",
      },
      currency: initialSettings?.currency || "USD",
      freeShippingThreshold: initialSettings?.freeShippingThreshold ?? 0,
      paymentSettings: {
        stripeEnabled: initialSettings?.paymentSettings?.stripeEnabled ?? true,
        codEnabled: initialSettings?.paymentSettings?.codEnabled ?? true,
        codMinOrder: initialSettings?.paymentSettings?.codMinOrder || 0,
        codMaxOrder: initialSettings?.paymentSettings?.codMaxOrder || 0,
        manualEnabled: initialSettings?.paymentSettings?.manualEnabled ?? true,
        manualPaymentTitle:
          initialSettings?.paymentSettings?.manualPaymentTitle ||
          "Bank Transfer / EasyPaisa / JazzCash",
        manualPaymentInstructions:
          initialSettings?.paymentSettings?.manualPaymentInstructions ||
          "Please transfer the total amount to Account # 123456789 and enter your TRX reference ID.",
        manualBankDetails:
          initialSettings?.paymentSettings?.manualBankDetails ||
          "Account Title: Yaadgari Perfumes\nAccount #: 1234567890\nBank / Provider: EasyPaisa / JazzCash / Bank Alfalah",
      },
      woocommerceConfig: {
        enabled: initialSettings?.woocommerceConfig?.enabled ?? false,
        storeUrl: initialSettings?.woocommerceConfig?.storeUrl || "",
        consumerKey: initialSettings?.woocommerceConfig?.consumerKey || "",
        consumerSecret: initialSettings?.woocommerceConfig?.consumerSecret || "",
        webhookSecret: initialSettings?.woocommerceConfig?.webhookSecret || "",
      },
      shippingMethods: (initialSettings?.shippingMethods && initialSettings.shippingMethods.length > 0)
        ? initialSettings.shippingMethods
        : defaultShippingMethods,
      seoDefaults: {
        title: initialSettings?.seoDefaults?.title || initialSettings?.name || "Yaadgari perfumes",
        description:
          initialSettings?.seoDefaults?.description ||
          "Discover luxury perfumes and fragrances crafted for the modern individual.",
        keywords: initialSettings?.seoDefaults?.keywords || "perfumes, fragrances, luxury scents",
        ogImage: initialSettings?.seoDefaults?.ogImage || "",
      },
      headerLinks: initialSettings?.headerLinks || [
        { label: "Home", url: "/" },
        { label: "Collection", url: "/all" },
        { label: "About Us", url: "/about" },
        { label: "Contact", url: "/contact" },
      ],
      footerLinks: initialSettings?.footerLinks || [
        { label: "Track Order", url: "/track-order" },
        { label: "Privacy Policy", url: "/pages/privacy-policy" },
        { label: "Terms of Service", url: "/pages/terms-of-service" },
      ],
      integrations: {
        googleSearchConsoleTag: initialSettings?.integrations?.googleSearchConsoleTag || "",
        googleAnalyticsId: initialSettings?.integrations?.googleAnalyticsId || "",
        metaPixelId: initialSettings?.integrations?.metaPixelId || "",
      },
      emailSettings: {
        smtpHost: initialSettings?.emailSettings?.smtpHost || "",
        smtpPort: initialSettings?.emailSettings?.smtpPort !== undefined ? initialSettings.emailSettings.smtpPort : 587,
        smtpUser: initialSettings?.emailSettings?.smtpUser || "",
        smtpPassword: initialSettings?.emailSettings?.smtpPassword || "",
        smtpSecure: initialSettings?.emailSettings?.smtpSecure || false,
        fromEmail: initialSettings?.emailSettings?.fromEmail || "",
        fromName: initialSettings?.emailSettings?.fromName || "",
        adminNotificationEmail: initialSettings?.emailSettings?.adminNotificationEmail || "",
      },
    },
  });

  const { fields: shippingFields, append: appendShipping, remove: removeShipping } = useFieldArray({
    control,
    name: "shippingMethods",
  });

  const watchedTitle = watch("seoDefaults.title");
  const watchedDescription = watch("seoDefaults.description");
  const watchedOgImage = watch("seoDefaults.ogImage");
  const watchedName = watch("name");
  const headerLinksList = watch("headerLinks") || [];
  const footerLinksList = watch("footerLinks") || [];

  // Update tab state & sync with URL
  const handleTabSwitch = (tab: "general" | "seo" | "navigation" | "language" | "whatsapp" | "smtp") => {
    setActiveTab(tab);
    router.replace(`/admin/settings?tab=${tab}`, { scroll: false });
  };

  const handleTestSmtp = async () => {
    const smtpValues = watch("emailSettings");
    if (!smtpValues?.smtpHost || !smtpValues?.smtpUser || !smtpValues?.smtpPassword) {
      setTestResult({ success: false, error: "Please enter your SMTP Host, Username and Password above." });
      return;
    }
    if (!testRecipient || !testRecipient.includes("@")) {
      setTestResult({ success: false, error: "Please enter a valid recipient email address for testing." });
      return;
    }

    setTestingSmtp(true);
    setTestResult(null);

    const res = await testSmtpConnectionAction({
      smtpHost: smtpValues.smtpHost,
      smtpPort: Number(smtpValues.smtpPort || 587),
      smtpUser: smtpValues.smtpUser,
      smtpPassword: smtpValues.smtpPassword,
      smtpSecure: Boolean(smtpValues.smtpSecure),
      fromEmail: smtpValues.fromEmail || smtpValues.smtpUser,
      testRecipient: testRecipient.trim(),
    });

    setTestingSmtp(false);
    setTestResult(res);
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setSavedSuccess(false);

    // Keep title in sync if store name changed
    if (data.name && (!data.seoDefaults?.title || data.seoDefaults.title === initialSettings?.name)) {
      data.seoDefaults.title = `${data.name} | Luxury Collection`;
    }

    // Parse WhatsApp quick prompts if string
    if (data.whatsappChatWidget && typeof data.whatsappChatWidget.quickPrompts === "string") {
      data.whatsappChatWidget.quickPrompts = data.whatsappChatWidget.quickPrompts
        .split(",")
        .map((p: string) => p.trim())
        .filter(Boolean);
    }

    const res = await updateSiteSettingsAction(data);
    setSaving(false);

    if (res.success) {
      if (data.currency) setCurrency(data.currency);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      alert("Failed to update settings: " + res.error);
    }
  };

  // Add navigation link
  const addHeaderLink = () => {
    setValue("headerLinks", [...headerLinksList, { label: "New Link", url: "/" }]);
  };

  const removeHeaderLink = (index: number) => {
    setValue(
      "headerLinks",
      headerLinksList.filter((_: any, i: number) => i !== index)
    );
  };

  const addFooterLink = () => {
    setValue("footerLinks", [...footerLinksList, { label: "New Link", url: "/" }]);
  };

  const removeFooterLink = (index: number) => {
    setValue(
      "footerLinks",
      footerLinksList.filter((_: any, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Settings Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-2">
          Store Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your store details, SEO default metadata, payments, WhatsApp live chat, and site navigation.
        </p>
      </div>

      {/* ─── RESPONSIVE TAB BAR (Mobile Touch-Scrollable) ─── */}
      <div className="border-b border-border">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-px snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch("general")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "general"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Store size={16} />
            <span>Store Info & Payments</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("whatsapp")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "whatsapp"
                ? "border-[#25D366] text-[#25D366] bg-[#25D366]/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FaWhatsapp size={16} />
            <span>WhatsApp Chat</span>
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("seo")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "seo"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Search size={16} />
            <span>SEO & Metadata</span>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("navigation")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "navigation"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Compass size={16} />
            <span>Navigation Links</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("language")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "language"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Languages size={16} />
            <span>Language & Theme</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("smtp")}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 snap-start shrink-0 cursor-pointer ${
              activeTab === "smtp"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Mail size={16} />
            <span>Email & SMTP</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-sm font-bold animate-in fade-in duration-300">
          <Check size={18} />
          Settings saved successfully! All storefront metadata and cache have been updated.
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ─── TAB 1: STORE DETAILS & PAYMENTS ─── */}
        {activeTab === "general" && (
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Basic Store Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Store size={20} className="text-primary" /> General Store Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Store Brand Name *
                  </label>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="Yaadgari Perfumes"
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Default Store Currency
                  </label>
                  <select
                    {...register("currency")}
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (Rs)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="QAR">QAR (ر.ق)</option>
                    <option value="KWD">KWD (د.ك)</option>
                    <option value="BHD">BHD (د.ب)</option>
                    <option value="OMR">OMR (ر.ع.)</option>
                    <option value="SGD">SGD ($)</option>
                    <option value="MYR">MYR (RM)</option>
                    <option value="NZD">NZD ($)</option>
                    <option value="CHF">CHF (CHF)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="EGP">EGP (E£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Support Email
                  </label>
                  <input
                    {...register("contact.email")}
                    type="email"
                    placeholder="support@yaadgari.com"
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Support Phone
                  </label>
                  <input
                    {...register("contact.phone")}
                    type="tel"
                    placeholder="+971 50 123 4567"
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Physical Address
                  </label>
                  <input
                    {...register("physicalAddress")}
                    type="text"
                    placeholder="Downtown Dubai, UAE"
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Branding Images */}
            <div className="space-y-6 border-t border-border pt-6">
              <h3 className="text-lg font-bold border-b border-border pb-2">Branding Assets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Store Logo
                  </label>
                  <ImageUploader
                    images={watch("logo") ? [watch("logo") as string] : []}
                    onChange={(urls) => {
                      setValue("logo", urls.length > 0 ? urls[urls.length - 1] : "");
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Transparent PNG image used in Header, Mobile Menu & Email Templates.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Browser Favicon
                  </label>
                  <ImageUploader
                    images={watch("favicon") ? [watch("favicon") as string] : []}
                    onChange={(urls) => {
                      setValue("favicon", urls.length > 0 ? urls[urls.length - 1] : "");
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Square icon (32x32) shown in browser tabs.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="space-y-6 border-t border-border pt-6">
              <h3 className="text-lg font-bold border-b border-border pb-2">Payment Gateway Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stripe */}
                <div className="p-5 border border-border rounded-2xl bg-card space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-primary" size={20} />
                        <span className="font-bold text-sm">Stripe Online Payments</span>
                      </div>
                      <Controller
                        name="paymentSettings.stripeEnabled"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch checked={field.value} onChange={field.onChange} />
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accept Visa, Mastercard, AMEX online. Requires STRIPE_SECRET_KEY in environment.
                    </p>
                  </div>
                </div>

                {/* COD */}
                <div className="p-5 border border-border rounded-2xl bg-card space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="text-emerald-600" size={20} />
                        <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                      </div>
                      <Controller
                        name="paymentSettings.codEnabled"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch checked={field.value} onChange={field.onChange} />
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Allow customers to pay in cash upon package delivery.
                    </p>
                  </div>
                </div>

                {/* Manual / Bank Transfer */}
                <div className="p-5 border border-border rounded-2xl bg-card space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Landmark className="text-amber-600" size={20} />
                        <span className="font-bold text-sm">Manual / Bank Transfer</span>
                      </div>
                      <Controller
                        name="paymentSettings.manualEnabled"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch checked={field.value} onChange={field.onChange} />
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accept bank transfers, EasyPaisa, JazzCash or custom manual payments.
                    </p>
                  </div>
                </div>

              </div>

              {/* Manual Payment Details & Instructions */}
              {watch("paymentSettings.manualEnabled") && (
                <div className="p-5 border border-amber-500/30 bg-amber-500/10 rounded-2xl space-y-4">
                  <h4 className="font-bold text-sm text-foreground">Manual Payment Details & Instructions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Method Title</label>
                      <input
                        {...register("paymentSettings.manualPaymentTitle")}
                        className="w-full border border-border rounded-lg p-2.5 text-xs font-semibold bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Bank Transfer / EasyPaisa / JazzCash"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bank / Account Details</label>
                      <textarea
                        {...register("paymentSettings.manualBankDetails")}
                        rows={3}
                        className="w-full border border-border rounded-lg p-2.5 text-xs bg-background focus:ring-2 focus:ring-primary outline-none font-mono"
                        placeholder="Account Title, Account #, IBAN, Bank Name..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Customer Instructions</label>
                      <textarea
                        {...register("paymentSettings.manualPaymentInstructions")}
                        rows={3}
                        className="w-full border border-border rounded-lg p-2.5 text-xs bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Steps for customer after transferring payment..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WooCommerce Integration Panel */}
              <div className="p-5 border border-purple-500/30 bg-purple-500/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-purple-600" size={20} />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">WooCommerce Payments & REST API Integration</h4>
                      <p className="text-xs text-muted-foreground">Connect your WooCommerce store URL, Consumer Key, and Secret for end-to-end checkout & webhook sync.</p>
                    </div>
                  </div>
                  <Controller
                    name="woocommerceConfig.enabled"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                {watch("woocommerceConfig.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">WooCommerce Store URL</label>
                      <input
                        {...register("woocommerceConfig.storeUrl")}
                        className="w-full border border-border rounded-lg p-2.5 text-xs font-semibold bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="https://yourwoocommerce.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Webhook Secret Key</label>
                      <input
                        {...register("woocommerceConfig.webhookSecret")}
                        className="w-full border border-border rounded-lg p-2.5 text-xs font-mono bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="wc_secret_..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Consumer Key (ck_...)</label>
                      <input
                        {...register("woocommerceConfig.consumerKey")}
                        className="w-full border border-border rounded-lg p-2.5 text-xs font-mono bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="ck_..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Consumer Secret (cs_...)</label>
                      <input
                        type="password"
                        {...register("woocommerceConfig.consumerSecret")}
                        className="w-full border border-border rounded-lg p-2.5 text-xs font-mono bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="cs_..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Delivery & Shipping Methods Options Configuration ─── */}
            <div className="space-y-6 border-t border-border pt-6">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="text-lg font-bold">Delivery & Shipping Options</h3>
                  <p className="text-xs text-muted-foreground">Configure delivery methods, delivery timeframes, and shipping charges for checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendShipping({ id: `ship-${Date.now()}`, name: "Custom Shipping", price: 15, timeframe: "2-4 Days", description: "Custom delivery method", enabled: true })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus size={14} /> Add Shipping Method
                </button>
              </div>

              {/* Free Delivery Threshold Configuration */}
              <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Free Delivery Threshold ({watch("currency") || "AED"})
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Orders with cart subtotal equal to or above this amount automatically receive Free Delivery.
                    <br />
                    <strong className="text-foreground">Set to 0 to disable free delivery</strong> so customers are always charged the shipping prices below.
                  </p>
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register("freeShippingThreshold", { valueAsNumber: true })}
                      placeholder="0 (Disabled)"
                      className="w-full border border-border rounded-xl p-2.5 text-xs font-bold font-mono bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-muted-foreground pointer-events-none">
                      {watch("currency") || "AED"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {shippingFields.map((field, idx) => (
                  <div key={field.id} className="p-4 border border-border rounded-2xl bg-card/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Method Name</label>
                      <input
                        {...register(`shippingMethods.${idx}.name` as const)}
                        placeholder="e.g. Express / Fast Delivery"
                        className="w-full border border-border rounded-lg p-2 text-xs font-bold bg-background focus:ring-2 focus:ring-primary outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Shipping Charge / Price</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`shippingMethods.${idx}.price` as const, { valueAsNumber: true })}
                        placeholder="0"
                        className="w-full border border-border rounded-lg p-2 text-xs font-bold bg-background focus:ring-2 focus:ring-primary outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Estimated Timeframe</label>
                      <input
                        {...register(`shippingMethods.${idx}.timeframe` as const)}
                        placeholder="e.g. 1 - 2 Business Days"
                        className="w-full border border-border rounded-lg p-2 text-xs bg-background focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                      <input
                        {...register(`shippingMethods.${idx}.description` as const)}
                        placeholder="Priority delivery"
                        className="w-full border border-border rounded-lg p-2 text-xs bg-background focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 sm:pt-0">
                      <Controller
                        name={`shippingMethods.${idx}.enabled` as const}
                        control={control}
                        render={({ field: f }) => (
                          <ToggleSwitch checked={f.value} onChange={f.onChange} />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => removeShipping(idx)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove Shipping Method"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB: WHATSAPP CHAT WIDGET CONFIGURATION ─── */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="glass-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
              
              {/* Header with Main Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center border border-[#25D366]/30 shrink-0">
                    <FaWhatsapp size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                      WhatsApp Live Chat Widget
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enable a floating WhatsApp support bubble and customizable instant chat dialog for your customers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-xl border border-border shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {watch("whatsappChatWidget.enabled") ? "Widget Enabled" : "Widget Disabled"}
                  </span>
                  <Controller
                    name="whatsappChatWidget.enabled"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              {/* Main Form Fields & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Form Column */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Phone & Status Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                        WhatsApp Number *
                      </label>
                      <input
                        {...register("whatsappChatWidget.phoneNumber")}
                        type="text"
                        placeholder="923001234567 or +92 300 1234567"
                        className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs sm:text-sm font-semibold"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Include country code without special characters.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                        Online Status Subtitle
                      </label>
                      <input
                        {...register("whatsappChatWidget.onlineStatusText")}
                        type="text"
                        placeholder="Typically replies in minutes"
                        className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs sm:text-sm font-semibold"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Displayed under the store name in the chat header.
                      </p>
                    </div>
                  </div>

                  {/* Position & Notification Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                        Screen Position
                      </label>
                      <select
                        {...register("whatsappChatWidget.position")}
                        className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs sm:text-sm font-semibold"
                      >
                        <option value="bottom-right">Bottom Right (Standard)</option>
                        <option value="bottom-left">Bottom Left</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-between">
                      <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                        Notification Badge
                      </label>
                      <div className="flex items-center justify-between p-2.5 border border-border rounded-xl bg-background">
                        <span className="text-xs text-muted-foreground font-medium">Show &apos;1&apos; Unread Badge</span>
                        <Controller
                          name="whatsappChatWidget.showNotificationBadge"
                          control={control}
                          render={({ field }) => (
                            <ToggleSwitch checked={field.value} onChange={field.onChange} />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Greeting Bubble Customization */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Welcome Greeting Message
                    </h3>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Greeting Title / Header
                      </label>
                      <input
                        {...register("whatsappChatWidget.greetingTitle")}
                        type="text"
                        placeholder="Hello! 👋 Welcome to our store."
                        className="w-full border border-border rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Greeting Subtitle / Helper
                      </label>
                      <textarea
                        {...register("whatsappChatWidget.greetingMessage")}
                        rows={2}
                        placeholder="How can we help you today? Let us know what you need or pick an option below."
                        className="w-full border border-border rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Quick Suggestions Chips */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold">
                      Quick Action Suggestion Prompts
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Separate each prompt with a comma. Customers can click these chips to instantly send common questions.
                    </p>
                    <textarea
                      {...register("whatsappChatWidget.quickPrompts")}
                      rows={2}
                      placeholder="📦 Track My Order, 💎 Scent Advice, 🚚 Delivery & COD"
                      className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-[#25D366] outline-none text-xs font-medium"
                    />
                  </div>

                </div>

                {/* Right Column: Live Mock Preview */}
                <div className="lg:col-span-5 bg-muted/20 border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#25D366]" /> Live Widget Preview
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366]">
                      Active
                    </span>
                  </div>

                  {/* Preview WhatsApp Box */}
                  <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden max-w-sm mx-auto">
                    {/* Header */}
                    <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                            <FaWhatsapp size={18} className="text-white" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border border-[#075E54] rounded-full" />
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight text-white">
                            {watchedName || "Store Support"}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {watch("whatsappChatWidget.onlineStatusText") || "Typically replies in minutes"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 bg-muted/40 space-y-2.5 min-h-[160px] flex flex-col justify-end">
                      <div className="bg-background text-foreground p-3 rounded-xl rounded-tl-xs shadow-2xs border border-border/40 text-xs">
                        <p className="font-semibold text-foreground">
                          {watch("whatsappChatWidget.greetingTitle") || `Hello! 👋 Welcome to ${watchedName || "our store"}.`}
                        </p>
                        <p className="text-muted-foreground mt-1 text-[11px]">
                          {watch("whatsappChatWidget.greetingMessage") || "How can we help you today? Let us know what you need or pick an option below."}
                        </p>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1">
                        {(typeof watch("whatsappChatWidget.quickPrompts") === "string" 
                          ? watch("whatsappChatWidget.quickPrompts").split(",") 
                          : ["📦 Track My Order", "💎 Scent Advice"]
                        ).map((p: string, i: number) => p.trim() && (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-background border border-border text-foreground/80 font-medium">
                            {p.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mock Input */}
                    <div className="p-2.5 bg-background border-t border-border flex items-center gap-2">
                      <div className="flex-1 px-3 py-1.5 bg-muted/60 border border-border rounded-lg text-[11px] text-muted-foreground">
                        Type your message on WhatsApp...
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                        <FaWhatsapp size={14} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-muted-foreground">
                    Click &apos;Save Settings & Metadata&apos; below to apply your live WhatsApp configuration across the storefront.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ─── TAB 2: SEO & METADATA ─── */}
        {activeTab === "seo" && (
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Search size={20} className="text-primary" /> Global SEO & Metadata Defaults
              </h2>
              <p className="text-xs text-muted-foreground mt-2">
                These defaults are served across your storefront whenever a product or page metadata is not explicitly defined.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                  Default Title Tag <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("seoDefaults.title", { required: true })}
                  placeholder="e.g. Yaadgari Perfumes | Luxury Fragrances"
                  className="w-full border border-border rounded-xl p-3.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-semibold"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Recommended: 50-60 characters ({watchedTitle?.length || 0} chars)
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                  Default Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("seoDefaults.description", { required: true })}
                  placeholder="Discover the essence of sophistication with Yaadgari Perfumes — luxury scents crafted for perfection."
                  className="w-full border border-border rounded-xl p-3.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm h-32 leading-relaxed"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Recommended: 140-160 characters ({watchedDescription?.length || 0} chars)
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                  Meta Keywords (Comma Separated)
                </label>
                <input
                  {...register("seoDefaults.keywords")}
                  placeholder="perfumes, luxury scents, attar, oud, fragrance"
                  className="w-full border border-border rounded-xl p-3.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-2">
                  Default Social Share Image (OG Image)
                </label>
                <ImageUploader
                  images={watchedOgImage ? [watchedOgImage] : []}
                  onChange={(urls) => {
                    setValue("seoDefaults.ogImage", urls.length > 0 ? urls[urls.length - 1] : "");
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended resolution: 1200 x 630 pixels. Appears when sharing store links on WhatsApp, Facebook, or Twitter.
                </p>
              </div>

              {/* Live Google Search Preview */}
              <div className="pt-6 border-t border-border">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  <Search size={14} /> Google Search SERP Preview
                </label>
                <LiveSerpPreview
                  title={watchedTitle}
                  description={watchedDescription}
                  url={`https://yourstore.com`}
                />
              </div>

              {/* Live Social Share Card Preview */}
              <div className="pt-6 border-t border-border">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  <Share2 size={14} /> Social Share Preview (WhatsApp / Facebook)
                </label>
                <div className="max-w-lg border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                  <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
                    {watchedOgImage ? (
                      <img src={watchedOgImage} alt="OG Social Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs uppercase">
                        No Social Image Uploaded
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">YOURSTORE.COM</p>
                    <p className="font-bold text-sm text-foreground line-clamp-1">{watchedTitle || watchedName || "Store Name"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{watchedDescription || "Store description..."}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── ANALYTICS & TRACKING INTEGRATIONS ─── */}
            <div className="space-y-6 border-t border-border pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                    Analytics & Tracking Integrations
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Connect Google Search Console, Meta Pixel (Facebook), and Google Analytics directly from here — no code changes required.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Google Search Console */}
                <div className="p-5 border border-blue-500/30 bg-blue-500/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Radio className="text-blue-600" size={18} />
                    <h3 className="font-bold text-sm text-foreground">Google Search Console Verification</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste your verification code or the full <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code> tag.
                  </p>
                  <input
                    {...register("integrations.googleSearchConsoleTag")}
                    type="text"
                    placeholder='e.g. abc123xyz or <meta name="google-site-verification" content="abc123xyz" />'
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Pixel */}
                  <div className="p-5 border border-indigo-500/30 bg-indigo-500/5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <h3 className="font-bold text-sm text-foreground">Meta Pixel (Facebook)</h3>
                    </div>
                    <input
                      {...register("integrations.metaPixelId")}
                      type="text"
                      placeholder="e.g. 123456789012345"
                      className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">Tracks PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, and Purchase events automatically.</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">PageView ✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">ViewContent ✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">AddToCart ✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">InitiateCheckout ✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">AddPaymentInfo ✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">Purchase ✓</span>
                    </div>
                  </div>

                  {/* Google Analytics GA4 */}
                  <div className="p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.84 2.9v18.2c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9V2.9c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9zM14.4 8.5v12.6c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9V8.5c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9zM5.96 14.1v7c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9v-7c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9z" />
                      </svg>
                      <h3 className="font-bold text-sm text-foreground">Google Analytics (GA4)</h3>
                    </div>
                    <input
                      {...register("integrations.googleAnalyticsId")}
                      type="text"
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">Tracks visitor metrics, page performance, and user engagement.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 3: NAVIGATION LINKS ─── */}
        {activeTab === "navigation" && (
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Compass size={20} className="text-primary" /> Storefront Navigation Menus
              </h2>
              <p className="text-xs text-muted-foreground mt-2">
                Manage header and footer navigation links displayed to shoppers.
              </p>
            </div>

            {/* Header Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Header Links</h3>
                <button
                  type="button"
                  onClick={addHeaderLink}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              <div className="space-y-3">
                {headerLinksList.map((link: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                    <input
                      type="text"
                      placeholder="Label (e.g. Perfumes)"
                      value={link.label || ""}
                      onChange={(e) => {
                        const updated = [...headerLinksList];
                        updated[index] = { ...updated[index], label: e.target.value };
                        setValue("headerLinks", updated);
                      }}
                      className="flex-1 border border-border bg-background rounded-lg p-2 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. /all or /perfumes)"
                      value={link.url || ""}
                      onChange={(e) => {
                        const updated = [...headerLinksList];
                        updated[index] = { ...updated[index], url: e.target.value };
                        setValue("headerLinks", updated);
                      }}
                      className="flex-1 border border-border bg-background rounded-lg p-2 text-xs font-mono"
                    />
                    <select
                      value={link.icon || "auto"}
                      onChange={(e) => {
                        const updated = [...headerLinksList];
                        updated[index] = { ...updated[index], icon: e.target.value };
                        setValue("headerLinks", updated);
                      }}
                      className="w-32 border border-border bg-background rounded-lg p-2 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="auto">Auto (Detect)</option>
                      <option value="home">🏠 Home</option>
                      <option value="info">ℹ️ Info</option>
                      <option value="phone">📞 Phone</option>
                      <option value="mail">✉️ Mail</option>
                      <option value="shopping-bag">🛍️ Bag</option>
                      <option value="shopping-cart">🛒 Cart</option>
                      <option value="user">👤 User</option>
                      <option value="heart">❤️ Heart</option>
                      <option value="sparkles">✨ Sparkles</option>
                      <option value="star">⭐ Star</option>
                      <option value="tag">🏷️ Tag</option>
                      <option value="box">📦 Box</option>
                      <option value="chevron-right">➡️ Arrow</option>
                      <option value="hash">#️⃣ Hash</option>
                      <option value="settings">⚙️ Settings</option>
                      <option value="message-circle">💬 Message</option>
                      <option value="map-pin">📍 Map Pin</option>
                      <option value="calendar">📅 Calendar</option>
                      <option value="camera">📷 Camera</option>
                      <option value="video">🎥 Video</option>
                      <option value="music">🎵 Music</option>
                      <option value="book">📖 Book</option>
                      <option value="file-text">📄 File</option>
                      <option value="check-circle">✅ Check</option>
                      <option value="alert-circle">⚠️ Alert</option>
                      <option value="gift">🎁 Gift</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeHeaderLink(index)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Footer Quick Links</h3>
                <button
                  type="button"
                  onClick={addFooterLink}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              <div className="space-y-3">
                {footerLinksList.map((link: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                    <input
                      type="text"
                      placeholder="Label (e.g. Track Order)"
                      value={link.label || ""}
                      onChange={(e) => {
                        const updated = [...footerLinksList];
                        updated[index] = { ...updated[index], label: e.target.value };
                        setValue("footerLinks", updated);
                      }}
                      className="flex-1 border border-border bg-background rounded-lg p-2 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. /track-order)"
                      value={link.url || ""}
                      onChange={(e) => {
                        const updated = [...footerLinksList];
                        updated[index] = { ...updated[index], url: e.target.value };
                        setValue("footerLinks", updated);
                      }}
                      className="flex-1 border border-border bg-background rounded-lg p-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeFooterLink(index)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: LANGUAGE & THEME PREFERENCES ─── */}
        {activeTab === "language" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="glass-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Languages size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Language & Direction Settings</h3>
                  <p className="text-xs text-muted-foreground">Select default language and layout direction (English LTR or Arabic RTL)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Store Active Language
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        language === "en"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="text-base font-bold">English (LTR)</span>
                      <span className="text-xs opacity-75">Left-to-Right layout</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("ar")}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        language === "ar"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="text-base font-bold">العربية (RTL)</span>
                      <span className="text-xs opacity-75">Right-to-Left layout</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Admin / Store Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        theme === "light"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Sun size={20} />
                      <span className="text-sm font-bold">Light Theme</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        theme === "dark"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Moon size={20} />
                      <span className="text-sm font-bold">Dark Theme</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: EMAIL & SMTP SETTINGS ─── */}
        {activeTab === "smtp" && (
          <div className="space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                    <Mail size={22} className="text-primary" /> Email & SMTP Configuration
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure your outgoing email server (Gmail, Outlook, SendGrid, Amazon SES, or custom SMTP) to send transactional order confirmations, tracking alerts, and admin notifications.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck size={14} /> TLS / SSL Secured
                </div>
              </div>

              {/* SMTP Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    SMTP Server Host *
                  </label>
                  <input
                    type="text"
                    {...register("emailSettings.smtpHost")}
                    placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    For Gmail, use <code className="bg-muted px-1.5 py-0.5 rounded">smtp.gmail.com</code>. For Outlook, use <code className="bg-muted px-1.5 py-0.5 rounded">smtp.office365.com</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    {...register("emailSettings.smtpPort", { valueAsNumber: true })}
                    placeholder="587 or 465"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Typically <code className="bg-muted px-1.5 py-0.5 rounded">587</code> for TLS / STARTTLS or <code className="bg-muted px-1.5 py-0.5 rounded">465</code> for SSL.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    SMTP Username / Email *
                  </label>
                  <input
                    type="text"
                    {...register("emailSettings.smtpUser")}
                    placeholder="orders@yourdomain.com or user@gmail.com"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    SMTP Password / App Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("emailSettings.smtpPassword")}
                      placeholder="••••••••••••••••"
                      className="w-full border border-border bg-card rounded-xl p-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    For Gmail, generate a 16-character Google App Password (not your personal account password).
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Sender From Name
                  </label>
                  <input
                    type="text"
                    {...register("emailSettings.fromName")}
                    placeholder="e.g. Sqodex Storefront or Yaadgari Perfumes"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Sender From Email Address
                  </label>
                  <input
                    type="email"
                    {...register("emailSettings.fromEmail")}
                    placeholder="e.g. orders@sqodex.com"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Admin Notification Email (New Orders Alert) *
                  </label>
                  <input
                    type="email"
                    {...register("emailSettings.adminNotificationEmail")}
                    placeholder="e.g. bgpharma@sqodex.com or owner@yourdomain.com"
                    className="w-full border border-border bg-card rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Every new order placed by a customer (COD, Stripe, Bank Transfer) will send an instant alert email with complete order breakdown and items to this address.
                  </p>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Require Secure Connection (SSL/TLS)</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Enable if using Port 465 (SSL) or if your SMTP server mandates implicit SSL.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="emailSettings.smtpSecure"
                    render={({ field }) => (
                      <ToggleSwitch checked={Boolean(field.value)} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              {/* ─── INTERACTIVE TEST CONNECTION ─── */}
              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Send size={16} className="text-primary" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold">
                    Test SMTP Mailer Connection
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send a live test email using the credentials above to verify that your mail server communicates properly.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Enter recipient email (e.g. your email)"
                    className="flex-1 border border-border bg-background rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                  <button
                    type="button"
                    disabled={testingSmtp}
                    onClick={handleTestSmtp}
                    className="px-6 py-3 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                  >
                    {testingSmtp ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Testing Connection...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Send Test Email
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono border ${
                      testResult.success
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                    }`}
                  >
                    {testResult.success ? `✓ ${testResult.message}` : `⚠ ${testResult.error}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating / Sticky Save Footer */}
        <div className="sticky bottom-4 glass-card border border-border p-4 rounded-2xl shadow-xl flex items-center justify-between z-30 bg-background/90 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            Unsaved changes will apply globally to storefront metadata.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? "Saving All Settings..." : "Save Settings & Metadata"}
          </button>
        </div>

      </form>
    </div>
  );
}

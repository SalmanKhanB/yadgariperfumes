import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShippingMethod {
  id: string;
  name: string;
  price: number;
  timeframe?: string;
  description?: string;
  enabled: boolean;
}

export interface ISiteSettings extends Document {
  name: string;
  logo?: string;
  favicon?: string;
  themeColors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
    background: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
  physicalAddress?: string;
  businessHours?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  woocommerceConfig?: {
    enabled?: boolean;
    storeUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    webhookSecret?: string;
  };
  whatsappChatWidget?: {
    enabled?: boolean;
    phoneNumber?: string;
    greetingTitle?: string;
    greetingMessage?: string;
    onlineStatusText?: string;
    position?: "bottom-right" | "bottom-left";
    showNotificationBadge?: boolean;
    quickPrompts?: string[];
  };
  announcementBar?: {
    enabled?: boolean;
    text?: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
    badgeText?: string;
  };
  buttonStyle?: {
    variant?: string;
    shadow?: string;
    border?: string;
  };
  customCss?: string;
  seoDefaults: {
    title: string;
    description: string;
    ogImage?: string;
  };
  logoAlignment?: "left" | "center";
  showLogo?: boolean;
  showStoreName?: boolean;
  headerStyle?: {
    layout?: string;
    backgroundColor?: string;
    textColor?: string;
    activeColor?: string;
    showLogo?: boolean;
    showStoreName?: boolean;
  };

  headerLinks?: { label: string; url: string; icon?: string }[];

  footerLinks?: { label: string; url: string }[];
  footerCopyright?: string;
  footerStyle?: {
    layout?: string;
    copyrightText?: string;
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    showNewsletter?: boolean;
    newsletterHeading?: string;
    newsletterSubtitle?: string;
    showBrand?: boolean;
    showLinks?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showSocials?: boolean;
    showInstagram?: boolean;
    showWhatsapp?: boolean;
    showTiktok?: boolean;
    showFacebook?: boolean;
    showTwitter?: boolean;
    showYoutube?: boolean;
    showCopyright?: boolean;
    showPaymentBadges?: boolean;
  };
  footerWidgets?: {
    title: string;
    links: { label: string; url: string }[];
  }[];

  activeTheme: "cyber" | "swiss" | "organic" | "aurora";
  themeConfigurations?: {
    aurora?: { glowColor1?: string; glowColor2?: string; animationSpeed?: string };
    cyberpunk?: { primaryNeon?: string; secondaryNeon?: string; glitchIntensity?: string };
    swiss?: { borderRadius?: string; shadowIntensity?: string };
    organic?: { primaryEarth?: string; leafPatternOpacity?: string };
  };
  storefrontLayout?: {
    productGridColumns?: "2" | "3" | "4" | "5";
    productCardStyle?: "standard" | "minimal" | "glass" | "bordered";
    productPageLayout?: "standard" | "split";
    sectionOrder?: string[];
    hiddenSections?: string[];
    showSoldOutBadge?: boolean;
    pageLayouts?: Record<string, {
      sectionOrder?: string[];
      hiddenSections?: string[];
      blockProps?: Record<string, any>;
    }>;
  };
  typography?: {
    headingsFont?: string;
    bodyFont?: string;
    headingsFontFamily?: string;
    bodyFontFamily?: string;
    importUrl?: string;
    headingsSizeScale?: string;
    bodySize?: string;
    lineHeight?: string;
    fontWeight?: string;
  };
  heroConfig?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    titleSize?: string;
    align?: string;
    bgImage?: string;
    overlayOpacity?: string;
    slides?: Array<{
      _id: string;
      title: string;
      subtitle?: string;
      link?: string;
      buttonText?: string;
      bannerImage?: string;
      bannerVideo?: string;
    }>;
  };
  borderRadius?: string;
  bestProductsSection?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    limit?: number;
    backgroundColor?: string;
    textColor?: string;
    headingSize?: string;
  };
  featuredProductsSection2?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    limit?: number;
    backgroundColor?: string;
    textColor?: string;
    category?: string;
  };
  featuredProductsSection3?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    limit?: number;
    backgroundColor?: string;
    textColor?: string;
    category?: string;
  };
  featuredCategoriesSection?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    limit?: number;
    backgroundColor?: string;
    textColor?: string;
  };
  celebrityReviewsSection?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  testimonialsSection?: {
    theme?: string;
    heading?: string;
    subheading?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  relatedProductsSection?: {
    enabled?: boolean;
    heading?: string;
    subheading?: string;
    limit?: number;
    backgroundColor?: string;
    textColor?: string;
  };
  currency?: string;
  freeShippingThreshold?: number;
  paymentSettings?: {
    stripeEnabled?: boolean;
    codEnabled?: boolean;
    codMinOrder?: number;
    codMaxOrder?: number;
    manualEnabled?: boolean;
    manualPaymentTitle?: string;
    manualPaymentInstructions?: string;
    manualBankDetails?: string;
  };
  shippingMethods?: IShippingMethod[];
  deliverySettings?: any;
  paymentBadgesSection?: any;
  integrations?: {
    googleSearchConsoleTag?: string;
    googleAnalyticsId?: string;
    metaPixelId?: string;
  };
  emailSettings?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpSecure?: boolean;
    fromEmail?: string;
    fromName?: string;
    adminNotificationEmail?: string;
  };
}

const SiteSettingsSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    favicon: { type: String },
    currency: { type: String, default: "USD" },
    freeShippingThreshold: { type: Number, default: 0 },
    deliverySettings: { type: Schema.Types.Mixed },
    paymentSettings: {
      stripeEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
      codMinOrder: { type: Number, default: 0 },
      codMaxOrder: { type: Number, default: 0 },
      manualEnabled: { type: Boolean, default: true },
      manualPaymentTitle: { type: String, default: "Bank Transfer / EasyPaisa / JazzCash" },
      manualPaymentInstructions: { type: String, default: "Please transfer the total amount to Account # 123456789 and enter your TRX reference ID." },
      manualBankDetails: { type: String, default: "Account Title: Yaadgari Perfumes\nAccount #: 1234567890\nBank / Provider: EasyPaisa / JazzCash / Bank Alfalah" }
    },
    shippingMethods: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number, default: 0 },
          timeframe: { type: String, default: "" },
          description: { type: String, default: "" },
          enabled: { type: Boolean, default: true }
        }
      ],
      default: [
        { id: "standard", name: "Standard Shipping", price: 0, timeframe: "3 - 5 Business Days", description: "Standard tracked home delivery", enabled: true },
        { id: "express", name: "Express / Fast Delivery", price: 25, timeframe: "1 - 2 Business Days", description: "Priority expedited express shipping", enabled: true }
      ]
    },
    themeColors: {
      primary: { type: String, default: "#141210" },
      secondary: { type: String, default: "#F4F1EA" },
      text: { type: String, default: "#141210" },
      accent: { type: String, default: "#C5A880" },
      background: { type: String, default: "#ffffff" },
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String },
    },
    physicalAddress: { type: String },
    businessHours: { type: String },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      youtube: { type: String },
      whatsapp: { type: String },
    },
    whatsappChatWidget: {
      enabled: { type: Boolean, default: true },
      phoneNumber: { type: String, default: "" },
      greetingTitle: { type: String, default: "" },
      greetingMessage: { type: String, default: "" },
      onlineStatusText: { type: String, default: "Typically replies in minutes" },
      position: { type: String, enum: ["bottom-right", "bottom-left"], default: "bottom-right" },
      showNotificationBadge: { type: Boolean, default: true },
      quickPrompts: [{ type: String }],
    },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: "🚀 Free Worldwide Shipping on Orders Over $100! Use code FREESHIP at checkout." },
      link: { type: String, default: "/all" },
      backgroundColor: { type: String, default: "#141210" },
      textColor: { type: String, default: "#ffffff" },
      badgeText: { type: String, default: "PROMO" }
    },
    buttonStyle: {
      variant: { type: String, default: "solid" },
      shadow: { type: String, default: "medium" },
      border: { type: String, default: "none" }
    },
    customCss: { type: String, default: "" },
    seoDefaults: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      ogImage: { type: String },
    },
    woocommerceConfig: {
      enabled: { type: Boolean, default: false },
      storeUrl: { type: String, default: "" },
      consumerKey: { type: String, default: "" },
      consumerSecret: { type: String, default: "" },
      webhookSecret: { type: String, default: "" },
    },
    logoAlignment: { type: String, enum: ["left", "center"], default: "left" },
    showLogo: { type: Boolean, default: false },
    showStoreName: { type: Boolean, default: true },
    headerStyle: {
      layout: { type: String },
      backgroundColor: { type: String },
      textColor: { type: String },
      activeColor: { type: String },
      showLogo: { type: Boolean, default: false },
      showStoreName: { type: Boolean, default: true },
    },
    headerLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String },
      },
    ],

    footerLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    footerCopyright: { type: String, default: "" },
    footerStyle: {
      layout: { type: String, default: "ecommerce-pro" },
      copyrightText: { type: String, default: "" },
      backgroundColor: { type: String },
      textColor: { type: String },
      headingColor: { type: String },
      showNewsletter: { type: Boolean, default: true },
      newsletterHeading: { type: String, default: "Newsletter" },
      newsletterSubtitle: { type: String, default: "" },
      showBrand: { type: Boolean, default: true },
      showLinks: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: true },
      showAddress: { type: Boolean, default: true },
      showSocials: { type: Boolean, default: true },
      showInstagram: { type: Boolean, default: true },
      showWhatsapp: { type: Boolean, default: true },
      showTiktok: { type: Boolean, default: true },
      showFacebook: { type: Boolean, default: true },
      showTwitter: { type: Boolean, default: true },
      showYoutube: { type: Boolean, default: true },
      showCopyright: { type: Boolean, default: true },
      showPaymentBadges: { type: Boolean, default: true },
    },
    footerWidgets: [
      {
        title: { type: String, required: true },
        links: [
          {
            label: { type: String, required: true },
            url: { type: String, required: true },
          },
        ],
      },
    ],

    activeTheme: {
      type: String,
      default: "aurora",
    },
    themeConfigurations: {
      aurora: {
        glowColor1: { type: String, default: "#3b82f6" },
        glowColor2: { type: String, default: "#8b5cf6" },
        animationSpeed: { type: String, default: "normal" }
      },
      cyberpunk: {
        primaryNeon: { type: String, default: "#0f0" },
        secondaryNeon: { type: String, default: "#f0f" },
        glitchIntensity: { type: String, default: "medium" }
      },
      swiss: {
        borderRadius: { type: String, default: "0px" },
        shadowIntensity: { type: String, default: "light" }
      },
      organic: {
        primaryEarth: { type: String, default: "#4ade80" },
        leafPatternOpacity: { type: String, default: "0.1" }
      }
    },
    storefrontLayout: {
      productGridColumns: { type: String, enum: ["2", "3", "4", "5"], default: "4" },
      productCardStyle: { type: String, enum: ["standard", "minimal", "glass", "bordered"], default: "standard" },
      productPageLayout: { type: String, enum: ["standard", "split"], default: "standard" },
      sectionOrder: { type: [String], default: ["hero", "badges", "categories", "best-products", "customize-1", "customize-2", "testimonials", "celebrity-reviews", "custom-html"] },
      hiddenSections: { type: [String], default: [] },
      showSoldOutBadge: { type: Boolean, default: true },
      pageLayouts: { type: Map, of: Object, default: {} },
    },
    typography: {
      headingsFont: { type: String, default: "Inter" },
      bodyFont: { type: String, default: "Inter" },
      headingsFontFamily: { type: String, default: "var(--font-geist-sans)" },
      bodyFontFamily: { type: String, default: "var(--font-geist-sans)" },
      importUrl: { type: String, default: "" },
      headingsSizeScale: { type: String, default: "1.0" },
      bodySize: { type: String, default: "16px" },
      lineHeight: { type: String, default: "normal" },
      fontWeight: { type: String, default: "normal" }
    },
    heroConfig: {
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      ctaText: { type: String, default: "" },
      ctaLink: { type: String, default: "" },
      secondaryCtaText: { type: String, default: "" },
      secondaryCtaLink: { type: String, default: "" },
      titleSize: { type: String, default: "text-6xl md:text-8xl" },
      align: { type: String, default: "center" },
      bgImage: { type: String, default: "" },
      overlayOpacity: { type: String, default: "0.5" },
      slides: {
        type: [
          {
            _id: { type: String },
            title: { type: String, default: "" },
            subtitle: { type: String, default: "" },
            link: { type: String, default: "" },
            buttonText: { type: String, default: "View more" },
            bannerImage: { type: String, default: "" },
            bannerVideo: { type: String, default: "" }
          }
        ],
        default: []
      }
    },
    borderRadius: { type: String, default: "16px" },
    bestProductsSection: {
      theme: { type: String, default: "aurora" },
      heading: { type: String, default: "Featured Products" },
      subheading: { type: String, default: "Hand-selected pieces that represent the pinnacle of our collection." },
      limit: { type: Number, default: 8 },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      headingSize: { type: String, default: "text-4xl md:text-5xl" },
    },
    featuredProductsSection2: {
      theme: { type: String, default: "glassmorphism" },
      heading: { type: String, default: "Customize" },
      subheading: { type: String, default: "Our most popular picks this week." },
      limit: { type: Number, default: 8 },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      category: { type: String, default: "" },
    },
    featuredProductsSection3: {
      theme: { type: String, default: "minimalist" },
      heading: { type: String, default: "Customize" },
      subheading: { type: String, default: "Fresh drops you don't want to miss." },
      limit: { type: Number, default: 8 },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      category: { type: String, default: "" },
    },
    featuredCategoriesSection: {
      theme: { type: String, default: "glassmorphism" },
      heading: { type: String, default: "Shop by Category" },
      subheading: { type: String, default: "Find exactly what you need." },
      limit: { type: Number, default: 6 },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
    },
    celebrityReviewsSection: {
      theme: { type: String, default: "glassmorphism" },
      heading: { type: String, default: "Reviews by Celebrities" },
      subheading: { type: String, default: "See what the biggest names are saying about our exclusive collection." },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
    },
    testimonialsSection: {
      theme: { type: String, default: "glassmorphism" },
      heading: { type: String },
      subheading: { type: String },
      backgroundColor: { type: String },
      textColor: { type: String },
    },
    relatedProductsSection: {
      enabled: { type: Boolean, default: true },
      heading: { type: String, default: "Related Products" },
      subheading: { type: String, default: "You might also like" },
      limit: { type: Number, default: 4 },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
    },
    paymentBadgesSection: {
      enabled: { type: Boolean, default: true },
      position: { type: String, enum: ["footer", "banner", "both", "hidden"], default: "footer" },
      heading: { type: String, default: "Accepted Payment Methods" },
      subheading: { type: String, default: "Safe, instant & 100% encrypted checkout options" },
      showCOD: { type: Boolean, default: true },
      showCard: { type: Boolean, default: true },
      showGPay: { type: Boolean, default: true },
      showApplePay: { type: Boolean, default: true },
      showManual: { type: Boolean, default: true },
    },
    integrations: {
      googleSearchConsoleTag: { type: String, default: "" },
      googleAnalyticsId: { type: String, default: "" },
      metaPixelId: { type: String, default: "" },
    },
    emailSettings: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
      smtpSecure: { type: Boolean, default: false },
      fromEmail: { type: String, default: "" },
      fromName: { type: String, default: "" },
      adminNotificationEmail: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Prevent Mongoose from caching the old schema in Next.js development HMR
if (mongoose.models.SiteSettings) {
  delete mongoose.models.SiteSettings;
}

const SiteSettings: Model<ISiteSettings> = mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

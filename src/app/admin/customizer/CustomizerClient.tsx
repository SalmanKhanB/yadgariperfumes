"use client";

import { useState, useEffect, useRef } from "react";
import { updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { createThemePresetAction } from "@/server/actions/themePresetActions";
import { createCustomSectionAction, updateCustomSectionAction, deleteCustomSectionAction } from "@/server/actions/customSectionActions";
import { createPageAction, updatePageAction, deletePageAction } from "@/server/actions/pageActions";
import { uploadImageAction, uploadVideoAction } from "@/server/actions/uploadActions";
import { ISiteSettings } from "@/server/db/models/SiteSettings";
import { BlockBuilder } from "@/components/admin/cms/BlockBuilder";
import {
  Save,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Layers,
  PlusCircle,
  FolderPlus,
  Sparkles,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  MousePointer,
  Code,
  Image as ImageIcon,
  ShieldCheck,
  Grid,
  ShoppingBag,
  MessageSquare,
  Video,
  GripHorizontal,
  PanelLeft,
  PanelRight,
  Move,
  Search,
  Megaphone,
  Type,
  Box,
  Download,
  Upload,
  Wand2,
  SlidersHorizontal,
  Globe,
  Check,
  X,
  Undo2,
  Redo2,
  Copy,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  GripVertical,
  Wrench,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Mail,
  Phone,
  MapPin,
  Share2,
  AtSign
} from "lucide-react";

interface Props {
  initialSettings: ISiteSettings;
  initialPresets: any[];
  categories: any[];
  pages?: any[];
  customSections?: any[];
}

const FONT_PAIRS = [
  {
    name: "Modern Sans (Inter)",
    id: "modern-sans",
    headingsFont: "Inter",
    bodyFont: "Inter",
    headingsFontFamily: "'Inter', sans-serif",
    bodyFontFamily: "'Inter', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap"
  },
  {
    name: "Editorial Serif (Playfair)",
    id: "editorial-serif",
    headingsFont: "Playfair Display",
    bodyFont: "Inter",
    headingsFontFamily: "'Playfair Display', serif",
    bodyFontFamily: "'Inter', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap"
  },
  {
    name: "Sleek Elegant (Outfit / Plus Jakarta)",
    id: "sleek-elegant",
    headingsFont: "Outfit",
    bodyFont: "Plus Jakarta Sans",
    headingsFontFamily: "'Outfit', sans-serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap"
  },
  {
    name: "Techno / Cyber (Syne / JetBrains)",
    id: "techno-cyber",
    headingsFont: "Syne",
    bodyFont: "JetBrains Mono",
    headingsFontFamily: "'Syne', sans-serif",
    bodyFontFamily: "'JetBrains Mono', monospace",
    importUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap"
  },
  {
    name: "Classic Luxury (Cormorant / Montserrat)",
    id: "classic-luxury",
    headingsFont: "Cormorant Garamond",
    bodyFont: "Montserrat",
    headingsFontFamily: "'Cormorant Garamond', serif",
    bodyFontFamily: "'Montserrat', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,400&family=Montserrat:wght@400;500;600;700&display=swap"
  },
  {
    name: "Futuristic Modern (Space Grotesk)",
    id: "space-grotesk",
    headingsFont: "Space Grotesk",
    bodyFont: "Inter",
    headingsFontFamily: "'Space Grotesk', sans-serif",
    bodyFontFamily: "'Inter', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
  }
];

const RADIUS_OPTIONS = [
  { name: "Sharp Swiss (0px)", value: "0px" },
  { name: "Sleek Compact (4px)", value: "4px" },
  { name: "Neutral Standard (8px)", value: "8px" },
  { name: "Modern Soft (16px)", value: "16px" },
  { name: "Hyper Round (24px)", value: "24px" },
  { name: "Pill Capsule (9999px)", value: "9999px" }
];

const PRESET_THEMES = [
  { name: "aurora", label: "Aurora Lights" },
  { name: "cyberpunk", label: "Cyberpunk Glow" },
  { name: "glassmorphism", label: "Frost Glassmorphism" },
  { name: "minimalist", label: "Bold Minimalist" },
  { name: "editorial", label: "Classic Editorial" },
  { name: "grid-matrix", label: "System Matrix" }
];

const BUTTON_VARIANTS = [
  { name: "Solid Fill", value: "solid" },
  { name: "Outline Border", value: "outline" },
  { name: "Frosted Glass", value: "glass" },
  { name: "Soft Tint", value: "soft" },
  { name: "Neon Glow", value: "neon" }
];

const SHADOW_OPTIONS = [
  { name: "None (Flat)", value: "none" },
  { name: "Subtle Soft", value: "soft" },
  { name: "Medium Elevated", value: "medium" },
  { name: "Deep Shadow", value: "deep" },
  { name: "Glow Effect", value: "glow" }
];


type DockMode = "left" | "right" | "floating" | "hidden";
type MainTab = "layers" | "styles" | "typography" | "shapes" | "layout" | "announcement" | "custom-css";

export default function CustomizerClient({ initialSettings, initialPresets, categories, pages = [], customSections = [] }: Props) {
  const [settings, setSettings] = useState<any>(initialSettings);
  const [presets, setPresets] = useState<any[]>(initialPresets);
  const [homeCustomSections, setHomeCustomSections] = useState<any[]>(customSections);
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<MainTab>("layers");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewUrl, setPreviewUrl] = useState("/");
  const [dockMode, setDockMode] = useState<DockMode>("left");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastPage = window.sessionStorage.getItem("customizer_last_page");
      if (lastPage) {
        setPreviewUrl(lastPage);
        window.sessionStorage.removeItem("customizer_last_page");
      }
    }
  }, []);

  // Resizable Studio Panel Width (px)
  const [panelWidth, setPanelWidth] = useState<number>(360);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(false);

  // Hero slides state
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(0);
  const [uploadingSlideMedia, setUploadingSlideMedia] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setIframeLoading(true);
  }, [previewUrl, iframeKey]);

  // Dynamic preview pages including CMS pages
  type PreviewPage = { label: string; url: string; isCms?: boolean; id?: any; slug?: string };
  const previewPages: PreviewPage[] = [
    { label: "Home Page ( / )", url: "/" },
    ...pages.map(p => {
      const cleanSlug = p.slug?.toLowerCase()?.trim() || "";
      const isSystemRoute = ["about", "faq", "contact"].includes(cleanSlug);
      const url = isSystemRoute ? `/${cleanSlug}` : `/pages/${cleanSlug}`;
      return { label: `${p.title} ( ${url} )`, url, isCms: true, id: p._id, slug: cleanSlug };
    }),
    { label: "Cart Page ( /cart )", url: "/cart" }
  ];
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeBlockType, setActiveBlockType] = useState<string | null>(null);
  const [inspectorActive, setInspectorActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoutActive, setPopoutActive] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<any[]>([initialSettings]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Widget Floating & Dragging State
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Modal States
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionSearchQuery, setSectionSearchQuery] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [showPageModal, setShowPageModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [addToHeader, setAddToHeader] = useState(false);
  const [addToFooter, setAddToFooter] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const PAGE_TEMPLATES = [
    {
      id: "blank",
      name: "Blank Canvas",
      desc: "Clean empty layout ready for custom block creation",
      defaultTitle: "",
      defaultSlug: "",
      defaultMetaTitle: "",
      defaultMetaDesc: "",
      defaultHeaderNav: false,
      defaultFooterNav: false,
      blocks: [
        {
          blockType: "rich-text",
          blockData: { heading: "Welcome", content: "<p>Add custom blocks to build your page layout.</p>" }
        }
      ]
    },
    {
      id: "contact",
      name: "Contact Us Page",
      desc: "Pre-loaded with Fragrance Concierge Hero, Consultation Channels & FAQ",
      defaultTitle: "Contact Us",
      defaultSlug: "contact",
      defaultMetaTitle: "Contact Us | Luxury Fragrance Concierge & Client Support",
      defaultMetaDesc: "Connect with our master fragrance specialists for bespoke recommendations, order tracking, and client care.",
      defaultHeaderNav: true,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Fragrance Concierge",
            subheading: "Our fragrance specialists are available to guide your olfactory journey, recommend signature scents, and assist with your orders.",
            buttonText: "Inquire via WhatsApp",
            buttonUrl: "https://wa.me/923001234567"
          }
        },
        {
          blockType: "features",
          blockData: {
            heading: "Client Care & Services",
            items: [
              { title: "Scent Consultation", desc: "Mon-Sat 9am - 9pm with master advisors", icon: "Sparkles" },
              { title: "Worldwide Express", desc: "Fast tracked courier to 50+ countries", icon: "Truck" },
              { title: "256-Bit SSL Checkout", desc: "Bank-grade encrypted secure transactions", icon: "Shield" }
            ]
          }
        },
        {
          blockType: "faq",
          blockData: {
            heading: "Frequently Asked Questions",
            items: [
              { question: "How long do your Extrait de Parfum creations last?", answer: "Our fragrances feature a 30–35% pure oil concentration, providing 12 to 16+ hours of projection and lasting aura." },
              { question: "Can I track my delivery status in real-time?", answer: "Yes, you will receive a tracking link via SMS, WhatsApp, and email as soon as your parcel dispatches." },
              { question: "What is your return & exchange policy?", answer: "We offer a 15-day satisfaction guarantee on unopened, sealed bottles in original luxury packaging." }
            ]
          }
        }
      ]
    },
    {
      id: "about",
      name: "About Us / Brand Story",
      desc: "Pre-loaded with Heritage Hero, Artisanal Crafting & Pure Extrait Philosophy",
      defaultTitle: "About Us",
      defaultSlug: "about",
      defaultMetaTitle: "About Us | The Art of Haute Parfumerie & Pure Extrait",
      defaultMetaDesc: "Discover the heritage, passion, and master craftsmanship behind our artisanal perfume collection.",
      defaultHeaderNav: true,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "The Art of Haute Parfumerie",
            subheading: "Crafting rare, evocative fragrances with wild botanicals, precious woods, and timeless artisanal mastery.",
            buttonText: "Explore Collection",
            buttonUrl: "/all"
          }
        },
        {
          blockType: "split-content",
          blockData: {
            heading: "Heritage & Olfactory Philosophy",
            content: "Every fragrance in our collection is an homage to the sacred art of perfumery. We hand-select wild saffron, aged agarwood from Cambodia and Assam, and organic bourbon vanilla to formulate rich, multi-layered perfumes that awaken emotions and leave lasting impressions.",
            image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
            reverse: false
          }
        },
        {
          blockType: "stats",
          blockData: {
            items: [
              { label: "Extrait Concentration", value: "30-35%" },
              { label: "Longevity & Sillage", value: "16+ Hrs" },
              { label: "Ethical & Cruelty-Free", value: "100%" }
            ]
          }
        }
      ]
    },
    {
      id: "faq",
      name: "FAQ & Help Center",
      desc: "Pre-loaded with Fragrance Guide, Concentration Details & Orders FAQ",
      defaultTitle: "Frequently Asked Questions",
      defaultSlug: "faq",
      defaultMetaTitle: "FAQ & Fragrance Guide | Customer Care",
      defaultMetaDesc: "Find answers to frequently asked questions about perfume concentration, longevity, application tips, and deliveries.",
      defaultHeaderNav: false,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Fragrance Guide & Help Center",
            subheading: "Everything you need to know about our perfume formulations, notes, sillage, and order handling.",
            buttonText: "Contact Concierge",
            buttonUrl: "/contact"
          }
        },
        {
          blockType: "faq",
          blockData: {
            heading: "Olfactory & Product Questions",
            items: [
              { question: "What is the difference between Extrait de Parfum and Eau de Parfum?", answer: "Extrait de Parfum represents the pinnacle of perfume concentration (30–35% pure oils vs 15–20% in EDP), delivering deeper richer notes and dramatically superior longevity." },
              { question: "How should I apply my perfume for maximum sillage?", answer: "Spray onto warm pulse points (neck, wrists, collarbone) after showering on moisturized skin. Avoid rubbing wrists together to preserve delicate top accords." },
              { question: "Are your ingredients sustainable and skin-friendly?", answer: "Yes, all our perfumes are dermatologically tested, IFRA-compliant, cruelty-free, and formulated with sustainably sourced precious ingredients." },
              { question: "What payment methods are supported?", answer: "We support Visa, MasterCard, Apple Pay, Google Pay, Cash on Delivery (COD), and direct bank transfers." }
            ]
          }
        }
      ]
    },
    {
      id: "shipping",
      name: "Shipping & Delivery Policy",
      desc: "Pre-loaded with Express Courier Timelines & Handling Procedures",
      defaultTitle: "Shipping & Delivery Policy",
      defaultSlug: "shipping-and-delivery",
      defaultMetaTitle: "Shipping & Delivery Policy | Express Tracked Dispatch",
      defaultMetaDesc: "Review our worldwide shipping guidelines, transit timelines, tracking instructions, and package care.",
      defaultHeaderNav: false,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Shipping & Delivery Guidelines",
            content: "<h3>1. Processing & Handling</h3><p>Every bottle is individually inspected, carefully padded in protective luxury packaging, and dispatched within <strong>24 to 48 business hours</strong> of order confirmation.</p><h3>2. Delivery Timelines</h3><p><strong>Domestic Standard Delivery:</strong> 2 to 4 Business Days<br/><strong>Express Priority Courier:</strong> 1 to 2 Business Days<br/><strong>International Air Freight:</strong> 4 to 7 Business Days</p><h3>3. Real-Time Tracking</h3><p>Once your order leaves our facility, you will receive an automatic tracking code via SMS, WhatsApp, and email to monitor your parcel in real-time.</p>"
          }
        }
      ]
    },
    {
      id: "privacy",
      name: "Privacy & Cookie Policy",
      desc: "Pre-loaded with 256-Bit SSL Data Protection & Privacy Safeguards",
      defaultTitle: "Privacy Policy",
      defaultSlug: "privacy-policy",
      defaultMetaTitle: "Privacy & Cookie Policy | Bank-Grade Data Protection",
      defaultMetaDesc: "Learn how we safeguard your personal information, encrypted payments, and client confidentiality.",
      defaultHeaderNav: false,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Privacy & Data Protection Standards",
            content: "<h3>1. Information Confidentiality</h3><p>We respect your privacy and never sell or rent your personal information to third parties. Data collected is strictly used to fulfill your orders and tailor your luxury shopping experience.</p><h3>2. 256-Bit SSL Encryption</h3><p>All transactions and sensitive information are processed over bank-grade 256-bit SSL encrypted connections directly with certified payment gateways.</p><h3>3. Account Controls</h3><p>You maintain full ownership of your data and can request deletion or export of your account records at any time through our client support team.</p>"
          }
        }
      ]
    },
    {
      id: "refund",
      name: "Return & Refund Policy",
      desc: "Pre-loaded with 15-Day Satisfaction Guarantee & Refund Terms",
      defaultTitle: "Return & Refund Policy",
      defaultSlug: "return-refund-policy",
      defaultMetaTitle: "Return & Refund Policy | 15-Day Client Guarantee",
      defaultMetaDesc: "Read our hassle-free return criteria, bottle exchange options, and fast refund processing timelines.",
      defaultHeaderNav: false,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "15-Day Client Satisfaction Guarantee",
            content: "<h3>1. Returns & Exchanges</h3><p>We want you to love your signature scent. If you are not completely satisfied, you may return unopened bottles in their original sealed luxury packaging within <strong>15 days of delivery</strong> for a full refund or exchange.</p><h3>2. Damaged or Defective Items</h3><p>In the unlikely event that your perfume arrives damaged in transit, contact us immediately with a photo, and our team will courier an immediate complimentary replacement.</p><h3>3. Refund Processing</h3><p>Upon receipt and inspection, refunds are processed within <strong>2 to 4 business days</strong> directly to your original payment method.</p>"
          }
        }
      ]
    },
    {
      id: "terms",
      name: "Terms & Conditions",
      desc: "Pre-loaded with Terms of Service, Client Rights & Authentic Guarantee",
      defaultTitle: "Terms & Conditions",
      defaultSlug: "terms-of-service",
      defaultMetaTitle: "Terms & Conditions | Client Agreement",
      defaultMetaDesc: "Official terms and conditions governing purchases, authentic guarantees, and store usage.",
      defaultHeaderNav: false,
      defaultFooterNav: true,
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Terms & Conditions of Service",
            content: "<h3>1. Acceptance of Terms</h3><p>By placing an order on our store, you agree to these Terms and Conditions and our client service guidelines.</p><h3>2. Authentic Product Guarantee</h3><p>We guarantee that 100% of the perfumes, extracts, and luxury goods offered on our site are authentic, original creations crafted to the highest quality standards.</p><h3>3. Order Confirmation & Fulfillment</h3><p>All orders are confirmed via automated email and SMS. We reserve the right to cancel or hold suspicious or unverified orders to protect our clients against fraudulent activities.</p>"
          }
        }
      ]
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const t = PAGE_TEMPLATES.find(tmpl => tmpl.id === templateId);
    if (t) {
      if (t.id !== "blank") {
        setPageTitle(t.defaultTitle || t.name);
        setPageSlug(t.defaultSlug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
        setMetaTitle(t.defaultMetaTitle || `${t.defaultTitle || t.name} | Storefront`);
        setMetaDescription(t.defaultMetaDesc || `Read our official ${t.defaultTitle || t.name} page.`);
        setAddToHeader(!!t.defaultHeaderNav);
        setAddToFooter(!!t.defaultFooterNav);
      } else {
        setPageTitle("");
        setPageSlug("");
        setMetaTitle("");
        setMetaDescription("");
        setAddToHeader(false);
        setAddToFooter(false);
      }
    }
  };

  const [showPageSeoAccordion, setShowPageSeoAccordion] = useState(false);
  const [activePageMetaTitle, setActivePageMetaTitle] = useState("");
  const [activePageMetaDesc, setActivePageMetaDesc] = useState("");
  const [activePageTitleInput, setActivePageTitleInput] = useState("");
  const [activePageHeaderNav, setActivePageHeaderNav] = useState(false);
  const [activePageFooterNav, setActivePageFooterNav] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.postMessage({
      type: "SCROLL_TO_SECTION",
      sectionId: sectionId
    }, "*");
  };
  const [showAiModal, setShowAiModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultOrder = [
    "hero",
    "badges",
    "categories",
    "best-products",
    "customize-1",
    "customize-2",
    "testimonials",
    "celebrity-reviews",
    "custom-html"
  ];

  const activePage = previewPages.find(p => {
    if (p.url === previewUrl) return true;
    if (p.slug) {
      if (previewUrl === `/pages/${p.slug}` || previewUrl === `/${p.slug}`) return true;
    }
    return false;
  });
  const isCmsPage = activePage?.isCms;
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);

  useEffect(() => {
    if (isCmsPage && activePage) {
      const pageData = pages.find(p => p._id === activePage.id || (p.slug && activePage.slug && p.slug.toLowerCase().trim() === activePage.slug.toLowerCase().trim()));
      if (pageData) {
        setPageBlocks(pageData.blocks || []);
        setActivePageTitleInput(pageData.title || "");
        setActivePageMetaTitle(pageData.seo?.metaTitle || "");
        setActivePageMetaDesc(pageData.seo?.metaDescription || "");

        const slug = pageData.slug?.toLowerCase()?.trim() || "";
        const isSys = ["about", "faq", "contact"].includes(slug);
        const pUrl = isSys ? `/${slug}` : `/pages/${slug}`;
        const inHeader = (settings.headerLinks || []).some((l: any) => l.url === pUrl || l.url === `/pages/${slug}`);
        const inFooter = (settings.footerLinks || []).some((l: any) => l.url === pUrl || l.url === `/pages/${slug}`);
        setActivePageHeaderNav(inHeader || !!pageData.showInHeader);
        setActivePageFooterNav(inFooter || !!pageData.showInFooter);
      }
    }
  }, [previewUrl, isCmsPage]);

  // For CMS pages, we fake a sectionOrder array using the block types + indices
  const sectionOrder = isCmsPage
    ? pageBlocks.map((b, i) => `${b.blockType}-${i}`)
    : (settings.storefrontLayout?.sectionOrder || defaultOrder);
  const hiddenSections = settings.storefrontLayout?.hiddenSections || [];

  // On mount: sync any homeCustomSections that are not yet in sectionOrder
  // (e.g. blocks added before sectionOrder tracking existed)
  useEffect(() => {
    if (isCmsPage || !homeCustomSections.length) return;
    const currentOrder: string[] = settings.storefrontLayout?.sectionOrder || defaultOrder;
    const missingIds = homeCustomSections
      .filter((s: any) => {
        const expectedId = `custom-section-${s._id}:::${s.name}`;
        return !currentOrder.some((o: string) => o.startsWith(`custom-section-${s._id}`));
      })
      .map((s: any) => `custom-section-${s._id}:::${s.name}`);
    if (missingIds.length > 0) {
      updateNestedSetting("storefrontLayout", "sectionOrder", [...currentOrder, ...missingIds]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Broadcast live updates to pop-out windows in real-time
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("sqodex_customizer_sync");
      channel.postMessage({ type: "SETTINGS_UPDATE", settings });
      channel.close();
    }
  }, [settings]);

  // Resizable Panel Drag Listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      if (dockMode === "left") {
        const newWidth = Math.min(Math.max(e.clientX, 280), 650);
        setPanelWidth(newWidth);
      } else if (dockMode === "right") {
        const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 280), 650);
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, dockMode]);

  // Undo / Redo Actions
  const pushStateToHistory = (newSettings: any) => {
    setSettings(newSettings);
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newSettings]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setSettings(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setSettings(history[nextIdx]);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button") || dockMode !== "floating") return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y)
      });
    };
    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  const toggleInspector = () => {
    setInspectorActive(prev => {
      const next = !prev;
      const iframe = document.querySelector("iframe");
      iframe?.contentWindow?.postMessage({ type: "SET_INSPECTOR_ACTIVE", active: next }, "*");
      return next;
    });
  };

  // Auto-save debounce
  useEffect(() => {
    if (JSON.stringify(settings) === JSON.stringify(initialSettings)) return;
    const timer = setTimeout(() => {
      handleSave(settings);
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (!isCmsPage || !activePage) return;
    const pageData = pages.find(p => p._id === activePage.id);
    if (!pageData) return;
    if (JSON.stringify(pageBlocks) === JSON.stringify(pageData.blocks || [])) return;

    const timer = setTimeout(() => {
      handleSave(settings);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pageBlocks, isCmsPage, activePage, pages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INSPECTOR_READY") {
        const iframe = document.querySelector("iframe");
        iframe?.contentWindow?.postMessage({
          type: "SET_INSPECTOR_ACTIVE",
          active: inspectorActive
        }, "*");
      }
      if (event.data?.type === "SELECT_SECTION") {
        const sectionId = event.data.sectionId;
        const blockType = event.data.blockType;
        setActiveTab("layers");
        if (isCmsPage) {
          setActiveSection(null);
          const parts = sectionId.split("-");
          const blockIndex = parts[parts.length - 1];
          const el = document.getElementById(`block-${blockIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a temporary highlight class/effect
            el.classList.add("ring-2", "ring-primary");
            setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
          }
        } else {
          setActiveSection(sectionId);
          setActiveBlockType(blockType);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [inspectorActive]);

  const handleSave = async (settingsToSave: any) => {
    setIsSaving(true);
    setSaveSuccess(false);

    if (isCmsPage && activePage?.id) {
      const pageData = pages.find(p => p._id === activePage.id || (p.slug && activePage.slug && p.slug.toLowerCase().trim() === activePage.slug.toLowerCase().trim()));
      const cleanTitle = activePageTitleInput.trim() || pageData?.title || activePage.label.split(" (")[0];
      const rawSlug = (pageData?.slug || activePage.slug || activePage.url.replace("/pages/", "").replace("/", "")).toLowerCase().trim();
      const isSys = ["about", "faq", "contact"].includes(rawSlug);
      const pageUrl = isSys ? `/${rawSlug}` : `/pages/${rawSlug}`;

      // Save title, SEO metadata, blocks, and nav flags to the CMS page
      const res = await updatePageAction(activePage.id, {
        title: cleanTitle,
        seo: {
          metaTitle: activePageMetaTitle.trim(),
          metaDescription: activePageMetaDesc.trim()
        },
        blocks: pageBlocks,
        showInHeader: activePageHeaderNav,
        showInFooter: activePageFooterNav
      });

      if (!res.success) {
        alert("Failed to save page: " + res.error);
        setIsSaving(false);
        return;
      }

      // Sync header and footer links in site settings if modified
      let updatedSettings = { ...settingsToSave };
      let navChanged = false;

      // Header Nav sync
      let currentHeader = [...(updatedSettings.headerLinks || [])];
      const headerExists = currentHeader.some((l: any) => l.url === pageUrl);
      if (activePageHeaderNav && !headerExists) {
        currentHeader.push({ label: cleanTitle, url: pageUrl });
        updatedSettings.headerLinks = currentHeader;
        navChanged = true;
      } else if (!activePageHeaderNav && headerExists) {
        updatedSettings.headerLinks = currentHeader.filter((l: any) => l.url !== pageUrl);
        navChanged = true;
      }

      // Footer Nav sync
      let currentFooter = [...(updatedSettings.footerLinks || [])];
      const footerExists = currentFooter.some((l: any) => l.url === pageUrl);
      if (activePageFooterNav && !footerExists) {
        currentFooter.push({ label: cleanTitle, url: pageUrl });
        updatedSettings.footerLinks = currentFooter;
        navChanged = true;
      } else if (!activePageFooterNav && footerExists) {
        updatedSettings.footerLinks = currentFooter.filter((l: any) => l.url !== pageUrl);
        navChanged = true;
      }

      if (navChanged) {
        settingsToSave = updatedSettings;
        setSettings(updatedSettings);
      }
    }

    if (dirtySections.size > 0) {
      await Promise.all(Array.from(dirtySections).map(id => {
        const sec = homeCustomSections.find(s => String(s._id) === id);
        if (sec) return updateCustomSectionAction(id, { blockData: sec.blockData });
        return Promise.resolve();
      }));
      setDirtySections(new Set());
    }

    // Always save global settings too, just in case colors/fonts/nav changed
    await updateSiteSettingsAction(settingsToSave);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setIframeKey(prev => prev + 1);
  };

  const updateNestedSetting = (category: string, field: string, value: any) => {
    setSettings((prev: any) => {
      const updated = !field
        ? { ...prev, [category]: value }
        : {
          ...prev,
          [category]: {
            ...(prev[category] || {}),
            [field]: value
          }
        };
      pushStateToHistory(updated);
      return updated;
    });
  };

  const handleAddHeroSlide = () => {
    const currentSlides = settings.heroConfig?.slides ? [...settings.heroConfig.slides] : [];
    const newSlide = {
      _id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `SLIDE ${currentSlides.length + 1}`,
      subtitle: "Handcrafted luxury extrait de parfum formulated for distinction.",
      link: "/collections",
      buttonText: "View more",
      bannerImage: "",
      bannerVideo: ""
    };
    const updated = [...currentSlides, newSlide];
    updateNestedSetting("heroConfig", "slides", updated);
    setExpandedSlideIndex(updated.length - 1);
  };

  const handleCloneCategoriesToHeroSlides = () => {
    const existingSlides = [...(settings.heroConfig?.slides || [])];

    let incomingSlides: any[] = [];
    if (!categories || categories.length === 0) {
      incomingSlides = [
        {
          _id: `slide-${Date.now()}-1`,
          title: "FOR MEN",
          subtitle: "Luxury men's perfumes crafted for confidence, strength, and timeless sophistication.",
          link: "/for-men",
          buttonText: "View more",
          bannerImage: "",
          bannerVideo: ""
        },
        {
          _id: `slide-${Date.now()}-2`,
          title: "FOR WOMEN",
          subtitle: "Luxury women's perfumes crafted for elegance, confidence, and timeless beauty.",
          link: "/for-women",
          buttonText: "View more",
          bannerImage: "",
          bannerVideo: ""
        }
      ];
    } else {
      incomingSlides = categories.map((cat: any, idx: number) => ({
        _id: `slide-${Date.now()}-${idx}`,
        title: cat.name || `Slide ${idx + 1}`,
        subtitle: cat.metaDescription || "Handcrafted luxury extrait de parfum.",
        link: `/${cat.slug || ""}`,
        buttonText: "View more",
        bannerImage: cat.bannerImage || "",
        bannerVideo: cat.bannerVideo || ""
      }));
    }

    // If no existing slides, initialize with incoming slides
    if (existingSlides.length === 0) {
      updateNestedSetting("heroConfig", "slides", incomingSlides);
      setExpandedSlideIndex(0);
      return;
    }

    // If existing slides exist, append only categories that are not already present (avoiding duplicates and preserving all existing customizations)
    const existingTitles = new Set(existingSlides.map((s: any) => (s.title || "").trim().toLowerCase()));
    const existingLinks = new Set(existingSlides.map((s: any) => (s.link || "").trim().toLowerCase()));

    const toAppend = incomingSlides.filter((s: any) => {
      const titleKey = (s.title || "").trim().toLowerCase();
      const linkKey = (s.link || "").trim().toLowerCase();
      return !existingTitles.has(titleKey) && !existingLinks.has(linkKey);
    });

    if (toAppend.length === 0) {
      alert("All store categories are already added to your hero slides. Existing slides were preserved.");
      return;
    }

    const merged = [...existingSlides, ...toAppend];
    updateNestedSetting("heroConfig", "slides", merged);
    setExpandedSlideIndex(existingSlides.length);
  };

  const handleUpdateHeroSlide = (idx: number, field: string, value: any) => {
    const currentSlides = [...(settings.heroConfig?.slides || [])];
    if (!currentSlides[idx]) return;
    currentSlides[idx] = {
      ...currentSlides[idx],
      [field]: value
    };
    updateNestedSetting("heroConfig", "slides", currentSlides);
  };

  const handleDeleteHeroSlide = (idx: number) => {
    const currentSlides = [...(settings.heroConfig?.slides || [])];
    currentSlides.splice(idx, 1);
    updateNestedSetting("heroConfig", "slides", currentSlides);
    if (expandedSlideIndex === idx) {
      setExpandedSlideIndex(currentSlides.length > 0 ? 0 : null);
    } else if (expandedSlideIndex !== null && expandedSlideIndex > idx) {
      setExpandedSlideIndex(expandedSlideIndex - 1);
    }
  };

  const handleMoveHeroSlide = (idx: number, direction: "up" | "down") => {
    const currentSlides = [...(settings.heroConfig?.slides || [])];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSlides.length) return;
    const temp = currentSlides[idx];
    currentSlides[idx] = currentSlides[targetIdx];
    currentSlides[targetIdx] = temp;
    updateNestedSetting("heroConfig", "slides", currentSlides);
    setExpandedSlideIndex(targetIdx);
  };

  const handleUploadHeroSlideMedia = async (idx: number, field: "bannerImage" | "bannerVideo", file: File) => {
    const key = `${idx}-${field}`;
    setUploadingSlideMedia(prev => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = field === "bannerImage" ? await uploadImageAction(formData) : await uploadVideoAction(formData);
      if (res.success && res.url) {
        handleUpdateHeroSlide(idx, field, res.url);
      } else {
        alert(res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingSlideMedia(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleThemeChange = (themeName: string) => {
    const customPreset = presets.find(p => p.name === themeName);
    if (customPreset) {
      setSettings((prev: any) => ({
        ...prev,
        activeTheme: customPreset.baseTheme,
        themeColors: {
          primary: customPreset.themeColors.primary,
          secondary: customPreset.themeColors.secondary,
          text: customPreset.themeColors.text,
          accent: customPreset.themeColors.accent,
          background: customPreset.themeColors.background
        }
      }));
    }
  };

  const generateMatchingPalette = () => {
    const primary = settings.themeColors?.primary || "#3b82f6";
    updateNestedSetting("themeColors", "", {
      primary,
      accent: primary === "#000000" ? "#3b82f6" : primary,
      secondary: "#141210",
      background: "#ffffff",
      text: "#0f172a"
    });
  };

  const applyAiStylePreset = (styleType: "luxury" | "cyber" | "clean") => {
    if (styleType === "luxury") {
      updateNestedSetting("themeColors", "", {
        primary: "#d4af37",
        secondary: "#0a0a0a",
        accent: "#f3e5ab",
        background: "#050505",
        text: "#f5f5f7"
      });
      updateNestedSetting("borderRadius", "", "4px");
      updateNestedSetting("buttonStyle", "variant", "solid");
    } else if (styleType === "cyber") {
      updateNestedSetting("themeColors", "", {
        primary: "#00ffcc",
        secondary: "#0f0f1a",
        accent: "#ff007f",
        background: "#080811",
        text: "#ffffff"
      });
      updateNestedSetting("borderRadius", "", "0px");
      updateNestedSetting("buttonStyle", "variant", "neon");
    } else {
      updateNestedSetting("themeColors", "", {
        primary: "#0f172a",
        secondary: "#f8fafc",
        accent: "#3b82f6",
        background: "#ffffff",
        text: "#0f172a"
      });
      updateNestedSetting("borderRadius", "", "16px");
      updateNestedSetting("buttonStyle", "variant", "glass");
    }
    setShowAiModal(false);
  };

  const handleTypographyChange = (pairId: string) => {
    const pair = FONT_PAIRS.find(p => p.id === pairId);
    if (pair) {
      setSettings((prev: any) => ({
        ...prev,
        typography: {
          ...prev.typography,
          headingsFont: pair.headingsFont,
          bodyFont: pair.bodyFont,
          headingsFontFamily: pair.headingsFontFamily,
          bodyFontFamily: pair.bodyFontFamily,
          importUrl: pair.importUrl
        }
      }));
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    if (isCmsPage) {
      const parts = sectionId.split("-");
      const index = parseInt(parts[parts.length - 1]);
      if (isNaN(index) || !pageBlocks[index]) return;

      const newBlocks = [...pageBlocks];
      newBlocks[index] = {
        ...newBlocks[index],
        blockData: {
          ...newBlocks[index].blockData,
          hidden: !newBlocks[index].blockData?.hidden
        }
      };
      setPageBlocks(newBlocks);
      return;
    }
    const hidden = settings.storefrontLayout?.hiddenSections || [];
    const newHidden = hidden.includes(sectionId)
      ? hidden.filter((id: string) => id !== sectionId)
      : [...hidden, sectionId];
    updateNestedSetting("storefrontLayout", "hiddenSections", newHidden);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (isCmsPage) {
      const newBlocks = [...pageBlocks];
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[targetIndex];
      newBlocks[targetIndex] = temp;
      setPageBlocks(newBlocks);
    } else {
      const order = [...sectionOrder];
      if (targetIndex < 0 || targetIndex >= order.length) return;
      const temp = order[index];
      order[index] = order[targetIndex];
      order[targetIndex] = temp;
      updateNestedSetting("storefrontLayout", "sectionOrder", order);
    }
  };

  const duplicateSection = (sectionId: string) => {
    if (isCmsPage) {
      const index = sectionOrder.indexOf(sectionId);
      const newBlocks = [...pageBlocks];
      const blockToClone = { ...newBlocks[index] };
      newBlocks.splice(index + 1, 0, blockToClone);
      setPageBlocks(newBlocks);
    } else {
      const index = sectionOrder.indexOf(sectionId);
      const newSectionId = `${sectionId}-copy-${Date.now().toString().slice(-4)}`;
      const newOrder = [...sectionOrder];
      newOrder.splice(index + 1, 0, newSectionId);
      updateNestedSetting("storefrontLayout", "sectionOrder", newOrder);
    }
  };

  const handleCreatePreset = async () => {
    if (!presetName.trim()) return;
    const newPresetData = {
      name: presetName.trim(),
      baseTheme: settings.activeTheme || "custom",
      themeColors: {
        primary: settings.themeColors?.primary || "#000000",
        secondary: settings.themeColors?.secondary || "#ffffff",
        text: settings.themeColors?.text || "#333333",
        accent: settings.themeColors?.accent || "#3b82f6",
        background: settings.themeColors?.background || "#f4f4f5",
      }
    };

    const res = await createThemePresetAction(newPresetData);
    if (res.success) {
      setPresets((prev: any[]) => [res.data, ...prev]);
      setShowPresetModal(false);
      setPresetName("");
      setSettings((prev: any) => ({ ...prev, activeTheme: res.data.name }));
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleAddSection = async (blockType: string) => {
    let initialData: any = {};
    if (blockType === "hero") {
      initialData = { heading: "Welcome to Our Page", subheading: "Premium quality guaranteed.", buttonText: "Shop Now", buttonUrl: "/all" };
    } else if (blockType === "rich-text") {
      initialData = { heading: "Our Mission", content: "<p>We strive to bring you the best designs with the finest craftsmanship.</p>" };
    } else if (blockType === "features") {
      initialData = {
        heading: "Why Choose Us",
        items: [
          { title: "Worldwide Shipping", desc: "Fast and reliable shipping to your door.", icon: "Truck" },
          { title: "Secure Checkout", desc: "Your details are encrypted and safe.", icon: "Shield" }
        ]
      };
    } else if (blockType === "faq") {
      initialData = {
        heading: "Frequently Asked Questions",
        items: [
          { question: "What is the delivery timeline?", answer: "Orders ship within 3-5 business days." },
          { question: "How do I return my item?", answer: "We offer a 30-day return policy." }
        ]
      };
    } else if (blockType === "testimonials") {
      initialData = {
        heading: "What Our Customers Say",
        items: [{ name: "John Doe", role: "CEO", review: "Absolutely phenomenal quality and design. It transformed our entire workflow.", stars: 5 }]
      };
    } else if (blockType === "cta-banner") {
      initialData = { heading: "Ready to Elevate Your Brand?", subheading: "Join thousands of satisfied customers today.", buttonText: "Get Started", buttonUrl: "/collections", background: "" };
    } else if (blockType === "video-banner") {
      initialData = { heading: "Watch Our Story", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
    } else if (blockType === "newsletter") {
      initialData = { heading: "Join the Club", subheading: "Subscribe for exclusive drops and early access." };
    } else if (blockType === "stats") {
      initialData = {
        items: [
          { label: "Happy Customers", value: "10K+" },
          { label: "Products Sold", value: "500K" },
          { label: "Countries Served", value: "50+" }
        ]
      };
    } else if (blockType === "team") {
      initialData = {
        heading: "Meet the Creators",
        items: [{ name: "Jane Doe", role: "Creative Director", image: "https://i.pravatar.cc/300" }]
      };
    } else if (blockType === "gallery") {
      initialData = {
        heading: "Lookbook",
        items: [{ image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" }]
      };
    } else if (blockType === "split-content") {
      initialData = { heading: "The Art of Design", content: "We believe in minimalism that speaks volumes. Every pixel is crafted with intention.", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", reverse: false };
    } else if (blockType === "featured-products") {
      initialData = { heading: "Featured Collection", categorySlug: "", limit: 4 };
    } else if (blockType === "categories-grid") {
      initialData = { heading: "Shop by Category", items: [{ name: "New Arrivals", slug: "new-arrivals", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800" }] };
    } else if (blockType === "promo-banner") {
      initialData = { heading: "Summer Sale", text: "Use code SUMMER20 for 20% off!", url: "/all", background: "bg-red-500 text-white" };
    } else if (blockType === "brand-logos") {
      initialData = { heading: "Trusted Brands", items: [{ image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" }] };
    } else if (blockType === "image") {
      initialData = { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", altText: "Featured Image", fullWidth: false };
    } else if (blockType === "image-text") {
      initialData = { image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", heading: "Discover the Details", content: "A deep dive into what makes our collection unique. Experience the standard of quality.", imagePosition: "left" };
    } else if (blockType === "video") {
      initialData = { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", heading: "Watch the Video", fullWidth: false };
    } else if (blockType === "video-text") {
      initialData = { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", heading: "See it in action", content: "Watch the demonstration to understand how our product fits into your daily routine.", videoPosition: "left" };
    } else if (blockType === "contact-form" || blockType === "contact") {
      initialData = {
        heading: "Contact Our Team",
        subheading: "Have questions about our perfumes, custom requests, or orders? We are here to assist you 24/7.",
        email: "",
        phone: "",
        address: "",
        showDirectChannels: true
      };
    }

    const defaultName = blockType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    if (isCmsPage) {
      const newBlock = {
        blockType,
        blockData: initialData
      };
      setPageBlocks([...pageBlocks, newBlock]);
      setShowSectionModal(false);
      return;
    }

    const res = await createCustomSectionAction({
      name: defaultName,
      pageSlug: "home",
      order: 10,
      blockType: blockType,
      blockData: initialData
    });

    if (res.success) {
      setHomeCustomSections(prev => [...prev, res.data]);
      const newLayerId = `custom-section-${res.data._id}:::${defaultName}`;
      updateNestedSetting("storefrontLayout", "sectionOrder", [...sectionOrder, newLayerId]);

      setShowSectionModal(false);
      setIframeKey(prev => prev + 1);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDeleteCustomSection = async (sectionId: string) => {
    if (!confirm("Delete this block? This cannot be undone.")) return;
    // Extract the MongoDB ID from the sectionId (format: custom-section-{mongoId}:::{name})
    const mongoId = sectionId.replace("custom-section-", "").split(":::")[0];
    await deleteCustomSectionAction(mongoId);
    // Remove from local state
    setHomeCustomSections(prev => prev.filter(s => String(s._id) !== mongoId));
    // Remove from sectionOrder
    const newOrder = sectionOrder.filter((s: string) => s !== sectionId);
    updateNestedSetting("storefrontLayout", "sectionOrder", newOrder);
    // If the deleted section was active, go back to the sections list
    if (activeSection === sectionId) setActiveSection(null);
    setIframeKey(prev => prev + 1);
  };

  const handleAddPage = async () => {
    if (!pageTitle.trim() || !pageSlug.trim()) return;
    const cleanSlug = pageSlug.trim().toLowerCase().replace(/\s+/g, "-");
    const templateObj = PAGE_TEMPLATES.find(t => t.id === selectedTemplate);
    const initialBlocks = templateObj?.blocks || [];

    const res = await createPageAction({
      title: pageTitle.trim(),
      slug: cleanSlug,
      blocks: initialBlocks,
      seo: {
        metaTitle: metaTitle.trim() || pageTitle.trim(),
        metaDescription: metaDescription.trim() || `Read the ${pageTitle.trim()} page for our storefront.`
      },
      showInHeader: addToHeader,
      showInFooter: addToFooter
    });

    if (res.success) {
      // If header/footer checkboxes were ticked, append navigation links
      let updatedSettings = { ...settings };
      let navChanged = false;

      if (addToHeader) {
        const currentLinks = settings.headerLinks || [];
        const linkExists = currentLinks.some((l: any) => l.url === `/pages/${cleanSlug}`);
        if (!linkExists) {
          updatedSettings.headerLinks = [...currentLinks, { label: pageTitle.trim(), url: `/pages/${cleanSlug}` }];
          navChanged = true;
        }
      }

      if (addToFooter) {
        const currentLinks = settings.footerLinks || [];
        const linkExists = currentLinks.some((l: any) => l.url === `/pages/${cleanSlug}`);
        if (!linkExists) {
          updatedSettings.footerLinks = [...currentLinks, { label: pageTitle.trim(), url: `/pages/${cleanSlug}` }];
          navChanged = true;
        }
      }

      if (navChanged) {
        await updateSiteSettingsAction(updatedSettings);
      }

      setShowPageModal(false);
      setPageTitle("");
      setPageSlug("");
      setMetaTitle("");
      setMetaDescription("");
      setAddToHeader(false);
      setAddToFooter(false);
      alert(`Success! Created page at /pages/${cleanSlug}`);
      // Save local storage/session storage indicator to auto-select this page after reload
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("customizer_last_page", `/pages/${cleanSlug}`);
      }
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDeletePage = async () => {
    if (!isCmsPage || !activePage?.id) return;

    const pageData = pages.find(p => p._id === activePage.id);
    if (pageData?.isSystemPage) {
      alert("Cannot delete core system pages.");
      return;
    }

    // Prevent deleting core catalog/collections if they were somehow mapped here
    if (activePage.url === "/all" || activePage.url === "/collections") {
      alert("Cannot delete core system pages.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the page "${activePage.label}"?`)) return;

    const res = await deletePageAction(activePage.id);
    if (res.success) {
      alert("Page deleted successfully.");
      setPreviewUrl("/"); // redirect to home
      window.location.reload(); // Quick way to refresh the pages list and state
    } else {
      alert("Error: " + res.error);
    }
  };

  const exportThemeJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `theme-settings-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importThemeJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setSettings(parsed);
          alert("Theme settings imported successfully!");
        } catch (err) {
          alert("Invalid JSON configuration file.");
        }
      };
    }
  };

  const openPreviewInNewTab = () => {
    window.open(`${previewUrl}?preview=true`, "_blank");
    setPopoutActive(true);
  };

  const getSectionName = (id: string) => {
    if (id.includes("-copy-")) {
      const customTitle = settings.customHtmlConfig?.[id]?.title?.trim();
      if (customTitle) return customTitle;
      return `${id.split("-copy-")[0]} (Clone)`;
    }

    if (id.startsWith("custom-section-")) {
      const parts = id.split(":::");
      if (parts.length > 1) {
        return parts[1];
      }
      return "Custom Section";
    }

    let baseId = id;
    if (isCmsPage && /-\d+$/.test(id)) {
      const idx = parseInt(id.split("-").pop() || "", 10);
      if (!isNaN(idx) && pageBlocks[idx]) {
        const blk = pageBlocks[idx];
        const blkTitle = blk.blockData?.heading || blk.blockData?.title || blk.blockData?.name;
        if (blkTitle && typeof blkTitle === "string" && blkTitle.trim()) {
          return blkTitle.trim();
        }
      }
      baseId = id.replace(/-\d+$/, "");
    }

    switch (baseId) {
      case "header":
        return "Header & Announcement";
      case "hero":
        return settings.heroConfig?.heading?.trim() || "Hero Banner";
      case "badges":
        return settings.badgesConfig?.heading?.trim() || "Trust Badges";
      case "categories":
        return settings.featuredCategoriesSection?.heading?.trim() || "Featured Categories";
      case "best-products":
        return settings.bestProductsSection?.heading?.trim() || "Best Products Grid";
      case "customize-1":
        return settings.featuredProductsSection2?.heading?.trim() || "Featured Collection 1";
      case "customize-2":
        return settings.featuredProductsSection3?.heading?.trim() || "Featured Collection 2";
      case "testimonials":
        return settings.testimonialsSection?.heading?.trim() || "Customer Testimonials";
      case "celebrity-reviews":
        return settings.celebrityReviewsSection?.heading?.trim() || "Celebrity Reviews";
      case "product-related-products":
        return settings.relatedProductsSection?.heading?.trim() || "Related Products";
      case "custom-html":
        return settings.customHtmlConfig?.[id]?.title?.trim() || "Custom HTML Blocks";
      case "rich-text":
        return "Rich Text Content";
      case "footer":
        return "Footer Layout";
      default:
        return baseId.charAt(0).toUpperCase() + baseId.slice(1);
    }
  };

  const getSectionTypeLabel = (id: string) => {
    let baseId = id;
    if (isCmsPage && /-\d+$/.test(id)) {
      const idx = parseInt(id.split("-").pop() || "", 10);
      if (!isNaN(idx) && pageBlocks[idx]) {
        const blk = pageBlocks[idx];
        const blkTitle = blk.blockData?.heading || blk.blockData?.title || blk.blockData?.name;
        if (blkTitle && typeof blkTitle === "string" && blkTitle.trim()) {
          return `${blk.blockType} block`;
        }
      }
      baseId = id.replace(/-\d+$/, "");
    }

    const currentName = getSectionName(id);

    switch (baseId) {
      case "categories":
        return currentName !== "Featured Categories" ? "Featured Categories" : "";
      case "customize-1":
        return currentName !== "Featured Collection 1" ? "Featured Collection 1" : "";
      case "customize-2":
        return currentName !== "Featured Collection 2" ? "Featured Collection 2" : "";
      case "best-products":
        return currentName !== "Best Products Grid" ? "Best Products Grid" : "";
      case "testimonials":
        return currentName !== "Customer Testimonials" ? "Customer Testimonials" : "";
      case "celebrity-reviews":
        return currentName !== "Celebrity Reviews" ? "Celebrity Reviews" : "";
      case "product-related-products":
        return currentName !== "Related Products" ? "Related Products" : "";
      default:
        return "";
    }
  };

  const getSectionIcon = (id: string) => {
    let baseId = id;
    if (isCmsPage && /-\d+$/.test(id)) {
      baseId = id.replace(/-\d+$/, "");
    }

    switch (baseId) {
      case "header": return <Megaphone className="text-sky-400 w-4 h-4" />;
      case "hero": return <ImageIcon className="text-blue-400 w-4 h-4" />;
      case "badges": return <ShieldCheck className="text-emerald-400 w-4 h-4" />;
      case "categories": return <Grid className="text-indigo-400 w-4 h-4" />;
      case "best-products": return <ShoppingBag className="text-amber-400 w-4 h-4" />;
      case "customize-1": return <ShoppingBag className="text-pink-400 w-4 h-4" />;
      case "customize-2": return <ShoppingBag className="text-purple-400 w-4 h-4" />;
      case "product-related-products": return <Sparkles className="text-amber-400 w-4 h-4" />;
      case "testimonials": return <MessageSquare className="text-teal-400 w-4 h-4" />;
      case "celebrity-reviews": return <Video className="text-rose-400 w-4 h-4" />;
      case "custom-html": return <Code className="text-violet-400 w-4 h-4" />;
      case "rich-text": return <Type className="text-orange-400 w-4 h-4" />;
      case "footer": return <Globe className="text-neutral-400 w-4 h-4" />;
      default: return <Layers className="text-neutral-400 w-4 h-4" />;
    }
  };

  const filteredSections = sectionOrder.filter((sId: string) =>
    sId !== "hero" && getSectionName(sId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] w-full relative bg-background rounded-2xl overflow-hidden shadow-2xl border border-border flex text-foreground">

      {/* DOCKED LEFT STUDIO PANEL */}
      {dockMode === "left" && (
        <>
          <aside
            style={{ width: `${panelWidth}px` }}
            className="h-full bg-card/95 backdrop-blur-2xl border-r border-border/50 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] flex flex-col shrink-0 z-30 transition-none text-card-foreground"
          >
            {renderStudioHeader()}
            {renderStudioContent()}
          </aside>

          {/* RESIZABLE SPLIT DIVIDER HANDLE */}
          <div
            onMouseDown={() => setIsResizing(true)}
            className="w-1.5 h-full bg-muted hover:bg-primary cursor-col-resize z-40 transition-colors flex items-center justify-center group"
            title="Drag to resize panel width"
          >
            <GripVertical size={12} className="text-muted-foreground group-hover:text-primary-foreground" />
          </div>
        </>
      )}

      {/* CENTER WORKSPACE / LIVE PREVIEW */}
      <main className="flex-1 h-full relative flex flex-col bg-muted/40 overflow-hidden">

        {/* TOP TOOLBAR & CONTROLS */}
        <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between z-20 shrink-0 text-card-foreground">

          {/* Left Controls: Dock Toggle & Page Switcher */}
          <div className="flex items-center gap-2">
            {dockMode === "hidden" && (
              <button
                onClick={() => setDockMode("left")}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 transition-opacity shadow-md"
              >
                <PanelLeft size={14} />
                <span>Open Studio</span>
              </button>
            )}

            {/* Page Route Selector */}
            <div className="bg-muted border border-border rounded-lg flex items-center px-2.5 py-1">
              <Globe size={13} className="text-muted-foreground mr-2 shrink-0" />
              <select
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                className="bg-transparent text-foreground text-xs font-bold outline-none cursor-pointer pr-1"
              >
                {previewPages.map((page) => (
                  <option key={page.url} value={page.url} className="bg-popover text-popover-foreground">
                    {page.label}
                  </option>
                ))}
              </select>
              {isCmsPage && !["/all", "/collections"].includes(previewUrl) && (
                <button
                  onClick={handleDeletePage}
                  className="ml-2 text-red-500/70 hover:text-red-500 transition-colors"
                  title="Delete Custom Page"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Pop Out External Live Window with Sync Indicator */}
            <button
              onClick={openPreviewInNewTab}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-accent text-foreground border border-border rounded-lg font-bold text-xs transition-colors relative"
              title="Pop out full screen preview window in separate monitor tab"
            >
              <ExternalLink size={13} className="text-primary" />
              <span className="hidden md:inline">Pop Out Window</span>
              {popoutActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Viewport Switcher */}
            <div className="bg-muted border border-border rounded-lg flex items-center p-0.5">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded-md transition-all ${previewMode === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("tablet")}
                className={`p-1.5 rounded-md transition-all ${previewMode === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Tablet View (768px)"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded-md transition-all ${previewMode === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Mobile View (375px)"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>

          {/* Right Controls: Zoom Level, Undo/Redo, Studio Dock Modes & Save */}
          <div className="flex items-center gap-2">

            {/* Zoom / Scale Selector */}
            <div className="hidden lg:flex items-center bg-muted/60 border border-border rounded-lg px-2 py-1 gap-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[11px] font-mono font-bold text-foreground min-w-9 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(100, prev + 10))}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Undo / Redo Buttons */}
            <div className="bg-muted/60 border border-border rounded-lg flex items-center p-0.5">
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
              </button>
            </div>

            {/* Dock Position Selector */}
            <div className="hidden sm:flex items-center bg-muted/60 border border-border rounded-lg p-0.5">
              <button
                onClick={() => setDockMode("left")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${dockMode === "left" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Dock Studio Left"
              >
                <PanelLeft size={14} />
              </button>
              <button
                onClick={() => setDockMode("right")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${dockMode === "right" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Dock Studio Right"
              >
                <PanelRight size={14} />
              </button>
              <button
                onClick={() => setDockMode(dockMode === "hidden" ? "left" : "hidden")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${dockMode === "hidden" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Toggle Studio Panel"
              >
                {dockMode === "hidden" ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Primary Save Button */}
            <button
              onClick={() => handleSave(settings)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer ${saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                }`}
            >
              {isSaving ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>

        </div>

        {/* PREVIEW VIEWPORT FRAME */}
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative p-0">
          <div
            style={{
              transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
              transformOrigin: "top center"
            }}
            className={`bg-white shadow-[0_0_60px_rgba(0,0,0,0.6)] transition-all duration-300 ${previewMode === "mobile"
              ? "w-[320px] h-[85vh] max-h-175 rounded-[2.5rem] border-10 border-neutral-950 overflow-hidden my-auto"
              : previewMode === "tablet"
                ? "w-3xl h-[85vh] max-h-212.5 rounded-2xl border-8 border-neutral-950 overflow-hidden my-auto transform scale-90"
                : "w-full h-full rounded-none border-0 overflow-hidden"
              }`}
          >
            <div className="relative w-full h-full">
              <iframe
                key={`${iframeKey}-${previewUrl}`}
                src={`${previewUrl}?preview=true&t=${iframeKey}`}
                className="w-full h-full border-0 bg-white"
                title="Storefront Live Preview"
                onLoad={(e) => {
                  setIframeLoading(false);
                  const iframe = e.currentTarget;
                  iframe.contentWindow?.postMessage({
                    type: "SET_INSPECTOR_ACTIVE",
                    active: inspectorActive
                  }, "*");
                }}
              />
              {iframeLoading && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-4 pointer-events-none z-50">
                  <div className="w-16 h-16 skeleton-shimmer rounded-full" />
                  <div className="h-4 w-48 skeleton-shimmer rounded-lg" />
                  <div className="h-3 w-32 skeleton-shimmer rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* DOCKED RIGHT STUDIO PANEL */}
      {dockMode === "right" && (
        <>
          <div
            onMouseDown={() => setIsResizing(true)}
            className="w-1.5 h-full bg-muted hover:bg-primary cursor-col-resize z-40 transition-colors flex items-center justify-center group"
            title="Drag to resize panel width"
          >
            <GripVertical size={12} className="text-muted-foreground group-hover:text-primary-foreground" />
          </div>

          <aside
            style={{ width: `${panelWidth}px` }}
            className="h-full bg-card/95 backdrop-blur-2xl border-l border-border/50 shadow-[-4px_0_24px_-4px_rgba(0,0,0,0.1)] flex flex-col shrink-0 z-30 transition-none text-card-foreground"
          >
            {renderStudioHeader()}
            {renderStudioContent()}
          </aside>
        </>
      )}

      {/* FLOATING DRAGGABLE STUDIO WIDGET */}
      {dockMode === "floating" && (
        <div
          className="absolute z-50 flex flex-col bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl transition-[width,height] duration-200 overflow-hidden ring-1 ring-black/5"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: `${panelWidth}px`,
            height: "calc(100vh - 6rem)",
            maxHeight: "820px"
          }}
        >
          {renderStudioHeader(true)}
          {renderStudioContent()}
        </div>
      )}

      {/* MODALS */}
      {showAiModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Sparkles className="text-amber-400 w-5 h-5" /> AI Studio Magic Assistant
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Select an aesthetic preset to auto-generate color swatches, typography, button variants, and border styling instantly.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => applyAiStylePreset("luxury")}
                className="w-full text-left p-3 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:border-amber-500/50 hover:bg-neutral-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-400 group-hover:underline">✨ Obsidian Luxury & Gold</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">PRESET</span>
                </div>
                <p className="text-[11px] text-neutral-400">Deep black background, gold metallic accent, sleek 4px radius buttons.</p>
              </button>

              <button
                onClick={() => applyAiStylePreset("cyber")}
                className="w-full text-left p-3 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-cyan-400 group-hover:underline">⚡ Neon Cyberpunk Glitch</span>
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">PRESET</span>
                </div>
                <p className="text-[11px] text-neutral-400">Electric cyan & magenta glow accents, sharp 0px Swiss borders.</p>
              </button>

              <button
                onClick={() => applyAiStylePreset("clean")}
                className="w-full text-left p-3 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:border-amber-500/50 hover:bg-neutral-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-400 group-hover:underline">🌿 Minimal Frosted Glass</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">PRESET</span>
                </div>
                <p className="text-[11px] text-neutral-400">Pure white background, theme luxury gold accent, soft rounded 16px cards.</p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPresetModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-400 w-4 h-4" /> Save Theme Preset
            </h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Save your custom color palette and styling settings as a reusable theme preset.
            </p>
            <input
              type="text"
              placeholder="Preset Name (e.g. Obsidian Gold)"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full bg-neutral-950 text-white border border-neutral-800 p-3 rounded-xl mb-4 outline-none focus:border-primary font-bold text-xs"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePreset}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold rounded-xl transition-opacity"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {showSectionModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowSectionModal(false)}
              className="absolute top-6 right-6 p-2 bg-muted hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="border-b border-border pb-4 mb-4">
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-foreground">Add Section</h3>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">Select a section category or search below to insert into your page layout.</p>
            </div>

            {/* Instant Section Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={sectionSearchQuery}
                onChange={(e) => setSectionSearchQuery(e.target.value)}
                placeholder="Search sections (e.g. contact form, hero, products, faq, gallery, testimonials)..."
                className="w-full pl-10 pr-12 py-3 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/70"
                autoFocus
              />
              {sectionSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSectionSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground hover:text-foreground cursor-pointer px-1.5 py-0.5 rounded bg-muted"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-6">
              {[
                {
                  category: "Banners & Heroes",
                  icon: "🎯",
                  color: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400",
                  items: [
                    { type: "hero", label: "Hero Banner", desc: "Full hero header with CTA" },
                    { type: "cta-banner", label: "CTA Banner", desc: "Call to action box" },
                    { type: "video-banner", label: "Video Banner", desc: "Video header overlay" },
                    { type: "promo-banner", label: "Promo Banner", desc: "Discount promo banner" },
                  ]
                },
                {
                  category: "Media & Images",
                  icon: "🖼️",
                  color: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
                  items: [
                    { type: "image", label: "Image Only", desc: "Clean responsive image (original ratio)" },
                    { type: "image-text", label: "Image w/ Text", desc: "Image alongside custom text" },
                    { type: "split-content", label: "Split Image & Text", desc: "Half image half text layout" },
                    { type: "gallery", label: "Image Gallery", desc: "Multi-photo grid" },
                    { type: "video", label: "Video Only", desc: "Embedded video player" },
                    { type: "video-text", label: "Video w/ Text", desc: "Video with side text" },
                  ]
                },
                {
                  category: "Products & Commerce",
                  icon: "🛍️",
                  color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                  items: [
                    { type: "pharmacy-catalog", label: "Product / Pharmacy Showcase", desc: "Top banner + product/category carousel" },
                    { type: "featured-products", label: "Featured Products Grid", desc: "Products grid from category" },
                    { type: "categories-grid", label: "Categories Grid", desc: "Collection category cards" },
                    { type: "brand-logos", label: "Brand Logos", desc: "Partner brand logo bar" },
                  ]
                },
                {
                  category: "Content & Text",
                  icon: "📝",
                  color: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
                  items: [
                    { type: "rich-text", label: "Rich Text / HTML", desc: "Formatted text & headings" },
                    { type: "features", label: "Features List", desc: "Feature icon grid" },
                    { type: "faq", label: "FAQ Accordion", desc: "Expandable questions & answers" },
                    { type: "contact-form", label: "Contact Form", desc: "Interactive customer inquiry form with direct channels" },
                  ]
                },
                {
                  category: "Social & Trust",
                  icon: "⭐",
                  color: "border-border bg-muted/40 text-foreground",
                  items: [
                    { type: "testimonials", label: "Testimonials", desc: "Customer review star cards" },
                    { type: "stats", label: "Stats Counter", desc: "Key metric counter numbers" },
                    { type: "team", label: "Team Members", desc: "Staff bio profiles" },
                    { type: "newsletter", label: "Newsletter Signup", desc: "Email subscription box" },
                  ]
                }
              ]
                .map((catGroup) => ({
                  ...catGroup,
                  items: catGroup.items.filter(
                    (item) =>
                      item.label.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                      item.desc.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                      item.type.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                      catGroup.category.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                  )
                }))
                .filter((catGroup) => catGroup.items.length > 0)
                .map((catGroup, cIdx) => (
                <div key={cIdx} className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span>{catGroup.icon}</span> {catGroup.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {catGroup.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          handleAddSection(item.type);
                          setSectionSearchQuery("");
                        }}
                        className={`p-3.5 border rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between group shadow-xs ${catGroup.color}`}
                      >
                        <span className="font-bold text-xs uppercase tracking-wider block mb-1 group-hover:underline">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-sans text-muted-foreground line-clamp-2 leading-tight">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {sectionSearchQuery && [
                {
                  category: "Banners & Heroes",
                  items: [
                    { type: "hero", label: "Hero Banner", desc: "Full hero header with CTA" },
                    { type: "cta-banner", label: "CTA Banner", desc: "Call to action box" },
                    { type: "video-banner", label: "Video Banner", desc: "Video header overlay" },
                    { type: "promo-banner", label: "Promo Banner", desc: "Discount promo banner" },
                  ]
                },
                {
                  category: "Media & Images",
                  items: [
                    { type: "image", label: "Image Only", desc: "Clean responsive image (original ratio)" },
                    { type: "image-text", label: "Image w/ Text", desc: "Image alongside custom text" },
                    { type: "split-content", label: "Split Image & Text", desc: "Half image half text layout" },
                    { type: "gallery", label: "Image Gallery", desc: "Multi-photo grid" },
                    { type: "video", label: "Video Only", desc: "Embedded video player" },
                    { type: "video-text", label: "Video w/ Text", desc: "Video with side text" },
                  ]
                },
                {
                  category: "Products & Commerce",
                  items: [
                    { type: "pharmacy-catalog", label: "Product / Pharmacy Showcase", desc: "Top banner + product/category carousel" },
                    { type: "featured-products", label: "Featured Products Grid", desc: "Products grid from category" },
                    { type: "categories-grid", label: "Categories Grid", desc: "Collection category cards" },
                    { type: "brand-logos", label: "Brand Logos", desc: "Partner brand logo bar" },
                  ]
                },
                {
                  category: "Content & Text",
                  items: [
                    { type: "rich-text", label: "Rich Text / HTML", desc: "Formatted text & headings" },
                    { type: "features", label: "Features List", desc: "Feature icon grid" },
                    { type: "faq", label: "FAQ Accordion", desc: "Expandable questions & answers" },
                    { type: "contact-form", label: "Contact Form", desc: "Interactive customer inquiry form with direct channels" },
                  ]
                },
                {
                  category: "Social & Trust",
                  items: [
                    { type: "testimonials", label: "Testimonials", desc: "Customer review star cards" },
                    { type: "stats", label: "Stats Counter", desc: "Key metric counter numbers" },
                    { type: "team", label: "Team Members", desc: "Staff bio profiles" },
                    { type: "newsletter", label: "Newsletter Signup", desc: "Email subscription box" },
                  ]
                }
              ].flatMap(g => g.items).filter(item =>
                item.label.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                item.desc.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                item.type.toLowerCase().includes(sectionSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="py-12 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-2xl">
                  <p className="text-sm font-bold text-foreground">No sections match &ldquo;{sectionSearchQuery}&rdquo;</p>
                  <p className="text-xs text-muted-foreground">Try searching for keywords like &ldquo;contact&rdquo;, &ldquo;hero&rdquo;, &ldquo;product&rdquo;, or &ldquo;faq&rdquo;.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPageModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
              <FolderPlus className="text-emerald-400 w-4 h-4" /> Create Custom Page
            </h3>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Starter Layout Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full bg-neutral-950 text-white border border-neutral-800 p-2.5 rounded-xl outline-none focus:border-primary font-bold text-xs cursor-pointer mb-1"
                >
                  {PAGE_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>
                      ✨ {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 italic">
                  {PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.desc}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Page Title</label>
                <input
                  type="text"
                  placeholder="e.g. About Us"
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    if (!pageSlug) {
                      setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  className="w-full bg-neutral-950 text-white border border-neutral-800 p-3 rounded-xl outline-none focus:border-primary font-bold text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 mb-1 block">URL Slug</label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">/pages/</span>
                  <input
                    type="text"
                    placeholder="about-us"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    className="w-full bg-transparent p-1 outline-none font-bold text-xs font-mono text-white"
                  />
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-3 space-y-2">
                <label className="text-[10px] font-bold text-primary block uppercase tracking-wider">Navigation Menu</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToHeader}
                      onChange={(e) => setAddToHeader(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    Add to header menu
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToFooter}
                      onChange={(e) => setAddToFooter(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    Add to footer menu
                  </label>
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-3 space-y-3">
                <label className="text-[10px] font-bold text-primary block uppercase tracking-wider">SEO & Metadata</label>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Meta Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Fragrances | About Us"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-neutral-950 text-white border border-neutral-800 p-2.5 rounded-xl outline-none focus:border-primary font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe this page for search engines..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full bg-neutral-950 text-white border border-neutral-800 p-2.5 rounded-xl outline-none focus:border-primary text-xs resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPageModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPage}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold rounded-xl transition-opacity"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // RENDER STUDIO HEADER
  function renderStudioHeader(isDraggable = false) {
    return (
      <div
        onPointerDown={isDraggable ? handlePointerDown : undefined}
        className={`h-14 border-b border-border/50 flex items-center justify-between px-3 shrink-0 select-none bg-card/40 text-card-foreground ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div className="flex items-center gap-2 relative w-full">
          {isDraggable && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50 transition-colors" />
          )}
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles size={14} />
          </div>
          <div>
            <h2 className="font-black text-xs uppercase tracking-widest text-foreground leading-none">Studio</h2>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={exportThemeJSON}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-all hover:scale-105"
            title="Export Theme Settings (JSON)"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-all hover:scale-105"
            title="Import Theme Settings (JSON)"
          >
            <Upload size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={importThemeJSON}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => setDockMode("hidden")}
            className="p-1.5 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors ml-1"
            title="Close Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  // RENDER STUDIO CONTENT & TABS
  function renderStudioContent() {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-card text-card-foreground">

        {/* MAIN NAVIGATION ICON DOCK */}
        {activeSection === null ? (
          <div className="flex items-center justify-center p-2 gap-1.5 border-b border-border/50 shrink-0 bg-muted/20 select-none shadow-inner">
            {[
              { id: "layers", label: "Layers", icon: <Layers size={16} /> },
              { id: "styles", label: "Styles", icon: <Palette size={16} /> },
              { id: "typography", label: "Type", icon: <Type size={16} /> },
              { id: "shapes", label: "Shapes", icon: <Box size={16} /> },
              { id: "layout", label: "Grid", icon: <Grid size={16} /> },
              { id: "announcement", label: "Header & Footer", icon: <Megaphone size={16} /> },
              { id: "custom-css", label: "CSS", icon: <Code size={16} /> }
            ].map(tab => (
              <div key={tab.id} className="relative group">
                <button
                  onClick={() => setActiveTab(tab.id as MainTab)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0 ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary),0.3)] scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105"
                    }`}
                >
                  {tab.icon}
                </button>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-[9px] font-bold uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* SECTION EDITING BREADCRUMB */
          <div className="p-3 border-b border-border flex items-center gap-2.5 shrink-0 bg-muted/40">
            <button
              onClick={() => setActiveSection(null)}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Back to Layers"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex-1 truncate">
              <span className="text-[9px] text-primary font-black uppercase tracking-widest block leading-none mb-1">
                Editing Section
              </span>
              <span className="text-xs font-bold text-foreground block truncate leading-tight">
                {getSectionName(activeSection)}
              </span>
            </div>
          </div>
        )}

        {/* SCROLLABLE FORM CONTROLS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-foreground">

          {/* === TAB 1: LAYERS & SECTIONS === */}
          {activeSection === null && activeTab === "layers" && (
            isCmsPage ? (
              <div className="space-y-4">
                {/* Active Page Customization Banner */}
                <div className="p-3.5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono uppercase font-bold text-emerald-500 tracking-wider block">Customizing Page</span>
                      <h4 className="text-xs font-black text-foreground truncate">{activePageTitleInput || activePage?.label.split(" (")[0]}</h4>
                    </div>
                    <button
                      onClick={() => { setPreviewUrl("/"); setActiveSection(null); }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0 ml-2"
                    >
                      ← Back to Home
                    </button>
                  </div>

                  {((activePage?.slug || "").includes("faq") || (activePage?.url || "").includes("faq")) && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-amber-400">Global FAQs Manager</p>
                        <p className="text-[10px] text-muted-foreground">Manage raw questions & answers in the global Q&A database.</p>
                      </div>
                      <a
                        href="/admin/faqs"
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] rounded-lg transition-colors shadow-sm"
                      >
                        Edit FAQs →
                      </a>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPageSeoAccordion(!showPageSeoAccordion)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-muted/60 hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all cursor-pointer border border-border"
                  >
                    <span>⚙️ Page SEO & Navigation</span>
                    <span className="text-xs">{showPageSeoAccordion ? "▲" : "▼"}</span>
                  </button>

                  {showPageSeoAccordion && (
                    <div className="space-y-3 pt-2 border-t border-border animate-in fade-in duration-200">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Page Title</label>
                        <input
                          type="text"
                          value={activePageTitleInput}
                          onChange={(e) => setActivePageTitleInput(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-2 text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">SEO Meta Title</label>
                        <input
                          type="text"
                          value={activePageMetaTitle}
                          onChange={(e) => setActivePageMetaTitle(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-2 text-xs font-bold outline-none"
                          placeholder="Meta title for Google search..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">SEO Meta Description</label>
                        <textarea
                          rows={2}
                          value={activePageMetaDesc}
                          onChange={(e) => setActivePageMetaDesc(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-2 text-xs outline-none resize-none"
                          placeholder="Meta description..."
                        />
                      </div>
                      <div className="space-y-2 pt-1 border-t border-border">
                        <label className="text-[9px] uppercase font-bold text-primary block">Navigation Menu Placements</label>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer font-semibold">
                          <input
                            type="checkbox"
                            checked={activePageHeaderNav}
                            onChange={(e) => setActivePageHeaderNav(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                          />
                          Show in Header Menu
                        </label>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer font-semibold">
                          <input
                            type="checkbox"
                            checked={activePageFooterNav}
                            onChange={(e) => setActivePageFooterNav(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                          />
                          Show in Footer Menu
                        </label>
                      </div>

                      {!["all", "collections", "home"].includes((activePage?.url || "").replace("/pages/", "").toLowerCase()) && (
                        <div className="pt-2 border-t border-border">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!activePage?.id) return;
                              if (!confirm(`Delete page "${activePageTitleInput || activePage?.label.split(" (")[0]}"? This cannot be undone.`)) return;
                              await deletePageAction(activePage.id);
                              setPreviewUrl("/");
                              setActiveSection(null);
                              window.location.reload();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/30"
                          >
                            <Trash2 size={13} /> Delete This Page
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <BlockBuilder
                  blocks={pageBlocks}
                  setBlocks={(newBlocks) => setPageBlocks(newBlocks)}
                  isSidebar={true}
                />

                <div className="flex gap-2 pt-3 border-t border-neutral-800/60">
                  <button
                    onClick={() => setShowPageModal(true)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors border border-neutral-800 cursor-pointer"
                  >
                    <FolderPlus size={13} /> Add New Page
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">

                {/* FAQ Manager Notification Banner */}
                {previewUrl.includes("faq") && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                    <div>
                      <p className="text-xs font-bold text-amber-400">FAQ Content Manager</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Questions & answers are managed in the Global FAQs manager.</p>
                    </div>
                    <a
                      href="/admin/faqs"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      Edit FAQs →
                    </a>
                  </div>
                )}

                {/* Search Box */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground placeholder-muted-foreground text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Header Section */}
                {(!searchQuery || "header nav announcement announcement-bar navigation".includes(searchQuery.toLowerCase())) && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Header Section</span>
                    <div
                      onClick={() => handleSectionClick("header")}
                      className={`flex items-center justify-between p-3 border rounded-xl hover:border-primary/50 transition-colors cursor-pointer ${
                        activeSection === "header" ? "bg-primary/10 border-primary" : "bg-card border-border shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getSectionIcon("header")}
                        <span className="text-xs font-bold text-foreground truncate">Header Nav & Announcement</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionClick("header");
                        }}
                        className="text-[10px] text-primary font-bold hover:underline px-2.5 py-1 bg-primary/10 rounded-md border border-primary/20 uppercase"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Hero Banner Section */}
                {(!isCmsPage || previewUrl === "/" || previewUrl === "") && (!searchQuery || "hero banner slides perfumes items".includes(searchQuery.toLowerCase())) && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Hero Banner Section</span>
                    <div
                      onClick={() => handleSectionClick("hero")}
                      className={`flex items-center justify-between p-3 border rounded-xl hover:border-primary/50 transition-colors cursor-pointer ${
                        activeSection === "hero" ? "bg-primary/10 border-primary" : "bg-card border-border shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {getSectionIcon("hero")}
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-foreground truncate block">
                            Hero Banner & Slides
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {(settings.heroConfig?.slides || []).length > 0
                              ? `${settings.heroConfig.slides.length} Custom Slide${settings.heroConfig.slides.length > 1 ? "s" : ""} (${settings.heroConfig.slides.map((s: any) => s.title || "Slide").slice(0, 2).join(", ")}${settings.heroConfig.slides.length > 2 ? "..." : ""})`
                              : "Dynamic Store Categories / Slides"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionClick("hero");
                        }}
                        className="text-[10px] text-primary font-bold hover:underline px-2.5 py-1 bg-primary/10 rounded-md border border-primary/20 uppercase shrink-0 ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block">Body Sections</span>
                  {filteredSections.map((sectionId: string, index: number) => {
                    const isHidden = hiddenSections.includes(sectionId);
                    return (
                      <div
                        key={sectionId}
                        className={`flex items-center justify-between p-3 bg-card border rounded-xl transition-all ${isHidden ? "border-border/50 opacity-40" : "border-border hover:border-primary/30 shadow-sm"
                          }`}
                      >
                        <div
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          onClick={() => handleSectionClick(sectionId)}
                        >
                          {getSectionIcon(sectionId)}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold hover:text-primary transition-colors truncate block">
                              {getSectionName(sectionId)}
                            </span>
                            {getSectionTypeLabel(sectionId) && (
                              <span className="text-[10px] text-muted-foreground font-mono truncate block -mt-0.5">
                                {getSectionTypeLabel(sectionId)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <div className="flex flex-col border-r border-neutral-800 pr-1.5 mr-1">
                            <button
                              disabled={sectionOrder.indexOf(sectionId) <= 0}
                              onClick={() => moveSection(sectionOrder.indexOf(sectionId), "up")}
                              className="text-neutral-500 hover:text-neutral-200 disabled:opacity-20 p-0.5"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              disabled={sectionOrder.indexOf(sectionId) >= sectionOrder.length - 1}
                              onClick={() => moveSection(sectionOrder.indexOf(sectionId), "down")}
                              className="text-neutral-500 hover:text-neutral-200 disabled:opacity-20 p-0.5"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                          <button
                            onClick={() => duplicateSection(sectionId)}
                            className="text-neutral-500 hover:text-white p-1"
                            title="Duplicate Section"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => toggleSectionVisibility(sectionId)}
                            className="text-neutral-500 hover:text-white p-1"
                            title={isHidden ? "Show Section" : "Hide Section"}
                          >
                            {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {sectionId.startsWith("custom-section-") && (
                            <button
                              onClick={() => handleDeleteCustomSection(sectionId)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                              title="Delete Block"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(!searchQuery || "footer social links copyright".includes(searchQuery.toLowerCase())) && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block">Footer Section</span>
                    <div
                      onClick={() => handleSectionClick("footer")}
                      className={`flex items-center justify-between p-3 border rounded-xl hover:border-primary/30 transition-colors shadow-sm cursor-pointer ${
                        activeSection === "footer" ? "bg-primary/10 border-primary" : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getSectionIcon("footer")}
                        <span className="text-xs font-bold text-foreground truncate">Footer & Social Links</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionClick("footer");
                        }}
                        className="text-[10px] text-primary font-bold hover:underline px-2.5 py-1 bg-primary/10 rounded-md border border-primary/20 uppercase"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Pages Manager */}
                {pages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Store Pages</span>
                    {pages.map((page: any) => {
                      const isProtectedSystemPage = ["all", "collections", "home"].includes((page.slug || "").toLowerCase().trim());
                      const cleanSlug = (page.slug || "").toLowerCase().trim();
                      const isSystemRoute = ["about", "faq", "contact"].includes(cleanSlug);
                      const isFaq = cleanSlug === "faq" || cleanSlug === "faqs";
                      const pageUrl = isSystemRoute ? `/${cleanSlug}` : `/pages/${page.slug}`;
                      const isActivePage = previewUrl === pageUrl || previewUrl === `/pages/${page.slug}` || (isSystemRoute && previewUrl === `/${cleanSlug}`);
                      return (
                        <div
                          key={page._id}
                          className={`flex items-center justify-between p-3 bg-card border rounded-xl transition-all ${isActivePage ? "border-primary/60 shadow-sm shadow-primary/10" : "border-border hover:border-primary/30 shadow-sm"}`}
                        >
                          <div
                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            onClick={() => { setPreviewUrl(pageUrl); setActiveSection(null); }}
                          >
                            <FileText className="text-emerald-400 w-4 h-4 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold hover:text-primary transition-colors truncate block">{page.title}</span>
                              <span className="text-[9px] text-muted-foreground font-mono truncate block">{pageUrl}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(pageUrl);
                                setActiveSection(null);
                              }}
                              className="text-[10px] font-bold text-primary hover:text-primary-foreground hover:bg-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 transition-all cursor-pointer"
                              title={`Customize ${page.title} in Live Customizer`}
                            >
                              Customize
                            </button>
                            {isFaq && (
                              <a
                                href="/admin/faqs"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-md bg-amber-400/15 border border-amber-400/40 flex items-center gap-1 transition-colors"
                                title="Edit FAQ questions & answers in Global FAQs manager"
                              >
                                Edit FAQs
                              </a>
                            )}
                            <a
                              href={pageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-500 hover:text-white p-1"
                              title="Open page in new tab"
                            >
                              <ExternalLink size={13} />
                            </a>
                            {!isProtectedSystemPage && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete page "${page.title}"? This cannot be undone.`)) return;
                                  await deletePageAction(page._id);
                                  window.location.reload();
                                }}
                                className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                title="Delete Page"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-neutral-800/60">
                  <button
                    onClick={() => setShowSectionModal(true)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors border border-neutral-800"
                  >
                    <PlusCircle size={13} /> Add Block
                  </button>
                  <button
                    onClick={() => setShowPageModal(true)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors border border-neutral-800"
                  >
                    <FolderPlus size={13} /> Add Page
                  </button>
                </div>
              </div>
            )
          )}

          {/* === TAB 2: STYLES & COLORS === */}
          {activeSection === null && activeTab === "styles" && (
            <div className="space-y-5">

              {/* Preset Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Theme Preset</h3>
                  <button
                    onClick={() => setShowPresetModal(true)}
                    className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Save Preset
                  </button>
                </div>
                <select
                  value={settings.activeTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 font-bold text-xs outline-none focus:border-primary"
                >
                  <option value="">Custom Theme</option>
                  {presets.length > 0 && (
                    <optgroup label="Custom User Presets">
                      {presets.map((preset) => (
                        <option key={preset._id} value={preset.name}>✨ {preset.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Color Swatches & Generator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Theme Color Swatches</h3>
                  <button
                    onClick={generateMatchingPalette}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                    title="Generate harmonized colors based on primary"
                  >
                    <Wand2 size={11} /> Auto Palette
                  </button>
                </div>

                {[
                  { key: "primary", label: "Primary Accent" },
                  { key: "secondary", label: "Secondary Theme" },
                  { key: "accent", label: "Glow & Highlights" },
                  { key: "background", label: "Global Background" },
                  { key: "text", label: "Body Text Color" }
                ].map((col) => (
                  <div key={col.key} className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl">
                    <label className="text-xs font-bold text-neutral-300">{col.label}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                        {settings.themeColors?.[col.key] || "#000000"}
                      </span>
                      <input
                        type="color"
                        value={settings.themeColors?.[col.key] || "#000000"}
                        onChange={(e) => updateNestedSetting("themeColors", col.key, e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* === TAB 3: TYPOGRAPHY === */}
          {activeSection === null && activeTab === "typography" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Font Pairing Preset</label>
                <select
                  value={FONT_PAIRS.find(p => p.headingsFont === settings.typography?.headingsFont)?.id || ""}
                  onChange={(e) => handleTypographyChange(e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 font-bold text-xs outline-none"
                >
                  {FONT_PAIRS.map((pair) => (
                    <option key={pair.id} value={pair.id}>{pair.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Base Body Text Size</label>
                <select
                  value={settings.typography?.bodySize || "16px"}
                  onChange={(e) => updateNestedSetting("typography", "bodySize", e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="14px">Small (14px)</option>
                  <option value="15px">Compact (15px)</option>
                  <option value="16px">Standard (16px)</option>
                  <option value="17px">Large (17px)</option>
                  <option value="18px">Reader (18px)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Heading Font Scale</label>
                  <span className="text-[10px] text-primary font-mono font-bold">{settings.typography?.headingsSizeScale || "1.0"}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={settings.typography?.headingsSizeScale || "1.0"}
                  onChange={(e) => updateNestedSetting("typography", "headingsSizeScale", e.target.value)}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                />
              </div>
            </div>
          )}

          {/* === TAB 4: SHAPES & BUTTONS === */}
          {activeSection === null && activeTab === "shapes" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Global Corner Radius</label>
                <select
                  value={settings.borderRadius || "16px"}
                  onChange={(e) => updateNestedSetting("borderRadius", "", e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Button Style Variant</label>
                <select
                  value={settings.buttonStyle?.variant || "solid"}
                  onChange={(e) => updateNestedSetting("buttonStyle", "variant", e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  {BUTTON_VARIANTS.map((b) => (
                    <option key={b.value} value={b.value}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Shadow Intensity</label>
                <select
                  value={settings.buttonStyle?.shadow || "medium"}
                  onChange={(e) => updateNestedSetting("buttonStyle", "shadow", e.target.value)}
                  className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-2.5 text-xs outline-none"
                >
                  {SHADOW_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* === TAB 5: LAYOUT & GRIDS === */}
          {activeSection === null && activeTab === "layout" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Products Grid Columns</label>
                <select
                  value={settings.storefrontLayout?.productGridColumns || "4"}
                  onChange={(e) => updateNestedSetting("storefrontLayout", "productGridColumns", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white outline-none"
                >
                  <option value="2">2 Columns (Large Showcase)</option>
                  <option value="3">3 Columns (Standard Grid)</option>
                  <option value="4">4 Columns (Dense Storefront)</option>
                  <option value="5">5 Columns (Compact Catalog)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Product Card Style</label>
                <select
                  value={settings.storefrontLayout?.productCardStyle || "standard"}
                  onChange={(e) => updateNestedSetting("storefrontLayout", "productCardStyle", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white outline-none"
                >
                  <option value="standard">Standard (Border & Shadow)</option>
                  <option value="minimal">Minimal (Clean Frameless)</option>
                  <option value="glass">Glassmorphism Frosted Card</option>
                  <option value="bordered">Bold Swiss Bordered</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Product Detail Page Layout</label>
                <select
                  value={settings.storefrontLayout?.productPageLayout || "standard"}
                  onChange={(e) => updateNestedSetting("storefrontLayout", "productPageLayout", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white outline-none"
                >
                  <option value="standard">Standard (Classic Stacked)</option>
                  <option value="split">Modern Split View (Gallery Sticky)</option>
                </select>
              </div>
            </div>
          )}

          {/* === TAB 6: ANNOUNCEMENT, HEADER & FOOTER === */}
          {activeSection === null && activeTab === "announcement" && (
            <div className="space-y-5">

              {/* Announcement Bar */}
              <div className="space-y-3 pb-4 border-b border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-sky-400">Announcement Ticker Bar</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] text-neutral-400">Enable</span>
                    <input
                      type="checkbox"
                      checked={settings.announcementBar?.enabled ?? true}
                      onChange={(e) => updateNestedSetting("announcementBar", "enabled", e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Announcement Message</label>
                  <input
                    type="text"
                    value={settings.announcementBar?.text || ""}
                    onChange={(e) => updateNestedSetting("announcementBar", "text", e.target.value)}
                    placeholder="🚀 Free Shipping on orders over $100!"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Badge Tag Text</label>
                    <input
                      type="text"
                      value={settings.announcementBar?.badgeText || ""}
                      onChange={(e) => updateNestedSetting("announcementBar", "badgeText", e.target.value)}
                      placeholder="PROMO"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 mb-1 block">Target URL</label>
                    <input
                      type="text"
                      value={settings.announcementBar?.link || ""}
                      onChange={(e) => updateNestedSetting("announcementBar", "link", e.target.value)}
                      placeholder="/all"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branding & Social Links */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Social Media Links</h3>
                {["facebook", "twitter", "instagram", "tiktok", "youtube"].map((platform) => (
                  <div key={platform}>
                    <label className="text-[10px] font-bold text-neutral-400 mb-1 block capitalize">{platform} URL</label>
                    <input
                      type="text"
                      value={settings.socialLinks?.[platform] || ""}
                      onChange={(e) => updateNestedSetting("socialLinks", platform, e.target.value)}
                      placeholder={`https://${platform}.com/...`}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white outline-none"
                    />
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* === TAB 7: CUSTOM CSS === */}
          {activeSection === null && activeTab === "custom-css" && (
            <div className="space-y-3">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Custom CSS Overrides</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Inject custom CSS rules directly into the storefront.
              </p>
              <textarea
                rows={10}
                value={settings.customCss || ""}
                onChange={(e) => updateNestedSetting("customCss", "", e.target.value)}
                placeholder="/* e.g. .hero-title { text-transform: uppercase; } */"
                className="w-full bg-neutral-950 font-mono border border-neutral-800 rounded-xl p-3 text-xs text-emerald-400 outline-none resize-none focus:border-primary"
              />
            </div>
          )}

          {/* === SECTION DETAIL EDITORS === */}
          {activeSection && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">

              {/* Header Editor */}
              {activeSection === "header" && (
                <>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Header Background Color</label>
                    <div className="flex items-center gap-2 bg-muted border border-border p-2 rounded-xl">
                      <input
                        type="color"
                        value={settings.headerStyle?.backgroundColor || "#ffffff"}
                        onChange={(e) => updateNestedSetting("headerStyle", "backgroundColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Transparent"
                        value={settings.headerStyle?.backgroundColor || ""}
                        onChange={(e) => updateNestedSetting("headerStyle", "backgroundColor", e.target.value)}
                        className="w-full bg-transparent text-xs text-foreground outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Navigation Text Color</label>
                    <div className="flex items-center gap-2 bg-muted border border-border p-2 rounded-xl">
                      <input
                        type="color"
                        value={settings.headerStyle?.textColor || "#000000"}
                        onChange={(e) => updateNestedSetting("headerStyle", "textColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Default Text"
                        value={settings.headerStyle?.textColor || ""}
                        onChange={(e) => updateNestedSetting("headerStyle", "textColor", e.target.value)}
                        className="w-full bg-transparent text-xs text-foreground outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Logo & Brand Alignment</label>
                    <select
                      value={settings.logoAlignment || "left"}
                      onChange={(e) => setSettings((prev: any) => ({ ...prev, logoAlignment: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
                    >
                      <option value="left">Start / Left (Standard)</option>
                      <option value="center">Center (Le Labo Style)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Header Logo Image URL</label>
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={settings.logo || ""}
                      onChange={(e) => setSettings((prev: any) => ({ ...prev, logo: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-mono outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-border space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-2.5 bg-muted/30 border border-border rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">Show Logo in Header</span>
                      <input
                        type="checkbox"
                        checked={settings.showLogo ?? settings.headerStyle?.showLogo ?? false}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSettings((prev: any) => ({
                            ...prev,
                            showLogo: val,
                            headerStyle: { ...(prev.headerStyle || {}), showLogo: val }
                          }));
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-2.5 bg-muted/30 border border-border rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">Show Store Name in Header</span>
                      <input
                        type="checkbox"
                        checked={settings.showStoreName ?? settings.headerStyle?.showStoreName ?? true}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSettings((prev: any) => ({
                            ...prev,
                            showStoreName: val,
                            headerStyle: { ...(prev.headerStyle || {}), showStoreName: val }
                          }));
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Header Links Manager */}
                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        Header Navigation Links ({(settings.headerLinks || []).length})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentLinks = settings.headerLinks || [];
                          setSettings((prev: any) => ({
                            ...prev,
                            headerLinks: [...currentLinks, { label: "New Link", url: "/" }]
                          }));
                        }}
                        className="text-[10px] font-mono font-bold text-primary hover:underline cursor-pointer"
                      >
                        + Add Header Link
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(settings.headerLinks || []).map((hl: any, hlIdx: number) => {
                        const allAvailablePages = [
                          { title: "Home Page", url: "/" },
                          { title: "All Products Catalog", url: "/all" },
                          { title: "All Categories", url: "/collections" },
                          { title: "Shopping Cart", url: "/cart" },
                          ...pages.map((p: any) => ({ title: p.title, url: `/pages/${p.slug}` }))
                        ];
                        return (
                          <div key={hlIdx} className="p-3 bg-background border border-border rounded-xl space-y-2 relative group shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Header Link #{hlIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (settings.headerLinks || []).filter((_: any, i: number) => i !== hlIdx);
                                  setSettings((prev: any) => ({ ...prev, headerLinks: updated }));
                                }}
                                className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                              >
                                ✕ Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Link Title / Label</label>
                                <input
                                  type="text"
                                  value={hl.label || ""}
                                  placeholder="e.g. Products"
                                  onChange={(e) => {
                                    const updated = [...(settings.headerLinks || [])];
                                    updated[hlIdx] = { ...updated[hlIdx], label: e.target.value };
                                    setSettings((prev: any) => ({ ...prev, headerLinks: updated }));
                                  }}
                                  className="w-full bg-muted/60 border border-border rounded-lg p-2 text-xs text-foreground font-semibold outline-none focus:border-primary"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Target Page / URL</label>
                                <div className="space-y-1">
                                  <select
                                    value={hl.url || ""}
                                    onChange={(e) => {
                                      const selectedUrl = e.target.value;
                                      if (!selectedUrl) return;
                                      const updated = [...(settings.headerLinks || [])];

                                      let newLabel = updated[hlIdx].label || "";
                                      const matched = allAvailablePages.find(p => p.url === selectedUrl);
                                      if (matched && (!newLabel.trim() || newLabel === "Link Title" || newLabel === "New Link")) {
                                        newLabel = matched.title;
                                      }

                                      updated[hlIdx] = { ...updated[hlIdx], url: selectedUrl, label: newLabel };
                                      setSettings((prev: any) => ({ ...prev, headerLinks: updated }));
                                    }}
                                    className="w-full bg-muted/60 border border-border rounded-lg p-2 text-xs text-foreground font-bold outline-none cursor-pointer focus:border-primary"
                                  >
                                    <option value="">-- Select Store Page --</option>
                                    <optgroup label="Main Store Pages">
                                      <option value="/">🏠 Home Page ( / )</option>
                                      <option value="/all">🛍️ All Products Catalog ( /all )</option>
                                      <option value="/collections">🏷️ All Categories ( /collections )</option>
                                      <option value="/cart">🛒 Shopping Cart ( /cart )</option>
                                    </optgroup>
                                    {pages.length > 0 && (
                                      <optgroup label="Store Content & Policy Pages">
                                        {pages.map((p: any) => {
                                          const pageUrl = `/pages/${p.slug}`;
                                          return (
                                            <option key={p._id} value={pageUrl}>
                                              📄 {p.title} ({pageUrl})
                                            </option>
                                          );
                                        })}
                                      </optgroup>
                                    )}
                                  </select>

                                  <input
                                    type="text"
                                    value={hl.url || ""}
                                    placeholder="Or type custom URL..."
                                    onChange={(e) => {
                                      const updated = [...(settings.headerLinks || [])];
                                      updated[hlIdx] = { ...updated[hlIdx], url: e.target.value };
                                      setSettings((prev: any) => ({ ...prev, headerLinks: updated }));
                                    }}
                                    className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-[11px] text-muted-foreground font-mono outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Mobile Icon</label>
                                <select
                                  value={hl.icon || "auto"}
                                  onChange={(e) => {
                                    const updated = [...(settings.headerLinks || [])];
                                    updated[hlIdx] = { ...updated[hlIdx], icon: e.target.value };
                                    setSettings((prev: any) => ({ ...prev, headerLinks: updated }));
                                  }}
                                  className="w-full bg-muted/60 border border-border rounded-lg p-2 text-xs text-foreground font-semibold outline-none focus:border-primary"
                                >
                                  <option value="auto">Auto (Detect)</option>
                                  <option value="home">Home (🏠)</option>
                                  <option value="info">Info / About (ℹ️)</option>
                                  <option value="phone">Phone / Contact (📞)</option>
                                  <option value="mail">Mail / Email (✉️)</option>
                                  <option value="shopping-bag">Bag / Shop (🛍️)</option>
                                  <option value="shopping-cart">Cart (🛒)</option>
                                  <option value="user">User / Account (👤)</option>
                                  <option value="heart">Heart / Wishlist (❤️)</option>
                                  <option value="sparkles">Sparkles / New (✨)</option>
                                  <option value="star">Star / Popular (⭐)</option>
                                  <option value="tag">Tag / Offers (🏷️)</option>
                                  <option value="box">Box / Orders (📦)</option>
                                  <option value="chevron-right">Arrow Right (➡️)</option>
                                  <option value="hash">Hash / Default (#️⃣)</option>
                                  <option value="settings">Settings (⚙️)</option>
                                  <option value="message-circle">Message (💬)</option>
                                  <option value="map-pin">Map Pin (📍)</option>
                                  <option value="calendar">Calendar (📅)</option>
                                  <option value="camera">Camera (📷)</option>
                                  <option value="video">Video (🎥)</option>
                                  <option value="music">Music (🎵)</option>
                                  <option value="book">Book (📖)</option>
                                  <option value="file-text">File (📄)</option>
                                  <option value="check-circle">Check (✅)</option>
                                  <option value="alert-circle">Alert (⚠️)</option>
                                  <option value="gift">Gift (🎁)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Hero Editor */}
              {activeSection === "hero" && (
                <div className="space-y-6">
                  {/* Top Bar / Mode Explainer */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Custom Hero Slides
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {(settings.heroConfig?.slides || []).length} Slides
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Customize unlimited hero slides with independent titles, descriptions, CTA buttons, background images, and background videos completely separated from product categories.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAddHeroSlide}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Slide
                      </button>
                      <button
                        type="button"
                        onClick={handleCloneCategoriesToHeroSlides}
                        title="Append store categories without overwriting existing slides"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Append Categories
                      </button>
                    </div>
                  </div>

                  {/* Fallback Notice if empty */}
                  {(!settings.heroConfig?.slides || settings.heroConfig.slides.length === 0) && (
                    <div className="p-5 border border-dashed border-border rounded-2xl text-center space-y-3 bg-muted/20">
                      <p className="text-xs font-bold text-foreground">Currently displaying Store Categories</p>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Your hero banner is currently displaying your store categories (FOR MEN, FOR WOMEN, etc.). Click below to import them into editable slides or start a new slide from scratch.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCloneCategoriesToHeroSlides}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Import Items (FOR MEN, FOR WOMEN)
                        </button>
                        <button
                          type="button"
                          onClick={handleAddHeroSlide}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> + New Slide
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Slides List */}
                  {settings.heroConfig?.slides && settings.heroConfig.slides.length > 0 && (
                    <div className="space-y-3">
                      {settings.heroConfig.slides.map((slide: any, idx: number) => {
                        const isExpanded = expandedSlideIndex === idx;
                        const isImageUploading = uploadingSlideMedia[`${idx}-bannerImage`];
                        const isVideoUploading = uploadingSlideMedia[`${idx}-bannerVideo`];

                        return (
                          <div
                            key={slide._id || idx}
                            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                              isExpanded ? "border-primary/40 bg-card shadow-md" : "border-border bg-muted/20 hover:border-border/80"
                            }`}
                          >
                            {/* Slide Card Header */}
                            <div
                              onClick={() => setExpandedSlideIndex(isExpanded ? null : idx)}
                              className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <span className="w-5 h-5 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-foreground truncate uppercase tracking-wider">
                                  {slide.title || `Untitled Slide ${idx + 1}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveHeroSlide(idx, "up")}
                                  className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === settings.heroConfig.slides.length - 1}
                                  onClick={() => handleMoveHeroSlide(idx, "down")}
                                  className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this slide?")) {
                                      handleDeleteHeroSlide(idx);
                                    }
                                  }}
                                  className="p-1 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                                  title="Delete Slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Slide Expanded Body */}
                            {isExpanded && (
                              <div className="p-4 pt-1 space-y-4 border-t border-border/50 bg-background/50">
                                <div>
                                  <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                                    Slide Title / Heading
                                  </label>
                                  <input
                                    type="text"
                                    value={slide.title || ""}
                                    onChange={(e) => handleUpdateHeroSlide(idx, "title", e.target.value)}
                                    placeholder="e.g. FOR MEN or SUMMER COLLECTION"
                                    className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-bold tracking-wide"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                                    Slide Description / Subtitle
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={slide.subtitle || ""}
                                    onChange={(e) => handleUpdateHeroSlide(idx, "subtitle", e.target.value)}
                                    placeholder="e.g. Luxury perfumes crafted for distinction..."
                                    className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none resize-none leading-relaxed"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                                      Button Text
                                    </label>
                                    <input
                                      type="text"
                                      value={slide.buttonText || ""}
                                      onChange={(e) => handleUpdateHeroSlide(idx, "buttonText", e.target.value)}
                                      placeholder="View more"
                                      className="w-full bg-muted border border-border rounded-xl p-2 text-xs text-foreground outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                                      Button Link
                                    </label>
                                    <input
                                      type="text"
                                      value={slide.link || ""}
                                      onChange={(e) => handleUpdateHeroSlide(idx, "link", e.target.value)}
                                      placeholder="/collections"
                                      className="w-full bg-muted border border-border rounded-xl p-2 text-xs text-foreground outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Background Media */}
                                <div className="space-y-3 pt-2 border-t border-border/40">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                          <ImageIcon className="w-3 h-3" /> Background Image
                                        </label>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground font-mono font-medium border border-border/50">
                                          Rec: 16:9 (1920×1080)
                                        </span>
                                      </div>
                                      <label className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
                                        <Upload className="w-2.5 h-2.5" />
                                        {isImageUploading ? "Uploading..." : "Upload"}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          disabled={isImageUploading}
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadHeroSlideMedia(idx, "bannerImage", f);
                                          }}
                                        />
                                      </label>
                                    </div>
                                    <input
                                      type="text"
                                      value={slide.bannerImage || ""}
                                      onChange={(e) => handleUpdateHeroSlide(idx, "bannerImage", e.target.value)}
                                      placeholder="https://... or upload above"
                                      className="w-full bg-muted border border-border rounded-xl p-2 text-xs text-foreground outline-none font-mono"
                                    />
                                    {slide.bannerImage && (
                                      <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-border bg-black/40">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={slide.bannerImage}
                                          alt={slide.title || "Preview"}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Video className="w-3 h-3" /> Background Video (MP4)
                                      </label>
                                      <label className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
                                        <Upload className="w-2.5 h-2.5" />
                                        {isVideoUploading ? "Uploading..." : "Upload"}
                                        <input
                                          type="file"
                                          accept="video/mp4,video/webm,video/quicktime"
                                          disabled={isVideoUploading}
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadHeroSlideMedia(idx, "bannerVideo", f);
                                          }}
                                        />
                                      </label>
                                    </div>
                                    <input
                                      type="text"
                                      value={slide.bannerVideo || ""}
                                      onChange={(e) => handleUpdateHeroSlide(idx, "bannerVideo", e.target.value)}
                                      placeholder="https://... (MP4 video URL) or upload"
                                      className="w-full bg-muted border border-border rounded-xl p-2 text-xs text-foreground outline-none font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reset Option */}
                  {settings.heroConfig?.slides && settings.heroConfig.slides.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Reset slides back to store categories? Custom slides will be cleared.")) {
                            updateNestedSetting("heroConfig", "slides", []);
                          }
                        }}
                        className="w-full text-center text-[11px] text-muted-foreground hover:text-destructive py-2 transition-colors cursor-pointer"
                      >
                        Reset to Store Categories Fallback
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Collections & Product Grids Editor */}
              {(activeSection === "categories" || activeSection === "best-products" || activeSection === "customize-1" || activeSection === "customize-2") && (
                <>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Section Heading</label>
                    <input
                      type="text"
                      value={
                        (activeSection === "categories" ? settings.featuredCategoriesSection?.heading :
                          activeSection === "best-products" ? settings.bestProductsSection?.heading :
                            activeSection === "customize-1" ? settings.featuredProductsSection2?.heading :
                              settings.featuredProductsSection3?.heading) || ""
                      }
                      onChange={(e) => {
                        if (activeSection === "categories") updateNestedSetting("featuredCategoriesSection", "heading", e.target.value);
                        if (activeSection === "best-products") updateNestedSetting("bestProductsSection", "heading", e.target.value);
                        if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "heading", e.target.value);
                        if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "heading", e.target.value);
                      }}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-bold"
                    />
                  </div>

                  {activeSection !== "categories" && (
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Category Collection Filter</label>
                      <select
                        value={
                          (activeSection === "best-products" ? "" :
                            activeSection === "customize-1" ? settings.featuredProductsSection2?.category :
                              settings.featuredProductsSection3?.category) || ""
                        }
                        onChange={(e) => {
                          if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "category", e.target.value);
                          if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "category", e.target.value);
                        }}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none"
                      >
                        <option value="">All Products</option>
                        {categories.map((cat: any) => (
                          <option key={cat._id} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Display Items Limit</label>
                      <span className="text-[10px] text-primary font-bold font-mono">
                        {(activeSection === "categories" ? settings.featuredCategoriesSection?.limit :
                          activeSection === "best-products" ? settings.bestProductsSection?.limit :
                            activeSection === "customize-1" ? settings.featuredProductsSection2?.limit :
                              settings.featuredProductsSection3?.limit) || 8} items
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      step="1"
                      value={
                        (activeSection === "categories" ? settings.featuredCategoriesSection?.limit :
                          activeSection === "best-products" ? settings.bestProductsSection?.limit :
                            activeSection === "customize-1" ? settings.featuredProductsSection2?.limit :
                              settings.featuredProductsSection3?.limit) || 8
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (activeSection === "categories") updateNestedSetting("featuredCategoriesSection", "limit", val);
                        if (activeSection === "best-products") updateNestedSetting("bestProductsSection", "limit", val);
                        if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "limit", val);
                        if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "limit", val);
                      }}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>

                  {/* ADVANCED COLLECTION SPACING */}
                  <div className="pt-2 border-t border-border/50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Advanced Spacing & FX</h4>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Pad Top</label>
                          <span className="text-[9px] font-mono">
                            {(activeSection === "categories" ? settings.featuredCategoriesSection?.paddingTop :
                              activeSection === "best-products" ? settings.bestProductsSection?.paddingTop :
                                activeSection === "customize-1" ? settings.featuredProductsSection2?.paddingTop :
                                  settings.featuredProductsSection3?.paddingTop) || 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0" max="120" step="4"
                          value={
                            (activeSection === "categories" ? settings.featuredCategoriesSection?.paddingTop :
                              activeSection === "best-products" ? settings.bestProductsSection?.paddingTop :
                                activeSection === "customize-1" ? settings.featuredProductsSection2?.paddingTop :
                                  settings.featuredProductsSection3?.paddingTop) || 0
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (activeSection === "categories") updateNestedSetting("featuredCategoriesSection", "paddingTop", val);
                            if (activeSection === "best-products") updateNestedSetting("bestProductsSection", "paddingTop", val);
                            if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "paddingTop", val);
                            if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "paddingTop", val);
                          }}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Pad Bottom</label>
                          <span className="text-[9px] font-mono">
                            {(activeSection === "categories" ? settings.featuredCategoriesSection?.paddingBottom :
                              activeSection === "best-products" ? settings.bestProductsSection?.paddingBottom :
                                activeSection === "customize-1" ? settings.featuredProductsSection2?.paddingBottom :
                                  settings.featuredProductsSection3?.paddingBottom) || 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0" max="120" step="4"
                          value={
                            (activeSection === "categories" ? settings.featuredCategoriesSection?.paddingBottom :
                              activeSection === "best-products" ? settings.bestProductsSection?.paddingBottom :
                                activeSection === "customize-1" ? settings.featuredProductsSection2?.paddingBottom :
                                  settings.featuredProductsSection3?.paddingBottom) || 0
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (activeSection === "categories") updateNestedSetting("featuredCategoriesSection", "paddingBottom", val);
                            if (activeSection === "best-products") updateNestedSetting("bestProductsSection", "paddingBottom", val);
                            if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "paddingBottom", val);
                            if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "paddingBottom", val);
                          }}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Entrance Animation</label>
                      <select
                        value={
                          (activeSection === "categories" ? settings.featuredCategoriesSection?.animation :
                            activeSection === "best-products" ? settings.bestProductsSection?.animation :
                              activeSection === "customize-1" ? settings.featuredProductsSection2?.animation :
                                settings.featuredProductsSection3?.animation) || "none"
                        }
                        onChange={(e) => {
                          if (activeSection === "categories") updateNestedSetting("featuredCategoriesSection", "animation", e.target.value);
                          if (activeSection === "best-products") updateNestedSetting("bestProductsSection", "animation", e.target.value);
                          if (activeSection === "customize-1") updateNestedSetting("featuredProductsSection2", "animation", e.target.value);
                          if (activeSection === "customize-2") updateNestedSetting("featuredProductsSection3", "animation", e.target.value);
                        }}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none"
                      >
                        <option value="none">None</option>
                        <option value="fade-in">Fade In</option>
                        <option value="slide-up">Slide Up</option>
                        <option value="scale-in">Scale In</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Testimonials & Reviews Editor */}
              {(activeSection === "testimonials" || activeSection === "celebrity-reviews") && (
                <>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Heading Text</label>
                    <input
                      type="text"
                      value={(activeSection === "testimonials" ? settings.testimonialsSection?.heading : settings.celebrityReviewsSection?.heading) || ""}
                      onChange={(e) => {
                        if (activeSection === "testimonials") updateNestedSetting("testimonialsSection", "heading", e.target.value);
                        else updateNestedSetting("celebrityReviewsSection", "heading", e.target.value);
                      }}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-bold"
                    />
                  </div>
                </>
              )}

              {/* Product Related Products Editor */}
              {activeSection === "product-related-products" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Enable Related Products</span>
                      <span className="text-[10px] text-muted-foreground">Show related products on product pages</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.relatedProductsSection?.enabled ?? true}
                      onChange={(e) => updateNestedSetting("relatedProductsSection", "enabled", e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Section Heading</label>
                    <input
                      type="text"
                      value={settings.relatedProductsSection?.heading ?? "Related Products"}
                      onChange={(e) => updateNestedSetting("relatedProductsSection", "heading", e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-bold"
                      placeholder="Related Products"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Subheading (Optional)</label>
                    <input
                      type="text"
                      value={settings.relatedProductsSection?.subheading ?? "You might also like"}
                      onChange={(e) => updateNestedSetting("relatedProductsSection", "subheading", e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none"
                      placeholder="e.g. Complete your fragrance collection"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Display Items Limit</label>
                      <span className="text-[10px] text-primary font-bold font-mono">
                        {settings.relatedProductsSection?.limit ?? 4} items
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="2"
                      value={settings.relatedProductsSection?.limit ?? 4}
                      onChange={(e) => updateNestedSetting("relatedProductsSection", "limit", Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-muted/40 border border-border/60 rounded-xl">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      💡 <strong>Smart Recommendations:</strong> Products from the same collection are automatically recommended. You can also customize manual related products per item in the <a href="/admin/products" target="_blank" className="text-primary underline">Products Editor</a>.
                    </p>
                  </div>
                </div>
              )}

              {/* Badges & Payment Section Editor */}
              {(activeSection === "badges" || activeSection === "payment-badges") && (
                <div className="space-y-6">
                  {/* Trust Badges Config */}
                  <div className="space-y-4 border-b border-border pb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Trust Badges Settings</h3>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                        Free Shipping Threshold Limit (AED)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.freeShippingThreshold ?? 500}
                        onChange={(e) => updateNestedSetting("", "freeShippingThreshold", Number(e.target.value))}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-bold"
                        placeholder="500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Badge 1: Free Shipping Title</label>
                      <input
                        type="text"
                        value={settings.badgesConfig?.item1 || "Free Shipping"}
                        onChange={(e) => updateNestedSetting("badgesConfig", "item1", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Badge 2: Guarantee Title</label>
                      <input
                        type="text"
                        value={settings.badgesConfig?.item2 || "15-Day Returns"}
                        onChange={(e) => updateNestedSetting("badgesConfig", "item2", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Badge 3: Support Title</label>
                      <input
                        type="text"
                        value={settings.badgesConfig?.item3 || "24/7 Support"}
                        onChange={(e) => updateNestedSetting("badgesConfig", "item3", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Payment Badges Section Config */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Payment Badges Display</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.enabled !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "enabled", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold uppercase">Enable</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Badge Display Location</label>
                      <select
                        value={settings.paymentBadgesSection?.position || "footer"}
                        onChange={(e) => updateNestedSetting("paymentBadgesSection", "position", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
                      >
                        <option value="footer">📌 Footer Bottom Bar Only (Single / Clean)</option>
                        <option value="banner">📢 Banner Above Footer Only</option>
                        <option value="both">🔄 Show in Both (Banner & Footer)</option>
                        <option value="hidden">🚫 Hide Everywhere</option>
                      </select>
                    </div>

                    {settings.paymentBadgesSection?.position === "banner" || settings.paymentBadgesSection?.position === "both" ? (
                      <>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Banner Heading</label>
                          <input
                            type="text"
                            value={settings.paymentBadgesSection?.heading || "Accepted Payment Methods"}
                            onChange={(e) => updateNestedSetting("paymentBadgesSection", "heading", e.target.value)}
                            className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Banner Subheading</label>
                          <input
                            type="text"
                            value={settings.paymentBadgesSection?.subheading || "Safe, instant & 100% encrypted checkout options"}
                            onChange={(e) => updateNestedSetting("paymentBadgesSection", "subheading", e.target.value)}
                            className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium"
                          />
                        </div>
                      </>
                    ) : null}

                    <div className="space-y-2 pt-2 border-t border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Visible Payment Icons</span>

                      <label className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border cursor-pointer">
                        <span className="text-xs font-bold">Cash on Delivery (COD)</span>
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.showCOD !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "showCOD", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border cursor-pointer">
                        <span className="text-xs font-bold">Credit / Debit Cards (Visa, MC)</span>
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.showCard !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "showCard", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border cursor-pointer">
                        <span className="text-xs font-bold">Google Pay (GPay)</span>
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.showGPay !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "showGPay", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border cursor-pointer">
                        <span className="text-xs font-bold">Apple Pay</span>
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.showApplePay !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "showApplePay", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border cursor-pointer">
                        <span className="text-xs font-bold">Bank Transfer / Mobile Wallet</span>
                        <input
                          type="checkbox"
                          checked={settings.paymentBadgesSection?.showManual !== false}
                          onChange={(e) => updateNestedSetting("paymentBadgesSection", "showManual", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Rich Text Editor (CMS Pages) */}
              {activeSection.startsWith("rich-text-") && (() => {
                const parts = activeSection.split("-");
                const index = parseInt(parts[parts.length - 1]);
                const block = pageBlocks[index];
                if (!block) return null;

                const updateBlockData = (key: string, value: string) => {
                  const newBlocks = [...pageBlocks];
                  newBlocks[index] = {
                    ...newBlocks[index],
                    blockData: { ...newBlocks[index].blockData, [key]: value }
                  };
                  setPageBlocks(newBlocks);
                };

                return (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Heading</label>
                      <input
                        type="text"
                        value={block.blockData?.heading || ""}
                        onChange={(e) => updateBlockData("heading", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Body Content</label>
                      <textarea
                        rows={6}
                        value={block.blockData?.body || ""}
                        onChange={(e) => updateBlockData("body", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Alignment</label>
                      <select
                        value={block.blockData?.alignment || "center"}
                        onChange={(e) => updateBlockData("alignment", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none"
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Centered</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>
                  </>
                );
              })()}

              {/* Image with Text Editor (CMS & Storefront Blocks) */}
              {(activeSection.includes("image-text") || activeSection.includes("split-content") || activeSection.includes("image-with-text")) && (() => {
                let blockData: any = {};
                let updateData: (key: string, value: any) => void;

                if (isCmsPage) {
                  const parts = activeSection.split("-");
                  const index = parseInt(parts[parts.length - 1]);
                  const block = pageBlocks[index];
                  blockData = block?.blockData || {};
                  updateData = (key: string, value: any) => {
                    const newBlocks = [...pageBlocks];
                    if (newBlocks[index]) {
                      newBlocks[index] = {
                        ...newBlocks[index],
                        blockData: { ...newBlocks[index].blockData, [key]: value }
                      };
                      setPageBlocks(newBlocks);
                    }
                  };
                } else {
                  blockData = settings.imageTextConfig?.[activeSection] || {
                    heading: "Discover the Details",
                    content: "A deep dive into what makes our collection unique. Experience the standard of quality.",
                    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070",
                    imagePosition: "left"
                  };
                  updateData = (key: string, value: any) => {
                    updateNestedSetting("imageTextConfig", activeSection, {
                      ...(settings.imageTextConfig?.[activeSection] || blockData),
                      [key]: value
                    });
                  };
                }

                return (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Heading</label>
                      <input
                        type="text"
                        value={blockData.heading || ""}
                        onChange={(e) => updateData("heading", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Body Content</label>
                      <textarea
                        rows={5}
                        value={blockData.content || blockData.body || ""}
                        onChange={(e) => updateData("content", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Image URL</label>
                      <input
                        type="text"
                        value={blockData.image || ""}
                        onChange={(e) => updateData("image", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-mono"
                      />
                      {blockData.image && (
                        <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-border relative bg-muted">
                          <img src={blockData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Image Position</label>
                      <select
                        value={blockData.imagePosition || "left"}
                        onChange={(e) => updateData("imagePosition", e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
                      >
                        <option value="left">Left Side</option>
                        <option value="right">Right Side</option>
                      </select>
                    </div>
                  </>
                );
              })()}

              {/* Custom HTML & Cloned Section Editor */}
              {(activeSection === "custom-html" || (activeSection.includes("-copy-") && !isCmsPage)) && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Block Display Label</label>
                    <input
                      type="text"
                      value={settings.customHtmlConfig?.[activeSection]?.title || getSectionName(activeSection)}
                      onChange={(e) => updateNestedSetting("customHtmlConfig", activeSection, {
                        ...(settings.customHtmlConfig?.[activeSection] || {}),
                        title: e.target.value
                      })}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Custom HTML Content</label>
                    <textarea
                      rows={8}
                      value={
                        settings.customHtmlConfig?.[activeSection]?.content ||
                        `<div className="py-12 text-center bg-muted/20 border-y border-border rounded-2xl p-6"><h3 className="text-xl font-bold uppercase tracking-widest">${getSectionName(activeSection)}</h3><p className="text-xs text-muted-foreground mt-2">Custom block code loaded from Studio Customizer.</p></div>`
                      }
                      onChange={(e) => updateNestedSetting("customHtmlConfig", activeSection, {
                        ...(settings.customHtmlConfig?.[activeSection] || {}),
                        content: e.target.value
                      })}
                      className="w-full bg-muted font-mono border border-border rounded-xl p-3 text-xs text-emerald-400 outline-none resize-none focus:border-primary"
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => toggleSectionVisibility(activeSection)}
                      className="px-3 py-1.5 bg-muted hover:bg-accent text-xs font-bold rounded-lg text-foreground transition-colors"
                    >
                      {hiddenSections.includes(activeSection) ? "Show Section" : "Hide Section"}
                    </button>
                    <button
                      onClick={() => {
                        const newOrder = sectionOrder.filter((sId: string) => sId !== activeSection);
                        updateNestedSetting("storefrontLayout", "sectionOrder", newOrder);
                        setActiveSection(null);
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-colors border border-rose-500/20"
                    >
                      Delete Section
                    </button>
                  </div>
                </>
              )}

              {/* Dynamic Section Info */}
              {activeSection.startsWith("custom-section-") && (() => {
                const customId = activeSection.split("custom-section-")[1].split(":::")[0];
                const activeCustomSection = homeCustomSections.find(s => String(s._id) === customId);

                if (!activeCustomSection) return null;

                return (
                  <div className="bg-background rounded-xl border border-border overflow-hidden">
                    <BlockBuilder
                      blocks={[{ blockType: activeCustomSection.blockType, blockData: activeCustomSection.blockData || {} }]}
                      setBlocks={async (newBlocks) => {
                        if (newBlocks.length > 0) {
                          const updatedData = newBlocks[0].blockData;

                          setHomeCustomSections(prev => prev.map(s =>
                            String(s._id) === customId ? { ...s, blockData: updatedData } : s
                          ));

                          setDirtySections(prev => new Set(prev).add(customId));
                        }
                      }}
                      isSidebar={true}
                      hideHeader={true}
                      hideAdditions={true}
                      hideToolbar={true}
                    />

                    <div className="p-4 bg-muted/30 border-t border-border">
                      <button
                        onClick={() => {
                          const newOrder = sectionOrder.filter((sId: string) => sId !== activeSection);
                          updateNestedSetting("storefrontLayout", "sectionOrder", newOrder);
                          setActiveSection(null);
                        }}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-colors border border-rose-500/20 w-full"
                      >
                        Remove Block from Layout
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Footer Editor */}
              {activeSection === "footer" && (() => {
                const currentWidgets = settings.footerWidgets && settings.footerWidgets.length > 0
                  ? settings.footerWidgets
                  : [
                    {
                      title: "Customer Care",
                      links: [
                        { label: "Help Center", url: "/contact" },
                        { label: "Shipping & Delivery", url: "/pages/shipping-and-delivery" },
                        { label: "Returns & Refunds", url: "/pages/return-refund-policy" },
                        { label: "Track Your Order", url: "/track-order" },
                        { label: "Contact Us", url: "/contact" }
                      ]
                    },
                    {
                      title: "Information",
                      links: [
                        { label: "About Us", url: "/about" },
                        { label: "Terms & Conditions", url: "/pages/terms-of-service" },
                        { label: "Privacy Policy", url: "/pages/privacy-policy" },
                        { label: "Certificates & Awards", url: "/pages/certificates-and-awards" },
                        { label: "Global FAQs", url: "/faq" }
                      ]
                    },
                    {
                      title: "Quick Links",
                      links: [
                        { label: "All Collections", url: "/collections" },
                        { label: "Best Sellers", url: "/all" },
                        { label: "New Arrivals", url: "/all" },
                        { label: "Testimonials", url: "/pages/testimonials" }
                      ]
                    }
                  ];

                const updateWidgets = (newWidgets: any[]) => {
                  setSettings((prev: any) => {
                    const updated = {
                      ...prev,
                      footerWidgets: newWidgets
                    };
                    pushStateToHistory(updated);
                    return updated;
                  });
                };

                return (
                  <div className="space-y-6">
                    {/* 1. Layout & Style */}
                    <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Layers size={14} className="text-primary" /> Footer Layout & Appearance
                        </span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">Layout Style</label>
                        <select
                          value={settings.footerStyle?.layout || "ecommerce-pro"}
                          onChange={(e) => updateNestedSetting("footerStyle", "layout", e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
                        >
                          <option value="ecommerce-pro">Modern Multicolumn Grid (Recommended)</option>
                          <option value="luxury-split">Luxury Centered Minimal</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. Clean Visibility Controls (Enable / Disable) */}
                    <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-border">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Eye size={14} className="text-primary" /> Display Elements (Show / Hide)
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">Clean UI Toggles</span>
                      </div>

                      <div className="space-y-2">
                        {/* Newsletter Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">📩</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Newsletter Box</div>
                              <div className="text-[10px] text-muted-foreground">Email signup form & heading</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showNewsletter !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showNewsletter", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Brand Column Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">🏷️</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Brand Column</div>
                              <div className="text-[10px] text-muted-foreground">Store logo & description bio</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showBrand !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showBrand", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Navigation Links Columns Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">🧭</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Navigation Link Columns</div>
                              <div className="text-[10px] text-muted-foreground">Category & policy link lists</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showLinks !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showLinks", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Contact Email Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">✉️</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Contact Email</div>
                              <div className="text-[10px] text-muted-foreground">Customer support email address</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showEmail !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showEmail", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Contact Phone Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">📞</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Contact Phone</div>
                              <div className="text-[10px] text-muted-foreground">Phone or WhatsApp hotline</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showPhone !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showPhone", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Address / Location Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">📍</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Address / Country</div>
                              <div className="text-[10px] text-muted-foreground">Physical boutique location or country</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showAddress !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showAddress", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Social Media Icons Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">🌐</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Social Media Icons</div>
                              <div className="text-[10px] text-muted-foreground">Instagram, TikTok, WhatsApp, etc.</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showSocials !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showSocials", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Payment Badges Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">💳</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Official Payment Badges</div>
                              <div className="text-[10px] text-muted-foreground">Visa, Mastercard, COD, Apple Pay</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showPaymentBadges !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showPaymentBadges", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>

                        {/* Copyright Bar Toggle */}
                        <label className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">⚖️</span>
                            <div>
                              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Copyright Notice Bar</div>
                              <div className="text-[10px] text-muted-foreground">Bottom copyright text & legal year</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.footerStyle?.showCopyright !== false}
                            onChange={(e) => updateNestedSetting("footerStyle", "showCopyright", e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* 3. Newsletter Content Options */}
                    {settings.footerStyle?.showNewsletter !== false && (
                      <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Mail size={14} className="text-primary" /> Newsletter Settings
                        </span>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Heading Title</label>
                          <input
                            type="text"
                            value={settings.footerStyle?.newsletterHeading ?? "Newsletter"}
                            onChange={(e) => updateNestedSetting("footerStyle", "newsletterHeading", e.target.value)}
                            placeholder="Newsletter"
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-semibold outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Subtitle / Tagline (Optional)</label>
                          <input
                            type="text"
                            value={settings.footerStyle?.newsletterSubtitle ?? ""}
                            onChange={(e) => updateNestedSetting("footerStyle", "newsletterSubtitle", e.target.value)}
                            placeholder="Subscribe to receive exclusive offers and private reserves."
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. Contact Information & Address */}
                    {(settings.footerStyle?.showEmail !== false || settings.footerStyle?.showPhone !== false || settings.footerStyle?.showAddress !== false) && (
                      <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <MapPin size={14} className="text-primary" /> Contact Details & Address
                        </span>
                        
                        {settings.footerStyle?.showEmail !== false && (
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Customer Support Email</label>
                            <input
                              type="email"
                              value={settings.contact?.email || ""}
                              onChange={(e) => updateNestedSetting("contact", "email", e.target.value)}
                              placeholder="info@yadgariperfumes.com"
                              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-mono outline-none focus:border-primary"
                            />
                          </div>
                        )}

                        {settings.footerStyle?.showPhone !== false && (
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Contact Phone Number</label>
                            <input
                              type="text"
                              value={settings.contact?.phone || ""}
                              onChange={(e) => updateNestedSetting("contact", "phone", e.target.value)}
                              placeholder="+971 55 434 3102"
                              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-mono outline-none focus:border-primary"
                            />
                          </div>
                        )}

                        {settings.footerStyle?.showAddress !== false && (
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Physical Address / Country</label>
                            <input
                              type="text"
                              value={settings.physicalAddress || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSettings((prev: any) => {
                                  const updated = { ...prev, physicalAddress: val };
                                  pushStateToHistory(updated);
                                  return updated;
                                });
                              }}
                              placeholder="UNITED ARAB EMIRATES"
                              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-semibold uppercase outline-none focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Social Media Links */}
                    {settings.footerStyle?.showSocials !== false && (
                      <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <Share2 size={14} className="text-primary" /> Social Media Links
                          </span>
                          <span className="text-[10px] text-muted-foreground">Toggle visibility per platform</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { key: "instagram", toggleKey: "showInstagram", label: "Instagram", placeholder: "https://instagram.com/yadgariperfumes" },
                            { key: "whatsapp", toggleKey: "showWhatsapp", label: "WhatsApp", placeholder: "+971554343102 or https://wa.me/971554343102" },
                            { key: "tiktok", toggleKey: "showTiktok", label: "TikTok", placeholder: "https://tiktok.com/@yadgariperfumes" },
                            { key: "facebook", toggleKey: "showFacebook", label: "Facebook", placeholder: "https://facebook.com/yadgariperfumes" },
                            { key: "twitter", toggleKey: "showTwitter", label: "Twitter / X", placeholder: "https://x.com/yadgariperfumes" },
                            { key: "youtube", toggleKey: "showYoutube", label: "YouTube", placeholder: "https://youtube.com/@yadgariperfumes" },
                          ].map((item) => {
                            const isEnabled = settings.footerStyle?.[item.toggleKey] !== false;
                            return (
                              <div key={item.key} className="space-y-1.5 p-2.5 rounded-xl bg-background border border-border">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    {item.label}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => updateNestedSetting("footerStyle", item.toggleKey, !isEnabled)}
                                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                                      isEnabled
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                                    }`}
                                  >
                                    {isEnabled ? "Visible" : "Hidden"}
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={settings.socialLinks?.[item.key] || ""}
                                  onChange={(e) => updateNestedSetting("socialLinks", item.key, e.target.value)}
                                  placeholder={item.placeholder}
                                  className="w-full bg-muted/40 border border-border rounded-lg p-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 6. Copyright & Payment Badges Placement */}
                    <div className="p-3.5 bg-muted/30 rounded-2xl border border-border space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <FileText size={14} className="text-primary" /> Copyright & Badges Placement
                      </span>

                      {settings.footerStyle?.showCopyright !== false && (
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Copyright Notice Text</label>
                          <input
                            type="text"
                            value={settings.footerCopyright ?? settings.footerStyle?.copyrightText ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSettings((prev: any) => {
                                const updated = {
                                  ...prev,
                                  footerCopyright: val,
                                  footerStyle: { ...(prev.footerStyle || {}), copyrightText: val }
                                };
                                pushStateToHistory(updated);
                                return updated;
                              });
                            }}
                            placeholder="© 2026 Store Name. All Rights Reserved."
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground outline-none font-medium focus:border-primary"
                          />
                        </div>
                      )}

                      {settings.footerStyle?.showPaymentBadges !== false && (
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Payment Badges Placement</label>
                          <select
                            value={settings.paymentBadgesSection?.position || "footer"}
                            onChange={(e) => updateNestedSetting("paymentBadgesSection", "position", e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
                          >
                            <option value="footer">📌 Show in Footer Bottom Bar Only (Clean / Single)</option>
                            <option value="banner">📢 Show as Banner Above Footer</option>
                            <option value="both">🔄 Show in Both (Banner & Footer)</option>
                            <option value="hidden">🚫 Hide Payment Badges Completely</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* 7. Footer Navigation Columns */}
                    {settings.footerStyle?.showLinks !== false && (
                      <div className="space-y-4 pt-2 border-t border-border">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            Footer Link Columns ({currentWidgets.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateWidgets([...currentWidgets, { title: "New Column", links: [{ label: "New Link", url: "/" }] }]);
                            }}
                            className="text-[10px] font-mono font-bold text-primary hover:underline cursor-pointer"
                          >
                            + Add Column
                          </button>
                        </div>

                        <div className="space-y-3">
                          {currentWidgets.map((w: any, wIdx: number) => (
                            <div key={wIdx} className="bg-muted/40 p-3 rounded-2xl border border-border space-y-3 relative group">
                              <button
                                type="button"
                                onClick={() => {
                                  updateWidgets(currentWidgets.filter((_: any, i: number) => i !== wIdx));
                                }}
                                aria-label="Remove Column"
                                className="absolute top-2 right-2 text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Column Title</label>
                                <input
                                  type="text"
                                  value={w.title || ""}
                                  onChange={(e) => {
                                    const updated = [...currentWidgets];
                                    updated[wIdx] = { ...updated[wIdx], title: e.target.value };
                                    updateWidgets(updated);
                                  }}
                                  className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold text-foreground outline-none"
                                />
                              </div>

                              <div className="space-y-2 pt-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-[9px] uppercase font-bold text-muted-foreground">Links ({(w.links || []).length})</label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...currentWidgets];
                                      const links = [...(updated[wIdx].links || []), { label: "Link Title", url: "/" }];
                                      updated[wIdx] = { ...updated[wIdx], links };
                                      updateWidgets(updated);
                                    }}
                                    className="text-[9px] font-mono font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    + Link
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  {(w.links || []).map((l: any, lIdx: number) => {
                                    const allAvailablePages = [
                                      { title: "Home Page", url: "/" },
                                      { title: "All Products Catalog", url: "/pages/all" },
                                      { title: "All Categories", url: "/pages/collections" },
                                      { title: "Shopping Cart", url: "/cart" },
                                      ...pages.map((p: any) => ({ title: p.title, url: `/pages/${p.slug}` }))
                                    ];
                                    return (
                                      <div key={lIdx} className="p-3 bg-background border border-border rounded-xl space-y-2 relative group shadow-2xs">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Link #{lIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...currentWidgets];
                                              const links = updated[wIdx].links.filter((_: any, i: number) => i !== lIdx);
                                              updated[wIdx] = { ...updated[wIdx], links };
                                              updateWidgets(updated);
                                            }}
                                            className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                                          >
                                            ✕ Remove
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Link Title / Label</label>
                                            <input
                                              type="text"
                                              value={l.label || ""}
                                              placeholder="e.g. Shipping Policy"
                                              onChange={(e) => {
                                                const updated = [...currentWidgets];
                                                const links = [...updated[wIdx].links];
                                                links[lIdx] = { ...links[lIdx], label: e.target.value };
                                                updated[wIdx] = { ...updated[wIdx], links };
                                                updateWidgets(updated);
                                              }}
                                              className="w-full bg-muted/60 border border-border rounded-lg p-2 text-xs text-foreground font-semibold outline-none focus:border-primary"
                                            />
                                          </div>

                                          <div>
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Target Page / URL</label>
                                            <div className="space-y-1">
                                              <select
                                                value={l.url || ""}
                                                onChange={(e) => {
                                                  const selectedUrl = e.target.value;
                                                  if (!selectedUrl) return;
                                                  const updated = [...currentWidgets];
                                                  const links = [...updated[wIdx].links];

                                                  let newLabel = links[lIdx].label || "";
                                                  const matched = allAvailablePages.find(p => p.url === selectedUrl);
                                                  if (matched && (!newLabel.trim() || newLabel === "Link Title" || newLabel === "New Link")) {
                                                    newLabel = matched.title;
                                                  }

                                                  links[lIdx] = { ...links[lIdx], url: selectedUrl, label: newLabel };
                                                  updated[wIdx] = { ...updated[wIdx], links };
                                                  updateWidgets(updated);
                                                }}
                                                className="w-full bg-muted/60 border border-border rounded-lg p-2 text-xs text-foreground font-bold outline-none cursor-pointer focus:border-primary"
                                              >
                                                <option value="">-- Select Store Page --</option>
                                                <optgroup label="Main Store Pages">
                                                  <option value="/">🏠 Home Page ( / )</option>
                                                  <option value="/pages/all">🛍️ All Products Catalog ( /pages/all )</option>
                                                  <option value="/pages/collections">🏷️ All Categories ( /pages/collections )</option>
                                                  <option value="/cart">🛒 Shopping Cart ( /cart )</option>
                                                </optgroup>
                                                {pages.length > 0 && (
                                                  <optgroup label="Store Content & Policy Pages">
                                                    {pages.map((p: any) => {
                                                      const pageUrl = `/pages/${p.slug}`;
                                                      return (
                                                        <option key={p._id} value={pageUrl}>
                                                          📄 {p.title} ({pageUrl})
                                                        </option>
                                                      );
                                                    })}
                                                  </optgroup>
                                                )}
                                              </select>

                                              <input
                                                type="text"
                                                value={l.url || ""}
                                                placeholder="Or type custom URL..."
                                                onChange={(e) => {
                                                  const updated = [...currentWidgets];
                                                  const links = [...updated[wIdx].links];
                                                  links[lIdx] = { ...links[lIdx], url: e.target.value };
                                                  updated[wIdx] = { ...updated[wIdx], links };
                                                  updateWidgets(updated);
                                                }}
                                                className="w-full bg-muted/30 border border-border rounded-lg p-1.5 text-[11px] text-muted-foreground font-mono outline-none"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dynamic Block Editor for Generic Blocks */}
              {activeSection && activeBlockType && ![
                "header", "hero", "badges", "categories", "best-products",
                "customize-1", "customize-2", "testimonials", "celebrity-reviews",
                "footer", "custom-html"
              ].includes(activeSection) && !activeSection.includes("-copy-") && (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <Wrench size={32} className="mb-4 text-primary" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Dynamic Block</h3>
                    <p className="text-sm">You are inspecting the <strong className="text-primary">{activeBlockType}</strong> block ({activeSection}).</p>
                    <p className="text-xs mt-4">In a complete setup, specific settings for this dynamic block would appear here.</p>
                  </div>
                )}

            </div>
          )}

        </div>

      </div>
    );
  }
}

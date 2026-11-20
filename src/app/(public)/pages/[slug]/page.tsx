import { getPageBySlug } from "@/server/repositories/pageRepository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles, Star, Mail, Quote, Users, Image as ImageIcon, Tag, ShieldCheck, Truck, Shield, Leaf, Award } from "lucide-react";
import BlockRenderer from "@/components/storefront/BlockRenderer";
import { getCustomSections } from "@/server/repositories/customSectionRepository";
import { buildMetadata } from "@/lib/seo/build-metadata";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";

export const revalidate = 600; // Cache for 10 minutes

function getFallbackPage(slug: string) {
  const clean = slug.toLowerCase().trim();

  if (clean === "about" || clean === "about-us" || clean === "about-brand" || clean === "story" || clean === "our-story") {
    return {
      title: "About Us",
      slug: clean,
      seo: {
        metaTitle: "About Us | The Art of Haute Parfumerie & Pure Extrait",
        metaDescription: "Discover the heritage, passion, and master craftsmanship behind our artisanal perfume collection."
      },
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
        },
        {
          blockType: "faq",
          blockData: {
            heading: "Artisanal Perfumery Questions",
            items: [
              { question: "What makes Extrait de Parfum superior to Eau de Parfum?", answer: "Extrait de Parfum features a 30% to 35% pure fragrance oil concentration compared to 15% to 20% in standard EDP. This delivers richer scent projection, less alcohol evaporation, and 14 to 16+ hours of luxurious longevity on skin." },
              { question: "How does our house source rare perfumery ingredients?", answer: "We partner directly with generational farmers and ethical wild harvesters across Kashmir for pure saffron, Assam and Cambodia for aged agarwood, and Grasse for rare floral absolutes." }
            ]
          }
        }
      ]
    };
  }

  if (clean === "contact" || clean === "contact-us" || clean === "support" || clean === "help") {
    return {
      title: "Contact Us",
      slug: clean,
      seo: {
        metaTitle: "Contact Us | Fragrance Concierge & Client Support",
        metaDescription: "Connect with our master fragrance specialists for bespoke recommendations, order tracking, and client care."
      },
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Fragrance Concierge & Client Support",
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
    };
  }

  if (clean === "faq" || clean === "faqs" || clean === "help-center" || clean === "questions") {
    return {
      title: "Frequently Asked Questions",
      slug: clean,
      seo: {
        metaTitle: "FAQ & Fragrance Guide | Customer Care",
        metaDescription: "Find answers to frequently asked questions about perfume concentration, longevity, application tips, and deliveries."
      },
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
    };
  }

  if (clean === "shipping-and-delivery" || clean === "shipping-policy" || clean === "shipping" || clean === "delivery") {
    return {
      title: "Shipping & Delivery Policy",
      slug: clean,
      seo: {
        metaTitle: "Shipping & Delivery Policy | Express Tracked Dispatch",
        metaDescription: "Review our worldwide shipping guidelines, transit timelines, tracking instructions, and package care."
      },
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Shipping & Delivery Guidelines",
            content: "<h3>1. Processing & Handling</h3><p>Every bottle is individually inspected, carefully padded in protective luxury packaging, and dispatched within <strong>24 to 48 business hours</strong> of order confirmation.</p><h3>2. Delivery Timelines</h3><p><strong>Domestic Standard Delivery:</strong> 2 to 4 Business Days<br/><strong>Express Priority Courier:</strong> 1 to 2 Business Days<br/><strong>International Air Freight:</strong> 4 to 7 Business Days</p><h3>3. Real-Time Tracking</h3><p>Once your order leaves our facility, you will receive an automatic tracking code via SMS, WhatsApp, and email to monitor your parcel in real-time.</p><h3>4. Customs & Transit Insurance</h3><p>All parcels are dispatched with full transit coverage to guarantee secure, pristine arrival.</p>"
          }
        }
      ]
    };
  }

  if (clean === "return-refund-policy" || clean === "refund-policy" || clean === "returns" || clean === "refunds" || clean === "return-policy") {
    return {
      title: "Return & Refund Policy",
      slug: clean,
      seo: {
        metaTitle: "Return & Refund Policy | 15-Day Client Guarantee",
        metaDescription: "Read our hassle-free return criteria, bottle exchange options, and fast refund processing timelines."
      },
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "15-Day Client Satisfaction Guarantee",
            content: "<h3>1. Returns & Exchanges</h3><p>We want you to love your signature scent. If you are not completely satisfied, you may return unopened bottles in their original sealed luxury packaging within <strong>15 days of delivery</strong> for a full refund or exchange.</p><h3>2. Damaged or Defective Items</h3><p>In the unlikely event that your perfume arrives damaged in transit, contact us immediately with a photo, and our team will courier an immediate complimentary replacement.</p><h3>3. Refund Processing</h3><p>Upon receipt and inspection, refunds are processed within <strong>2 to 4 business days</strong> directly to your original payment method.</p>"
          }
        }
      ]
    };
  }

  if (clean === "terms-of-service" || clean === "terms" || clean === "terms-and-conditions" || clean === "tos") {
    return {
      title: "Terms & Conditions",
      slug: clean,
      seo: {
        metaTitle: "Terms & Conditions | Client Agreement",
        metaDescription: "Official terms and conditions governing purchases, authentic guarantees, and store usage."
      },
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Terms & Conditions of Service",
            content: "<h3>1. Acceptance of Terms</h3><p>By placing an order on our store, you agree to these Terms and Conditions and our client service guidelines.</p><h3>2. Authentic Product Guarantee</h3><p>We guarantee that 100% of the perfumes, extracts, and luxury goods offered on our site are authentic, original creations crafted to the highest quality standards.</p><h3>3. Order Confirmation & Fulfillment</h3><p>All orders are confirmed via automated email and SMS. We reserve the right to cancel or hold suspicious or unverified orders to protect our clients against fraudulent activities.</p>"
          }
        }
      ]
    };
  }

  if (clean === "privacy-policy" || clean === "privacy" || clean === "privacy-statement") {
    return {
      title: "Privacy Policy",
      slug: clean,
      seo: {
        metaTitle: "Privacy & Cookie Policy | Bank-Grade Data Protection",
        metaDescription: "Learn how we safeguard your personal information, encrypted payments, and client confidentiality."
      },
      blocks: [
        {
          blockType: "rich-text",
          blockData: {
            heading: "Privacy & Data Protection Standards",
            content: "<h3>1. Information Confidentiality</h3><p>We respect your privacy and never sell or rent your personal information to third parties. Data collected is strictly used to fulfill your orders and tailor your luxury shopping experience.</p><h3>2. 256-Bit SSL Encryption</h3><p>All transactions and sensitive information are processed over bank-grade 256-bit SSL encrypted connections directly with certified payment gateways.</p><h3>3. Account Controls</h3><p>You maintain full ownership of your data and can request deletion or export of your account records at any time through our client support team.</p>"
          }
        }
      ]
    };
  }

  if (clean === "certificates-and-awards" || clean === "certificates" || clean === "awards" || clean === "accreditations") {
    return {
      title: "Certificates & Awards",
      slug: clean,
      seo: {
        metaTitle: "Certificates & Awards | Artisanal Excellence",
        metaDescription: "View our IFRA certifications, ethical sustainability accreditations, and industry awards."
      },
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Certificates & Artisanal Accreditations",
            subheading: "Commitment to IFRA international standards, ethical botanical sourcing, and master perfumery.",
            buttonText: "Explore Collection",
            buttonUrl: "/all"
          }
        },
        {
          blockType: "features",
          blockData: {
            heading: "Verified Accreditations",
            items: [
              { title: "IFRA Certified", desc: "100% compliant with global safety & dermatological standards", icon: "ShieldCheck" },
              { title: "Sustainably Harvested", desc: "Direct partnerships with wild harvesters & generational growers", icon: "Leaf" },
              { title: "Cruelty Free", desc: "Never tested on animals, organic formulations", icon: "Award" }
            ]
          }
        }
      ]
    };
  }

  if (clean === "testimonials" || clean === "reviews" || clean === "client-reviews" || clean === "stories") {
    return {
      title: "Testimonials",
      slug: clean,
      seo: {
        metaTitle: "Client Testimonials & Scent Stories",
        metaDescription: "Read real client impressions, reviews, and olfactory experiences from fragrance connoisseurs worldwide."
      },
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Loved by Connoisseurs Worldwide",
            subheading: "Read genuine impressions and scent memories shared by our global community.",
            buttonText: "Shop Signature Scents",
            buttonUrl: "/all"
          }
        }
      ]
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let page = await getPageBySlug(resolvedParams.slug);
  if (!page) {
    page = getFallbackPage(resolvedParams.slug) as any;
  }
  if (!page) return {};
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = `/pages/${page.slug}`;

  const metaTitle = page.seo?.metaTitle || page.title;
  const metaDescription = page.seo?.metaDescription || `Read the ${page.title} for our storefront.`;

  const baseMetadata = await buildMetadata({
    title: metaTitle,
    description: metaDescription,
    path
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      title: page.title,
      description: baseMetadata.description,
      url: `${baseUrl}${path}`,
      type: 'website',
    },
    twitter: {
      ...baseMetadata.twitter,
      card: 'summary',
      title: page.title,
      description: baseMetadata.description,
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  };
}

export default async function CustomPageViewer({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let page = await getPageBySlug(resolvedParams.slug);
  
  if (!page) {
    page = getFallbackPage(resolvedParams.slug) as any;
  }

  if (!page) {
    notFound();
  }

  const blocks = page.blocks || [];
  const customSections = await getCustomSections({ pageSlug: resolvedParams.slug });
  const sortedCustomSections = customSections.sort((a, b) => a.order - b.order);

  const mergedBlocks = [];
  let blockIdx = 0;
  let customIdx = 0;

  while (blockIdx < blocks.length || customIdx < sortedCustomSections.length) {
    if (customIdx < sortedCustomSections.length && sortedCustomSections[customIdx].order <= mergedBlocks.length) {
      mergedBlocks.push({
        blockType: sortedCustomSections[customIdx].blockType || "custom-html",
        blockData: sortedCustomSections[customIdx].blockData || {
          themeWrapper: (sortedCustomSections[customIdx] as any).themeWrapper || "none",
          htmlContent: (sortedCustomSections[customIdx] as any).htmlContent || ""
        }
      });
      customIdx++;
    } else if (blockIdx < blocks.length) {
      mergedBlocks.push(blocks[blockIdx]);
      blockIdx++;
    } else {
      mergedBlocks.push({
        blockType: sortedCustomSections[customIdx].blockType || "custom-html",
        blockData: sortedCustomSections[customIdx].blockData || {
          themeWrapper: (sortedCustomSections[customIdx] as any).themeWrapper || "none",
          htmlContent: (sortedCustomSections[customIdx] as any).htmlContent || ""
        }
      });
      customIdx++;
    }
  }

  const { backgroundColor, textColor } = (page as any).themeConfig || {};

  const customContainerStyle = backgroundColor ? { backgroundColor } : {};
  const customTextStyle = textColor ? { color: textColor } : {};
  
  let containerClass = `min-h-screen pt-24 pb-32 flex flex-col relative overflow-hidden bg-background transition-colors duration-500`;

  return (
    <div className={containerClass} style={customContainerStyle}>
      {/* Flagship Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[0%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full mb-6">
        <Breadcrumbs items={[{ label: page.title }]} />
      </div>

      {/* Page Title Header (Standard header for CMS pages if no hero block is first) */}
      {(!mergedBlocks.length || mergedBlocks[0]?.blockType !== "hero") && (
        <section className="relative py-16 px-6 overflow-hidden z-10 border-b border-border/40">
          <div className="relative z-10 max-w-[90rem] mx-auto text-center">
            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
              {page.title}
            </h1>
            <p className={`text-sm font-medium font-mono ${!textColor ? 'text-muted-foreground' : ''}`} style={textColor ? { color: textColor, opacity: 0.7 } : {}}>
              /pages/{page.slug}
            </p>
          </div>
        </section>
      )}

      {/* Render Blocks dynamically */}
      <div className="relative z-10">
        <BlockRenderer blocks={mergedBlocks} />
      </div>
    </div>
  );
}


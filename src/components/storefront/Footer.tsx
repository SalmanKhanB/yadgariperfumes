"use client";

import Link from "next/link";
import SmartLink from "./SmartLink";
import { ArrowRight, Hexagon } from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa6";                            
import NewsletterForm from "./NewsletterForm";
import { PaymentBadgesGrid } from "./PaymentBadges";

export default function Footer({ settings }: { settings: any }) {
  const defaultWidgets = [
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

  const widgets = (settings.footerWidgets && settings.footerWidgets.length > 0)
    ? settings.footerWidgets
    : defaultWidgets;

  const year = new Date().getFullYear();
  const name = settings.name || "Storefront";

  const showBrand = settings.footerStyle?.showBrand !== false;
  const showLinks = settings.footerStyle?.showLinks !== false;
  const showNewsletter = settings.footerStyle?.showNewsletter !== false;
  const showEmail = settings.footerStyle?.showEmail !== false;
  const showPhone = settings.footerStyle?.showPhone !== false;
  const showAddress = settings.footerStyle?.showAddress !== false;
  const showSocials = settings.footerStyle?.showSocials !== false;
  const showCopyright = settings.footerStyle?.showCopyright !== false;
  const showPaymentBadges = settings.footerStyle?.showPaymentBadges !== false;

  const showInstagram = settings.footerStyle?.showInstagram !== false;
  const showTwitter = settings.footerStyle?.showTwitter !== false;
  const showFacebook = settings.footerStyle?.showFacebook !== false;
  const showTiktok = settings.footerStyle?.showTiktok !== false;
  const showYoutube = settings.footerStyle?.showYoutube !== false;
  const showWhatsapp = settings.footerStyle?.showWhatsapp !== false;

  const hasAnySocial = !!(
    (showInstagram && settings.socialLinks?.instagram) ||
    (showTwitter && settings.socialLinks?.twitter) ||
    (showFacebook && settings.socialLinks?.facebook) ||
    (showTiktok && settings.socialLinks?.tiktok) ||
    (showYoutube && settings.socialLinks?.youtube) ||
    (showWhatsapp && settings.socialLinks?.whatsapp)
  );

  const hasRightColumn = showNewsletter || (showEmail && !!settings.contact?.email) || (showPhone && !!settings.contact?.phone) || (showAddress && !!settings.physicalAddress) || (showSocials && hasAnySocial);
  const hasCenterColumn = showLinks && widgets.length > 0;
  const hasLeftColumn = showBrand;

  // Compute column spans
  let leftColClass = "md:col-span-4 lg:col-span-3 pr-0 md:pr-8 md:border-r border-[#F4F1EA]/10";
  let centerColClass = "md:col-span-5 lg:col-span-6 px-0 md:px-8 md:border-r border-[#F4F1EA]/10";
  let rightColClass = "md:col-span-3 pl-0 md:pl-8";

  if (!hasRightColumn && hasLeftColumn && hasCenterColumn) {
    leftColClass = "md:col-span-4 lg:col-span-4 pr-0 md:pr-8 md:border-r border-[#F4F1EA]/10";
    centerColClass = "md:col-span-8 lg:col-span-8 pl-0 md:pl-8";
  } else if (!hasLeftColumn && hasCenterColumn && hasRightColumn) {
    centerColClass = "md:col-span-8 lg:col-span-8 pr-0 md:pr-8 md:border-r border-[#F4F1EA]/10";
    rightColClass = "md:col-span-4 lg:col-span-4 pl-0 md:pl-8";
  } else if (!hasCenterColumn && hasLeftColumn && hasRightColumn) {
    leftColClass = "md:col-span-6 lg:col-span-6 pr-0 md:pr-8 md:border-r border-[#F4F1EA]/10";
    rightColClass = "md:col-span-6 lg:col-span-6 pl-0 md:pl-8";
  } else if (!hasCenterColumn && !hasLeftColumn && hasRightColumn) {
    rightColClass = "md:col-span-12 max-w-lg mx-auto";
  } else if (!hasRightColumn && !hasLeftColumn && hasCenterColumn) {
    centerColClass = "md:col-span-12";
  }

  return (
    <footer className="w-full bg-[#141210] text-[#F4F1EA] border-t border-[#F4F1EA]/10 pt-16">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-y-12">
        
        {/* Brand Column */}
        {hasLeftColumn && (
          <div className={leftColClass}>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity">
              {settings.logo ? (
                <img src={settings.logo} alt={name} className="h-7 w-auto object-contain" />
              ) : (
                <Hexagon className="w-6 h-6 text-[#F4F1EA]" />
              )}
              <span className="text-xl font-serif font-bold uppercase tracking-[0.08em]">{name}</span>
            </Link>
            <p className="text-sm sm:text-[15px] md:text-base text-[#F4F1EA]/85 leading-relaxed max-w-md">
              {settings.seoDefaults?.description || "Curated goods for the modern era."}
            </p>
          </div>
        )}

        {/* Links Columns */}
        {hasCenterColumn && (
          <div className={`${centerColClass} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8`}>
            {widgets.map((widget: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.15em] text-[#A98F5C] border-b border-[#F4F1EA]/10 pb-2">
                  {widget.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {(widget.links || []).map((link: any, i: number) => (
                    <li key={i}>
                      <SmartLink href={link.url || "#"} className="text-xs md:text-sm uppercase tracking-wider text-[#F4F1EA]/85 hover:text-[#A98F5C] transition-colors block truncate font-medium">
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter & Contact Column */}
        {hasRightColumn && (
          <div className={rightColClass}>
            {showNewsletter && (
              <div className="space-y-4">
                <h4 className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.15em] text-[#A98F5C]">
                  {settings.footerStyle?.newsletterHeading || "Newsletter"}
                </h4>
                {settings.footerStyle?.newsletterSubtitle && (
                  <p className="text-xs text-[#F4F1EA]/70 leading-relaxed -mt-2">
                    {settings.footerStyle.newsletterSubtitle}
                  </p>
                )}
                <NewsletterForm />
              </div>
            )}
            
            {/* Contact & Address */}
            {((showEmail && settings.contact?.email) || (showPhone && settings.contact?.phone) || (showAddress && settings.physicalAddress)) && (
              <div className={`${showNewsletter ? 'mt-8' : ''} flex flex-col gap-2 text-xs md:text-sm tracking-wider text-[#F4F1EA]/85`}>
                {showEmail && settings.contact?.email && (
                  <a href={`mailto:${settings.contact.email}`} className="normal-case lowercase hover:text-[#A98F5C] transition-colors">
                    {settings.contact.email}
                  </a>
                )}
                {showPhone && settings.contact?.phone && (
                  <a href={`tel:${settings.contact.phone}`} className="hover:text-[#A98F5C] transition-colors">
                    {settings.contact.phone}
                  </a>
                )}
                {showAddress && settings.physicalAddress && (
                  <p className="mt-2 text-[#F4F1EA]/70 leading-relaxed text-xs uppercase">
                    {settings.physicalAddress}
                  </p>
                )}
              </div>
            )}

            {/* Socials under newsletter */}
            {showSocials && hasAnySocial && (
              <div className="flex gap-4 flex-wrap mt-6">
                {showInstagram && settings.socialLinks?.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="Instagram">
                    <FaInstagram size={20} />
                  </a>
                )}
                {showTwitter && settings.socialLinks?.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="Twitter">
                    <FaTwitter size={20} />
                  </a>
                )}
                {showFacebook && settings.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="Facebook">
                    <FaFacebookF size={20} />
                  </a>
                )}
                {showTiktok && settings.socialLinks?.tiktok && (
                  <a href={settings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="TikTok">
                    <FaTiktok size={20} />
                  </a>
                )}
                {showYoutube && settings.socialLinks?.youtube && (
                  <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="YouTube">
                    <FaYoutube size={20} />
                  </a>
                )}
                {showWhatsapp && settings.socialLinks?.whatsapp && (
                  <a href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#F4F1EA]/60 hover:text-[#A98F5C] transition-colors" aria-label="WhatsApp">
                    <FaWhatsapp size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      {(showCopyright || (settings.footerLinks && settings.footerLinks.length > 0) || showPaymentBadges) && (
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 mt-16 py-6 border-t border-[#F4F1EA]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {showCopyright && (
              <p className="text-xs md:text-sm uppercase tracking-wider text-[#F4F1EA]/80">
                {settings.footerCopyright || settings.footerStyle?.copyrightText || `© ${year} ${name}.`}
              </p>
            )}
            {settings.footerLinks && settings.footerLinks.length > 0 && (
              <div className="flex flex-wrap gap-6 text-xs md:text-sm uppercase tracking-wider text-[#F4F1EA]/80">
                {settings.footerLinks.map((link: any, idx: number) => (
                  <Link key={idx} href={link.url} className="hover:text-[#F4F1EA] transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Official Payment Badges */}
          {showPaymentBadges && (() => {
            const pSection = settings?.paymentBadgesSection || { enabled: true, position: "footer" };
            const position = pSection.position || "footer";
            if (pSection.enabled === false || position === "banner" || position === "hidden") {
              return null;
            }
            return (
              <div className="w-full sm:w-auto overflow-hidden flex justify-center py-1">
                <PaymentBadgesGrid settings={pSection} />
              </div>
            );
          })()}
        </div>
      )}
    </footer>
  );
}

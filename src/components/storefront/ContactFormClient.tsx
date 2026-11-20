"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, Globe, Share2, ExternalLink } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import { submitContactFormAction } from "@/server/actions/siteSettingsActions";
import { trackMetaContact, setMetaUserData } from "@/lib/analytics/metaPixel";

export default function ContactFormClient({
  storeSettings,
  heading,
  subheading,
  customEmail,
  customPhone,
  customAddress,
  showDirectChannels = true
}: {
  storeSettings?: any;
  heading?: string;
  subheading?: string;
  customEmail?: string;
  customPhone?: string;
  customAddress?: string;
  showDirectChannels?: boolean;
}) {
  const [dynamicSettings, setDynamicSettings] = useState<any>(storeSettings || null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastMailtoUrl, setLastMailtoUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  useEffect(() => {
    if (!storeSettings) {
      fetch("/api/settings/public")
        .then((res) => res.json())
        .then((data) => {
          if (data) setDynamicSettings(data);
        })
        .catch(() => { });
    }
  }, [storeSettings]);

  const activeSettings = dynamicSettings || storeSettings;
  const storeName = activeSettings?.name || "Yadgari Perfumes";
  const email = customEmail || activeSettings?.contact?.email || activeSettings?.contactEmail || "info@yadgariperfumes.com";
  const phone = customPhone || activeSettings?.whatsappChatWidget?.phoneNumber || activeSettings?.contact?.phone || activeSettings?.contactPhone || "+92 300 123 4567";
  const address = customAddress || activeSettings?.physicalAddress || activeSettings?.storeAddress || "Dubai Marina, Luxury Tower Plaza, UAE";
  const businessHours = activeSettings?.businessHours || "Mon - Sun: 9:00 AM - 10:00 PM";
  const socialLinks = activeSettings?.socialLinks || {};

  const cleanPhoneForWa = (socialLinks.whatsapp || activeSettings?.whatsappChatWidget?.phoneNumber || phone || "").replace(/\D/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Prepare list of social links for email footer
    const socialLines = [
      socialLinks.instagram ? `Instagram: ${socialLinks.instagram}` : "",
      socialLinks.facebook ? `Facebook: ${socialLinks.facebook}` : "",
      socialLinks.whatsapp ? `WhatsApp: wa.me/${socialLinks.whatsapp.replace(/\D/g, "")}` : (cleanPhoneForWa ? `WhatsApp: wa.me/${cleanPhoneForWa}` : ""),
      socialLinks.twitter ? `Twitter/X: ${socialLinks.twitter}` : "",
      socialLinks.tiktok ? `TikTok: ${socialLinks.tiktok}` : "",
      socialLinks.youtube ? `YouTube: ${socialLinks.youtube}` : ""
    ].filter(Boolean).join("\n");

    // 1. Prepare dynamic mailto intent string
    const mailtoSubject = encodeURIComponent(`[${formData.subject || "Website Inquiry"}] ${formData.name} - ${storeName}`);
    const mailtoBody = encodeURIComponent(
      `Full Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone || "N/A"}\n\n` +
      `Message:\n${formData.message}\n\n` +
      `----------------------------------------\n` +
      `Store: ${storeName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Address: ${address}\n` +
      `${socialLines ? `\nFollow Us Online:\n${socialLines}\n` : ""}` +
      `----------------------------------------`
    );
    const mailtoUrl = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;
    setLastMailtoUrl(mailtoUrl);

    try {
      trackMetaContact({ method: "Website Contact Form" });
      setMetaUserData({ email: formData.email, phone: formData.phone, firstName: formData.name });
      await submitContactFormAction(formData);
    } catch (err: any) {
      // Fallback directly to mailto intent
    } finally {
      setLoading(false);
      setSubmitted(true);

      // 2. Open Email Client Intent automatically
      try {
        window.location.href = mailtoUrl;
      } catch (e) {
        // Fallback rendered in UI
      }
    }
  };

  return (
    <div className="max-w-[85rem] mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-bold uppercase tracking-widest">
          <MessageSquare size={14} /> Get In Touch
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground font-serif">
          {heading || "Contact Our Team"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {subheading || "Have a question about our products, orders, or custom luxury requests? We are here to assist you 24/7."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Direct Channels & Dynamic Socials */}
        {showDirectChannels && (
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-border/60 shadow-xl space-y-6 bg-card/60 backdrop-blur-md">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground border-b border-border/50 pb-4 font-serif">
                Direct Channels
              </h2>

              {/* Email Support */}
              <a
                href={`mailto:${email}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                  <Mail size={22} />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground block">
                    Email Support
                  </span>
                  <span className="text-sm sm:text-base font-bold text-foreground truncate block group-hover:text-primary transition-colors">
                    {email}
                  </span>
                  <span className="text-xs text-muted-foreground/80 block">
                    Click to open
                  </span>
                </div>
              </a>

              {/* Phone & WhatsApp */}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                  <Phone size={22} />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground block">
                    Phone & WhatsApp
                  </span>
                  <span className="text-sm sm:text-base font-bold text-foreground truncate block group-hover:text-primary transition-colors">
                    {phone}
                  </span>
                  <span className="text-xs text-muted-foreground/80 block">
                    {businessHours}
                  </span>
                </div>
              </a>

              {/* Location Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground block">
                    Boutique HQ
                  </span>
                  <span className="text-sm font-bold text-foreground block">
                    {address}
                  </span>
                </div>
              </div>



            </div>

            {/* Social Media Connect Section */}
            <div className="glass-panel p-8 rounded-3xl border border-border/60 shadow-xl space-y-5 bg-card/60 backdrop-blur-md">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                <Globe size={16} className="text-primary" /> Follow Us On Social Media
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Instagram */}
                <a
                  href={socialLinks.instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                >
                  <FaInstagram className="w-4 h-4 text-pink-500 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider truncate">Instagram</span>
                </a>

                {/* Facebook */}
                <a
                  href={socialLinks.facebook || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                >
                  <FaFacebookF className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider truncate">Facebook</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={socialLinks.twitter || "https://twitter.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                >
                  <FaXTwitter className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider truncate">Twitter / X</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={cleanPhoneForWa ? `https://wa.me/${cleanPhoneForWa}` : `https://wa.me/923001234567`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                >
                  <FaWhatsapp className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider truncate">WhatsApp</span>
                </a>

                {/* TikTok (if present) */}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                  >
                    <FaTiktok className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider truncate">TikTok</span>
                  </a>
                )}

                {/* YouTube (if present) */}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all hover:scale-[1.02]"
                  >
                    <FaYoutube className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider truncate">YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Interactive Contact Form */}
        <div className={showDirectChannels ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl mx-auto w-full"}>
          <div className="glass-panel p-8 sm:p-10 md:p-12 rounded-3xl border border-border/60 shadow-2xl bg-card/80 backdrop-blur-md">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground mb-2 font-serif">
              Send A Message
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-8">
              Fill out the form below and our support concierge will get back to you promptly.
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
                ⚠ {errorMsg}
              </div>
            )}

            {submitted ? (
              <div className="p-8 sm:p-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-5 my-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase text-foreground font-serif">Message Prepared & Sent!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2">
                    Your inquiry has been recorded and your default email app was launched with pre-filled details for <strong className="text-foreground font-bold">{email}</strong>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {lastMailtoUrl && (
                    <a
                      href={lastMailtoUrl}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Mail size={16} /> Open In Email App
                    </a>
                  )}

                  <a
                    href={`https://wa.me/${cleanPhoneForWa || "923001234567"}?text=${encodeURIComponent(`Hello! I submitted a message on ${storeName}:\n\nSubject: ${formData.subject}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "N/A"}\n\nMessage:\n${formData.message}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <FaWhatsapp size={16} /> Send via WhatsApp
                  </a>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
                    }}
                    className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alexander Vance"
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alexander@example.com"
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Tracking">Order & Tracking Status</option>
                      <option value="Fragrance Consultation">Custom Fragrance Consultation</option>
                      <option value="Wholesale & Corporate">Wholesale & Corporate Gifting</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you with our luxury perfume collection today?"
                    className="w-full bg-background border border-border/80 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sending Inquiry...</span>
                  ) : (
                    <>
                      <Send size={16} /> Send Message & Launch Email App
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

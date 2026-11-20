"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle, Sparkles, CheckCheck, Smile } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

interface WhatsAppChatWidgetProps {
  settings?: {
    name?: string;
    logo?: string;
    socialLinks?: {
      whatsapp?: string;
    };
    contact?: {
      phone?: string;
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
  };
}

export default function WhatsAppChatWidget({ settings }: WhatsAppChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const widgetConfig = settings?.whatsappChatWidget;
  const isEnabled = widgetConfig?.enabled ?? true;

  const rawNumber = widgetConfig?.phoneNumber || settings?.socialLinks?.whatsapp || settings?.contact?.phone || "923001234567";
  const whatsappNumber = rawNumber.replace(/[^0-9]/g, "") || "923001234567";
  const storeName = settings?.name || "Yadgari Perfumes";
  const greetingTitle = widgetConfig?.greetingTitle || `Hello! 👋 Welcome to ${storeName}`;
  const greetingMessage = widgetConfig?.greetingMessage || "How can we help you today? Let us know what you need or pick an option below.";
  const onlineStatusText = widgetConfig?.onlineStatusText || "Typically replies in minutes";
  const position = widgetConfig?.position || "bottom-right";
  const showNotificationBadge = widgetConfig?.showNotificationBadge ?? true;
  
  const defaultPrompts = [
    "📦 Track My Order",
    "💎 Scent Advice",
    "🚚 Delivery & COD"
  ];
  const quickPrompts = (widgetConfig?.quickPrompts && widgetConfig.quickPrompts.length > 0) 
    ? widgetConfig.quickPrompts 
    : defaultPrompts;

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  if (!isEnabled) {
    return null;
  }

  const isLeft = position === "bottom-left";
  const positionClasses = isLeft 
    ? "fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 select-none print:hidden" 
    : "fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none print:hidden";
  const dialogPositionClasses = isLeft 
    ? "absolute bottom-16 left-0 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-200"
    : "absolute bottom-16 right-0 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-200";

  useEffect(() => {
    if (isOpen) {
      setHasInteracted(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();
    const finalMessage = trimmed 
      ? `Hello ${storeName}, I have an inquiry: ${trimmed}`
      : `Hello ${storeName}, I would like to inquire about your products and orders.`;

    const encoded = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setMessage("");
    setIsOpen(false);
  };

  const handleQuickPrompt = (promptText: string) => {
    setMessage(promptText);
    const finalMessage = `Hello ${storeName}, ${promptText}`;
    const encoded = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className={positionClasses}>
      {/* FLOATING CHAT DIALOG */}
      {isOpen && (
        <div 
          className={dialogPositionClasses}
          style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
        >
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] dark:bg-[#128C7E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                  {settings?.logo ? (
                    <img src={settings.logo} alt={storeName} className="w-full h-full object-cover" />
                  ) : (
                    <FaWhatsapp size={24} className="text-white" />
                  )}
                </div>
                {/* Online pulse green dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  {storeName}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                </h3>
                <p className="text-[11px] text-white/80 font-normal mt-0.5">
                  {onlineStatusText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close WhatsApp chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Bubble Area */}
          <div className="p-4 bg-muted/30 dark:bg-card/50 min-h-[190px] max-h-[260px] overflow-y-auto space-y-3 flex flex-col justify-end">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 bg-muted/60 px-2.5 py-1 rounded-full">
                TODAY
              </span>
            </div>

            {/* Inbound Agent Message Bubble */}
            <div className="flex items-start gap-2 max-w-[90%]">
              <div className="bg-background dark:bg-[#1f2c34] text-foreground p-3 rounded-2xl rounded-tl-xs shadow-xs border border-border/50 text-xs sm:text-[13px] leading-relaxed">
                <p className="font-medium text-foreground">
                  {greetingTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {greetingMessage}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-muted-foreground/60">
                  <span>{currentTime || "Just now"}</span>
                </div>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            {quickPrompts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-background hover:bg-muted border border-border text-foreground/80 hover:text-foreground transition-all cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-background border-t border-border flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message on WhatsApp..."
              className="flex-1 px-3.5 py-2.5 bg-muted/60 border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#25D366]"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              title="Send via WhatsApp"
              aria-label="Send via WhatsApp"
            >
              <Send size={16} className="translate-x-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X size={26} className="text-white transition-transform duration-200 rotate-0 group-hover:rotate-90" />
        ) : (
          <>
            <FaWhatsapp size={32} className="text-white" />
            {/* Unread badge badge if enabled and not interacted yet */}
            {showNotificationBadge && !hasInteracted && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-background shadow-sm animate-bounce">
                1
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}

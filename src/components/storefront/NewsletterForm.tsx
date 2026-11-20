"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { subscribeToNewsletter } from "@/server/actions/newsletter";
import { trackMetaLead, setMetaUserData } from "@/lib/analytics/metaPixel";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        trackMetaLead({ content_name: "Newsletter Signup", currency: "AED" });
        setMetaUserData({ email });
        setStatusMsg({ text: "Subscribed to newsletter!", type: "success" });
        toast.success("Subscribed to newsletter!");
        setEmail("");
      } else {
        setStatusMsg({ text: res.error || "Failed to subscribe", type: "error" });
        toast.error(res.error || "Failed to subscribe");
      }
    } catch (error) {
      setStatusMsg({ text: "An unexpected error occurred", type: "error" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center w-full border-b border-[#F4F1EA]/20 group focus-within:border-[#A98F5C] transition-colors"
      >
        <input 
          type="email" 
          placeholder="YOUR EMAIL" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (statusMsg) setStatusMsg(null);
          }}
          className="w-full bg-transparent py-3 text-[11px] font-mono tracking-widest uppercase text-[#F4F1EA] focus:outline-none placeholder:text-[#F4F1EA]/40"
          required
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="absolute right-0 text-[#F4F1EA]/40 group-focus-within:text-[#A98F5C] hover:text-[#A98F5C] transition-colors disabled:opacity-50"
          aria-label="Subscribe"
        >
          <ArrowRight size={16} strokeWidth={1} />
        </button>
      </form>
      {statusMsg && (
        <p className={`mt-2 text-[10px] font-mono tracking-widest uppercase ${statusMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {statusMsg.text}
        </p>
      )}
    </div>
  );
}

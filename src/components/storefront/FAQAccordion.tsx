"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className="border-b border-border/50 group"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-6 text-left focus:outline-none transition-opacity hover:opacity-80"
              aria-expanded={isOpen}
            >
              <span className={`font-serif text-lg md:text-xl transition-colors ${isOpen ? 'text-accent' : 'text-foreground'} pr-8`}>{item.question}</span>
              <ChevronDown 
                size={20} 
                strokeWidth={1}
                className={`text-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="pb-8 text-muted-foreground leading-relaxed font-sans text-sm md:text-base">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

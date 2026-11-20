"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  textColor?: string;
}

const AccordionItem = ({ title, content, isOpen, onClick, textColor }: AccordionItemProps) => (
  <div className="border-b border-border">
    <button
      className="flex justify-between items-center w-full py-4.5 text-left transition-colors hover:text-accent group cursor-pointer"
      onClick={onClick}
    >
      <span 
        className={`font-sans font-semibold tracking-[0.14em] uppercase text-xs sm:text-[13px] ${!textColor ? 'text-foreground group-hover:text-accent transition-colors' : ''}`}
        style={textColor ? { color: textColor } : {}}
      >
        {title}
      </span>
      <ChevronDown 
        size={18} 
        className={`transition-transform duration-300 group-hover:text-accent shrink-0 ${isOpen ? 'rotate-180' : ''} ${!textColor ? 'text-muted-foreground' : ''}`} 
        style={textColor ? { color: textColor, opacity: 0.7 } : {}}
      />
    </button>
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mb-5' : 'max-h-0 opacity-0'}`}
    >
      <div>
        {content}
      </div>
    </div>
  </div>
);

interface ProductDetailsAccordionProps {
  description?: string;
  nativeDescription?: string;
  materials?: string;
  textColor?: string;
  descriptionTabs?: { title: string; points: string[] }[];
}

export default function ProductDetailsAccordion({ description, nativeDescription, materials, textColor, descriptionTabs }: ProductDetailsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  const textStyle = textColor ? { color: textColor, opacity: 0.9 } : {};
  const textClass = `leading-relaxed text-[13px] sm:text-sm md:text-[15px] font-sans font-normal tracking-normal ${!textColor ? 'text-foreground/85' : ''}`;

  let currentIndex = 0;

  return (
    <div className="w-full pt-2 mt-6">
      {/* 1. Native Description (Above Product Description & Open By Default) */}
      {nativeDescription && (() => {
        const itemIdx = currentIndex++;
        return (
          <AccordionItem
            key="native-desc"
            title="Native Description"
            isOpen={openIndex === itemIdx}
            onClick={() => toggleItem(itemIdx)}
            textColor={textColor}
            content={
              <p className={`${textClass} whitespace-pre-wrap leading-relaxed`} style={textStyle}>
                {nativeDescription}
              </p>
            }
          />
        );
      })()}

      {/* 2. Product Description */}
      {description && (() => {
        const itemIdx = currentIndex++;
        return (
          <AccordionItem
            key="product-desc"
            title="Product Description"
            isOpen={openIndex === itemIdx}
            onClick={() => toggleItem(itemIdx)}
            textColor={textColor}
            content={
              <div className={textClass} style={textStyle}>
                <p className="whitespace-pre-wrap leading-relaxed">{description}</p>
              </div>
            }
          />
        );
      })()}

      {/* 3. Custom Description Tabs (Key Benefits, Ingredients, etc.) */}
      {descriptionTabs && descriptionTabs.length > 0 && descriptionTabs.map((tab, tIdx) => {
        const itemIdx = currentIndex++;
        return (
          <AccordionItem
            key={`tab-${tIdx}`}
            title={tab.title}
            isOpen={openIndex === itemIdx}
            onClick={() => toggleItem(itemIdx)}
            textColor={textColor}
            content={
              <ul className={`list-disc list-inside space-y-2 ${textClass}`} style={textStyle}>
                {tab.points.map((pt, pIdx) => (
                  <li key={pIdx} className="leading-relaxed">
                    {pt}
                  </li>
                ))}
              </ul>
            }
          />
        );
      })}

      {/* 4. Materials / Ingredients */}
      {materials && (() => {
        const itemIdx = currentIndex++;
        return (
          <AccordionItem
            key="materials"
            title="Ingredients & Notes"
            isOpen={openIndex === itemIdx}
            onClick={() => toggleItem(itemIdx)}
            textColor={textColor}
            content={
              <div className={textClass} style={textStyle}>
                <p className="whitespace-pre-wrap leading-relaxed">{materials}</p>
              </div>
            }
          />
        );
      })()}
    </div>
  );
}

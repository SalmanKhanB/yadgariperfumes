"use client";

import { Star } from "lucide-react";

export function ThemePreview({ config, defaultHeading = "Sample Heading", defaultSubheading = "Sample Subheading" }: { config: any, defaultHeading?: string, defaultSubheading?: string }) {
  const { theme, heading, subheading, backgroundColor, textColor } = config;
  
  const displayHeading = heading || defaultHeading;
  const displaySubheading = subheading !== undefined ? subheading : defaultSubheading;

  let containerClass = "py-16 border-t border-border h-full transition-colors duration-500 ";
  if (!backgroundColor) {
    containerClass += "bg-muted/20 ";
  }
  
  let headerClass = "flex flex-col items-center text-center mb-10 ";
  let headingClass = "text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 ";
  if (!textColor) {
    headingClass += "text-foreground ";
  }
  
  let subheadingClass = "max-w-xl text-sm ";
  if (!textColor) {
    subheadingClass += "text-muted-foreground ";
  }
  
  let gridContainerClass = "grid grid-cols-4 gap-4";

  if (theme === "aurora") {
    containerClass = `relative overflow-hidden py-16 h-full transition-colors duration-500 ${!backgroundColor ? 'bg-neutral-950' : ''}`;
    headingClass = `text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 drop-shadow-2xl relative z-10 ${!textColor ? 'text-white' : ''}`;
    subheadingClass = `font-medium max-w-xl text-sm relative z-10 ${!textColor ? 'text-white/80' : ''}`;
  } else if (theme === "cyberpunk") {
    containerClass = `py-16 font-mono border-y-4 border-[#0f0] h-full transition-colors duration-500 ${!backgroundColor ? 'bg-black' : ''}`;
    headingClass = `text-4xl font-bold uppercase tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] ${!textColor ? 'text-[#0f0]' : ''}`;
    subheadingClass = `max-w-xl p-3 text-xs border border-[#0f0]/30 ${!backgroundColor ? 'bg-black/50' : ''} ${!textColor ? 'text-white' : ''}`;
  } else if (theme === "glassmorphism") {
    containerClass = "py-16 max-w-5xl mx-auto px-4 h-full transition-colors duration-500";
    headerClass = `backdrop-blur-xl border border-border/50 p-8 rounded-[1.5rem] shadow-xl flex flex-col items-center text-center mb-8 transition-colors duration-500 ${!backgroundColor ? 'bg-background/40' : ''}`;
    headingClass = `text-3xl md:text-5xl font-black uppercase tracking-tight mb-2 ${!textColor ? 'text-foreground' : ''}`;
  } else if (theme === "minimalist") {
    containerClass = `py-24 px-6 h-full transition-colors duration-500 ${!backgroundColor ? 'bg-background' : ''}`;
    headingClass = `text-5xl md:text-[5rem] font-black uppercase tracking-tighter leading-[0.85] mb-6 ${!textColor ? 'text-foreground' : ''}`;
    subheadingClass = `text-lg font-medium max-w-md ${!textColor ? 'text-muted-foreground' : ''}`;
  } else if (theme === "editorial") {
    containerClass = `py-16 border-t border-foreground h-full transition-colors duration-500 ${!backgroundColor ? 'bg-background' : ''}`;
    headerClass = "flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-2 border-foreground pb-6";
    headingClass = `text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none m-0 ${!textColor ? 'text-foreground' : ''}`;
    subheadingClass = `text-sm max-w-sm text-left m-0 ${!textColor ? 'text-muted-foreground' : ''}`;
  } else if (theme === "grid-matrix") {
    containerClass = `relative overflow-hidden py-24 border-y border-neutral-800 h-full transition-colors duration-500 ${!backgroundColor ? 'bg-black' : ''}`;
    headingClass = `text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4 leading-tight z-10 relative ${!textColor ? 'text-white' : ''}`;
    subheadingClass = `text-sm uppercase tracking-widest max-w-2xl border-y border-neutral-800 py-3 z-10 relative ${!textColor ? 'text-neutral-400' : ''}`;
  }

  // Styles for overrides
  const customContainerStyle = backgroundColor && theme !== "glassmorphism" ? { backgroundColor } : {};
  const customHeaderStyle = backgroundColor && theme === "glassmorphism" ? { backgroundColor } : {};
  const customTextStyle = textColor ? { color: textColor } : {};

  // Mock Products
  const limit = config.limit ? Math.min(config.limit, 4) : 4;
  const mockProducts = Array.from({ length: limit }).map((_, i) => i);

  return (
    <div className={containerClass} style={customContainerStyle}>
      {theme === "aurora" && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        </>
      )}
      
      {theme === "grid-matrix" && (
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20 pointer-events-none">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-neutral-700" />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
        <div className={headerClass} style={customHeaderStyle}>
          <h2 className={headingClass} style={customTextStyle}>{displayHeading}</h2>
          {displaySubheading && <p className={subheadingClass} style={customTextStyle}>{displaySubheading}</p>}
        </div>

        <div className={gridContainerClass}>
          {mockProducts.map((i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted/30 border border-border flex items-center justify-center backdrop-blur-sm shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Star className="text-muted-foreground/50 z-10" size={32} />
               <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 text-center text-white text-xs font-bold uppercase tracking-widest">
                  View Product
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

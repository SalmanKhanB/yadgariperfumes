import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items, light = false }: { items: BreadcrumbItem[]; light?: boolean }) {
  const textClass = light ? "text-white/80" : "text-muted-foreground";
  const activeTextClass = light ? "text-white font-black drop-shadow-sm" : "text-foreground font-bold";
  const hoverClass = light ? "hover:text-white" : "hover:text-foreground";

  return (
    <nav className={`flex items-center space-x-1 md:space-x-2 text-xs md:text-sm font-medium uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap ${textClass}`}>
      <Link href="/" className={`${hoverClass} transition-colors flex items-center gap-1.5 shrink-0`}>
        <Home size={15} />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={14} className="shrink-0 mx-1 opacity-70" />
            {isLast || !item.href ? (
              <span className={`${activeTextClass} shrink-0 truncate max-w-[150px] sm:max-w-[200px]`} title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={`${hoverClass} transition-colors shrink-0 truncate max-w-[150px] sm:max-w-[200px]`} title={item.label}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

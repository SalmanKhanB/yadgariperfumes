"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <Link 
        href={createPageURL(Math.max(1, currentPage - 1))}
        className={`p-2 rounded-full border border-border flex items-center justify-center transition-colors ${currentPage <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-muted"}`}
      >
        <ChevronLeft size={20} />
      </Link>
      
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isCurrent = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <Link 
        href={createPageURL(Math.min(totalPages, currentPage + 1))}
        className={`p-2 rounded-full border border-border flex items-center justify-center transition-colors ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-muted"}`}
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-foreground">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          
          <Link 
            href="/search"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span>Search Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

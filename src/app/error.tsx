"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry here
    console.error("Application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-8">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            We encountered an unexpected error. Our team has been notified.
            Please try again or return home.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-muted text-muted-foreground rounded-lg text-left text-sm overflow-auto max-w-full">
              <p className="font-mono break-all">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-4 rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw size={18} />
            <span>Try Again</span>
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-none bg-secondary text-secondary-foreground font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <Home size={18} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

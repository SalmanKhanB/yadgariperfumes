"use client";

import { useEffect, useState } from "react";
import { verifyEmailAction } from "@/server/actions/customerAuthActions";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setResult({ success: false, error: "Invalid or missing verification token." });
        setIsVerifying(false);
        return;
      }
      
      try {
        const res = await verifyEmailAction(token);
        setResult(res as any);
      } catch (err) {
        setResult({ success: false, error: "An unexpected error occurred." });
      } finally {
        setIsVerifying(false);
      }
    }
    
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-6 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Email Verification</h1>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {isVerifying ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Verifying your email address...</p>
            </div>
          ) : result?.success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground text-sm mb-8">Thank you for verifying your email address. Your account is now fully active.</p>
              <Link 
                href="/account"
                className="w-full bg-foreground text-background py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] inline-block"
              >
                Go to Account
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground text-sm mb-8">{result?.error || "We couldn't verify your email address. The link may have expired."}</p>
              <Link 
                href="/account"
                className="w-full bg-secondary text-secondary-foreground py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                Continue to Account <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

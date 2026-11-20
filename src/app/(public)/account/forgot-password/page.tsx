"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/server/actions/customerAuthActions";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2, ArrowLeft } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-foreground text-background py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Sending...</span>
        </>
      ) : (
        "Send Reset Link"
      )}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [result, setResult] = useState<{ error?: string; success?: boolean; message?: string } | null>(null);

  async function action(formData: FormData) {
    const res = await forgotPasswordAction(null, formData);
    setResult(res as any);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-6 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <Link 
          href="/account/login" 
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {result?.success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground text-sm">{result.message}</p>
            </div>
          ) : (
            <form action={action} className="space-y-6">
              {result?.error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm font-medium border border-destructive/20 text-center animate-in slide-in-from-top-2">
                  {result.error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-foreground"
                />
              </div>

              <SubmitButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

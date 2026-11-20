"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail, AlertCircle, ShieldAlert, ArrowLeft, User } from "lucide-react";
import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  return (
    <div className="relative z-10 w-full max-w-md p-6">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-border shadow-2xl flex flex-col items-center">
        
        <div className="text-3xl font-black uppercase tracking-tighter mb-6 text-foreground flex items-center gap-1">
          SUPER<span className="text-primary">ADMIN</span><span className="text-accent">.</span>
        </div>

        <div className="text-center mb-6 w-full">
          <h1 className="text-2xl font-bold mb-2">Restricted Portal</h1>
          <p className="text-muted-foreground text-xs">Strictly for authorized Super Admin personnel only.</p>
        </div>

        {isUnauthorized && !state?.error && (
          <div className="w-full mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-600 dark:text-amber-400 text-xs font-medium leading-relaxed">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Super Admin Access Required</p>
              <p className="mt-0.5 text-muted-foreground">You must log in with a Super Admin account to access administrative tools.</p>
            </div>
          </div>
        )}

        <form action={formAction} className="w-full space-y-4">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-medium">
              <AlertCircle size={18} className="shrink-0" />
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={`w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 mt-2 font-bold text-background bg-foreground rounded-xl overflow-hidden transition-all shadow-lg ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            <span className="relative z-10 uppercase tracking-widest text-xs font-bold">
              {isPending ? 'Authenticating...' : 'Super Admin Login'}
            </span>
            {!isPending && <div className="absolute inset-0 h-full w-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border w-full flex flex-col items-center gap-3 text-xs text-muted-foreground">
          <Link href="/account/login" className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium">
            <User size={14} />
            Are you a customer? Go to Customer Login →
          </Link>
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            Back to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Lock, Mail, AlertCircle, UserPlus, User } from "lucide-react";
import { useActionState } from "react";
import { registerCustomerAction } from "@/server/actions/customerAuthActions";
import { trackMetaCompleteRegistration } from "@/lib/analytics/metaPixel";

export default function CustomerRegisterPage() {
  const [state, formAction, isPending] = useActionState(registerCustomerAction, undefined);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden pt-24 pb-16">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-card p-10 rounded-3xl border border-border shadow-2xl flex flex-col items-center">
          
          {/* Header */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <UserPlus size={24} className="text-primary" />
          </div>

          <div className="text-center mb-8 w-full">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Create Account</h1>
            <p className="text-muted-foreground text-sm">Join us and enjoy exclusive benefits and faster checkout.</p>
          </div>

          <form
            action={formAction}
            onSubmit={() => {
              trackMetaCompleteRegistration("email");
            }}
            className="w-full space-y-4"
          >
            
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="register-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="register-confirm-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  minLength={8}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {state?.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium">
                <AlertCircle size={18} />
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={`w-full group relative inline-flex items-center justify-center gap-4 px-8 py-4 mt-4 font-bold text-background bg-foreground rounded-xl overflow-hidden transition-all shadow-lg ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              <span className="relative z-10 uppercase tracking-widest text-sm">
                {isPending ? 'Creating Account...' : 'Create Account'}
              </span>
              {!isPending && <div className="absolute inset-0 h-full w-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/account/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

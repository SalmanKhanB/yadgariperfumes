"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/server/actions/customerAuthActions";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2, ArrowRight, Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full overflow-hidden group bg-foreground text-background py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Securing Account...</span>
        </>
      ) : (
        <>
          <span>Reset Password</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

export default function ResetPasswordClient() {
  const [result, setResult] = useState<{ error?: string; success?: boolean; message?: string } | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  
  // Calculate strength (0-4)
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"][strength] || "Weak";
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];
  const strengthColor = strength === 0 && password.length === 0 ? "bg-muted" : strengthColors[strength];

  async function action(formData: FormData) {
    if (!token) return;
    formData.append("token", token);
    const res = await resetPasswordAction(null, formData);
    setResult(res as any);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 relative overflow-hidden bg-background selection:bg-primary/30">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[0%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-[28rem] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="backdrop-blur-xl bg-background/60 border border-border/50 shadow-2xl rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          
          {/* Decorative Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          {!token ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                <AlertCircle size={36} />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Link Expired</h1>
              <p className="text-muted-foreground mb-8">This password reset link is invalid or has expired for your security.</p>
              <Link href="/account/forgot-password" className="inline-flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] group shadow-lg">
                Request New Link
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : result?.success ? (
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative transform rotate-3">
                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/20 animate-pulse" />
                <ShieldCheck size={44} className="animate-in zoom-in duration-500 delay-200" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-4">You're All Set!</h1>
              <p className="text-muted-foreground mb-10 text-base">{result.message}</p>
              <Link 
                href="/account/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group"
              >
                Continue to Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                  <KeyRound size={28} />
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-3">New Password</h1>
                <p className="text-muted-foreground text-sm">Almost there! Choose a new, strong password to secure your account.</p>
              </div>

              <form action={action} className="space-y-6">
                {result?.error && (
                  <div className="flex items-center gap-3 bg-destructive/10 text-destructive px-5 py-4 rounded-xl text-sm font-medium border border-destructive/20 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{result.error}</p>
                  </div>
                )}

                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-background/50 backdrop-blur-sm border-2 border-border/60 rounded-xl pl-11 pr-12 py-3.5 outline-none focus:border-primary transition-all text-foreground font-medium text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                      <div className="flex gap-1.5 h-1.5 mb-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-colors duration-500 ${strength > i ? strengthColor : 'bg-muted'}`} 
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest text-right ${strength > 2 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {strengthText}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 group/input2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input2:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      placeholder="Repeat new password"
                      className="w-full bg-background/50 backdrop-blur-sm border-2 border-border/60 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-primary transition-all text-foreground font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <SubmitButton />
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

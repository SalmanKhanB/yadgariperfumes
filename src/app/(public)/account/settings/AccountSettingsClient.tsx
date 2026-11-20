"use client";

import { useState, useRef } from "react";
import { updateCustomerProfileAction, updateCustomerPasswordAction, uploadCustomerAvatarAction } from "@/server/actions/customerAuthActions";
import { User, Lock, CheckCircle2, KeyRound, Loader2, Camera, Trash2, UploadCloud } from "lucide-react";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountSettingsClient({ user }: { user: any }) {
  const { update } = useSession();
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>(user.image || user.avatar || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ success: false, error: "Image size must be less than 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    setProfileMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadCustomerAvatarAction(formData);
    setIsUploadingAvatar(false);

    if (res.success && res.url) {
      setAvatarUrl(res.url);
      setProfileMessage({ success: true, message: "Profile photo uploaded! Click 'Save Profile Details' to apply." });
    } else {
      setProfileMessage({ success: false, error: res.error || "Failed to upload profile photo." });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setProfileMessage({ success: true, message: "Photo removed. Click 'Save Profile Details' to apply." });
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("image", avatarUrl);

    const res = await updateCustomerProfileAction(null, formData);
    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileMessage({ success: true, message: "Profile details & image updated successfully!" });
      try {
        await update({
          user: {
            name: (formData.get("name") as string) || user.name,
            image: avatarUrl,
          },
        });
        router.refresh();
      } catch (e) {}
    } else {
      setProfileMessage({ success: false, error: res.error || "Failed to update profile." });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateCustomerPasswordAction(null, formData);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordMessage({ success: true, message: "Password updated successfully!" });
      (e.target as HTMLFormElement).reset();
    } else {
      setPasswordMessage({ success: false, error: res.error || "Failed to update password." });
    }
  };

  const userInitial = (user.name || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">
        <div>
          <div className="mb-6">
            <Breadcrumbs items={[{ label: "My Account", href: "/account" }, { label: "Settings" }]} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your personal details, profile picture, and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="glass-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Profile Info</h2>
              </div>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>

            {profileMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-bold ${
                  profileMessage.success
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {profileMessage.message || profileMessage.error}
              </div>
            )}

            {/* Profile Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-background flex items-center justify-center shadow-inner relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-foreground/80 font-mono">
                      {userInitial}
                    </span>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-foreground text-background shadow-md hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                  title="Upload profile photo"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Profile Photo</h3>
                <p className="text-[11px] text-muted-foreground">
                  Upload a clear square JPG, PNG or WEBP image (max 5MB).
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud size={14} />
                    {isUploadingAvatar ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <input type="hidden" name="image" value={avatarUrl} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name || ""}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email || ""}
                  readOnly
                  className="w-full bg-muted/50 border border-border/60 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed select-none"
                />
                <span className="text-[10px] text-muted-foreground block">Email address cannot be changed directly.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone || ""}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile || isUploadingAvatar}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isUpdatingProfile ? <Loader2 size={16} className="animate-spin" /> : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="glass-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <KeyRound size={20} />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Change Password</h2>
            </div>

            {passwordMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-bold ${
                  passwordMessage.success
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {passwordMessage.message || passwordMessage.error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input type="hidden" name="email" value={user.email || ""} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="At least 8 characters"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

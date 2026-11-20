import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Reset Password",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center py-24 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

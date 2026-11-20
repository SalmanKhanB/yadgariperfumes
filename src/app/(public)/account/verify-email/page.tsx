import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Verify Email",
  description: "Verify your email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center py-24 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
